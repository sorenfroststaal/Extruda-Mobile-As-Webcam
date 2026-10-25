#pragma once
#include <windows.h>
#include <wincrypt.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <deque>
#include <array>
#include <vector>
#include <string>
#include <atomic>
#include <algorithm>
// One private pipe pair, a bounded queue and a job which kills the helper on exit.
// No sockets, model download, audio files or arbitrary command/path arguments.
class AudioFilter {
 HANDLE process=nullptr,job=nullptr,input=nullptr,output=nullptr,timer=nullptr;
 std::thread worker;std::mutex mutex;std::condition_variable changed;
 struct Block {std::array<short,960> pcm;unsigned epoch;};
 std::deque<Block> queue;std::deque<std::wstring> completed;
 std::atomic<bool> running{false};HWND window=nullptr;
 bool Read(void* data,DWORD bytes,DWORD timeout){
  auto p=static_cast<char*>(data);const auto start=GetTickCount64();
  while(bytes&&running){DWORD available=0;if(!PeekNamedPipe(output,nullptr,0,nullptr,&available,nullptr))return false;
   if(!available){if(GetTickCount64()-start>timeout)return false;
    if(timer){LARGE_INTEGER due;due.QuadPart=-10000;SetWaitableTimer(timer,&due,0,nullptr,nullptr,FALSE);WaitForSingleObject(timer,10);}else Sleep(1);continue;}
   DWORD n=0;if(!ReadFile(output,p,std::min(bytes,available),&n,nullptr)||!n)return false;p+=n;bytes-=n;
  }return !bytes;
 }
 void Run(){
  DWORD ready=0;bool ok=Read(&ready,4,15000)&&ready==0x44464E33;
  while(ok&&running){Block block;
   {std::unique_lock<std::mutex> lock(mutex);changed.wait(lock,[&]{return !running||!queue.empty();});if(!running)break;block=queue.front();queue.pop_front();}
   DWORD written=0;ok=WriteFile(input,block.pcm.data(),1920,&written,nullptr)&&written==1920&&Read(block.pcm.data(),1920,2000);
   if(!ok)break;
   DWORD count=0;CryptBinaryToStringW(reinterpret_cast<BYTE*>(block.pcm.data()),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,nullptr,&count);
   std::wstring encoded(count,L'\0');CryptBinaryToStringW(reinterpret_cast<BYTE*>(block.pcm.data()),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,encoded.data(),&count);encoded.resize(count&&encoded[count-1]==0?count-1:count);
   {std::lock_guard<std::mutex> lock(mutex);if(completed.size()<4)completed.push_back(L"window.extrudaFilteredAudio?.("+std::to_wstring(block.epoch)+L",'"+encoded+L"')");else ok=false;}
   PostMessageW(window,WM_APP+83,0,0);
  }
  if(!ok&&running)PostMessageW(window,WM_APP+83,1,0);
  running=false;
 }
public:
 ~AudioFilter(){Stop();}
 bool Start(HWND hwnd){
  Stop();window=hwnd;SECURITY_ATTRIBUTES sa{sizeof(sa),nullptr,TRUE};HANDLE readIn=nullptr,writeOut=nullptr;
  if(!CreatePipe(&readIn,&input,&sa,4096)||!CreatePipe(&output,&writeOut,&sa,4096)){if(readIn)CloseHandle(readIn);Stop();return false;}
  SetHandleInformation(input,HANDLE_FLAG_INHERIT,0);SetHandleInformation(output,HANDLE_FLAG_INHERIT,0);
  wchar_t exe[32768];GetModuleFileNameW(nullptr,exe,32768);std::wstring path(exe);path=path.substr(0,path.find_last_of(L"\\"))+L"\\ExtrudaFilter.exe";
  HANDLE nullError=CreateFileW(L"NUL",GENERIC_WRITE,FILE_SHARE_READ|FILE_SHARE_WRITE,&sa,OPEN_EXISTING,0,nullptr);
  STARTUPINFOEXW startup{};startup.StartupInfo.cb=sizeof(startup);startup.StartupInfo.dwFlags=STARTF_USESTDHANDLES;startup.StartupInfo.hStdInput=readIn;startup.StartupInfo.hStdOutput=writeOut;startup.StartupInfo.hStdError=nullError;
  SIZE_T attributes=0;InitializeProcThreadAttributeList(nullptr,1,0,&attributes);
  std::vector<BYTE> attributeMemory(attributes);startup.lpAttributeList=reinterpret_cast<LPPROC_THREAD_ATTRIBUTE_LIST>(attributeMemory.data());
  HANDLE inherited[]={readIn,writeOut,nullError};
  const bool attributesInitialized=nullError!=INVALID_HANDLE_VALUE&&InitializeProcThreadAttributeList(startup.lpAttributeList,1,0,&attributes);
  bool attributesOk=attributesInitialized;
  if(attributesOk)attributesOk=UpdateProcThreadAttribute(startup.lpAttributeList,0,PROC_THREAD_ATTRIBUTE_HANDLE_LIST,inherited,sizeof(inherited),nullptr,nullptr)!=FALSE;
  PROCESS_INFORMATION pi{};auto command=L"\""+path+L"\"";
  job=CreateJobObjectW(nullptr,nullptr);JOBOBJECT_EXTENDED_LIMIT_INFORMATION limit{};limit.BasicLimitInformation.LimitFlags=JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
  bool ok=attributesOk&&job&&SetInformationJobObject(job,JobObjectExtendedLimitInformation,&limit,sizeof(limit))&&CreateProcessW(path.c_str(),command.data(),nullptr,nullptr,TRUE,CREATE_NO_WINDOW|CREATE_SUSPENDED|EXTENDED_STARTUPINFO_PRESENT,nullptr,nullptr,&startup.StartupInfo,&pi);
  if(attributesInitialized)DeleteProcThreadAttributeList(startup.lpAttributeList);if(nullError!=INVALID_HANDLE_VALUE)CloseHandle(nullError);
  CloseHandle(readIn);CloseHandle(writeOut);
  if(!ok){Stop();return false;}process=pi.hProcess;
  ok=AssignProcessToJobObject(job,process)!=FALSE;if(ok)ResumeThread(pi.hThread);CloseHandle(pi.hThread);
  if(!ok){Stop();return false;}timer=CreateWaitableTimerExW(nullptr,nullptr,CREATE_WAITABLE_TIMER_HIGH_RESOLUTION,TIMER_ALL_ACCESS);running=true;worker=std::thread(&AudioFilter::Run,this);return true;
 }
 void Stop(){running=false;changed.notify_all();if(process)TerminateProcess(process,0);if(worker.joinable()){CancelSynchronousIo(worker.native_handle());worker.join();}
  for(auto h:{input,output,process,job,timer})if(h)CloseHandle(h);input=output=process=job=timer=nullptr;
  std::lock_guard<std::mutex> lock(mutex);queue.clear();completed.clear();
 }
 bool Push(const std::wstring& message){
  if(!running)return false;const auto split=message.find(L':');if(split==std::wstring::npos||split>10)return false;
  if(!split)return false;for(size_t i=0;i<split;i++)if(message[i]<L'0'||message[i]>L'9')return false;
  auto epoch=wcstoul(message.substr(0,split).c_str(),nullptr,10);
  // The token is echoed to JS; it has no authority and cannot select a path/device.
  const auto encoded=message.substr(split+1);if(encoded.size()!=2560)return false;
  for(auto c:encoded)if(!((c>=L'A'&&c<=L'Z')||(c>=L'a'&&c<=L'z')||(c>=L'0'&&c<=L'9')||c==L'+'||c==L'/'))return false;
  Block block{};block.epoch=epoch;DWORD bytes=1920;
  if(!CryptStringToBinaryW(encoded.c_str(),2560,CRYPT_STRING_BASE64,reinterpret_cast<BYTE*>(block.pcm.data()),&bytes,nullptr,nullptr)||bytes!=1920)return false;
  std::lock_guard<std::mutex> lock(mutex);if(queue.size()>=4)return false;queue.push_back(block);changed.notify_one();return true;
 }
 std::wstring Take(){std::lock_guard<std::mutex> lock(mutex);if(completed.empty())return {};auto script=completed.front();completed.pop_front();return script;}
};
