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
#include <userenv.h>
#pragma comment(lib,"userenv.lib")
#pragma comment(lib,"advapi32.lib")
#ifdef EXTRUDA_FILTER_TEST
#include <aclapi.h>
#endif
// One private pipe pair, a bounded queue and a job which kills the helper on exit.
// No sockets, model download, audio files or arbitrary command/path arguments.
class AudioFilter {
#ifdef EXTRUDA_FILTER_TEST
 std::wstring testProbe;unsigned testPort=0;
#endif
 HANDLE process=nullptr,job=nullptr,input=nullptr,output=nullptr,timer=nullptr;
 std::thread worker;std::mutex mutex;std::condition_variable changed;
 struct Block {std::array<short,960> pcm;unsigned epoch,sequence;float attenuation;};
 std::deque<Block> queue;std::deque<std::wstring> completed;
 std::atomic<bool> running{false};HWND window=nullptr;
 unsigned activeEpoch=1;const char* readFault="pipe";const wchar_t* refused=L"input";
 void Notify(std::wstring script){
  {std::lock_guard<std::mutex> lock(mutex);if(completed.size()>=16)completed.pop_front();completed.push_back(std::move(script));}
  PostMessageW(window,WM_APP+83,0,0);
 }
 bool Read(void* data,DWORD bytes,DWORD timeout){
  auto p=static_cast<char*>(data);const auto start=GetTickCount64();
  while(bytes&&running){DWORD available=0;if(!PeekNamedPipe(output,nullptr,0,nullptr,&available,nullptr))return false;
   if(!available){if(GetTickCount64()-start>timeout){readFault="timeout";return false;}
    if(timer){LARGE_INTEGER due;due.QuadPart=-10000;SetWaitableTimer(timer,&due,0,nullptr,nullptr,FALSE);WaitForSingleObject(timer,10);}else Sleep(1);continue;}
   DWORD n=0;if(!ReadFile(output,p,std::min(bytes,available),&n,nullptr)||!n)return false;p+=n;bytes-=n;
  }return !bytes;
 }
 void Run(){
  DWORD ready=0;bool ok=Read(&ready,4,15000)&&ready==0x44464E33;
  const auto session=activeEpoch;
  if(ok)Notify(L"window.ExtrudaNoise?.ready("+std::to_wstring(session)+L")");
  while(ok&&running){Block block;
   {std::unique_lock<std::mutex> lock(mutex);changed.wait(lock,[&]{return !running||!queue.empty();});if(!running)break;block=queue.front();queue.pop_front();}
   DWORD written=0;readFault="pipe";
   ok=WriteFile(input,&block.attenuation,4,&written,nullptr)&&written==4&&WriteFile(input,block.pcm.data(),1920,&written,nullptr)&&written==1920&&Read(block.pcm.data(),1920,2000);
   if(!ok)break;
   DWORD count=0;CryptBinaryToStringW(reinterpret_cast<BYTE*>(block.pcm.data()),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,nullptr,&count);
   std::wstring encoded(count,L'\0');CryptBinaryToStringW(reinterpret_cast<BYTE*>(block.pcm.data()),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,encoded.data(),&count);encoded.resize(count&&encoded[count-1]==0?count-1:count);
   Notify(L"window.ExtrudaNoise?.result("+std::to_wstring(block.epoch)+L","+std::to_wstring(block.sequence)+L",'"+encoded+L"')");
  }
  if(!ok&&running)Notify(L"window.ExtrudaNoise?.failure("+std::to_wstring(session)+L",'"+(std::string(readFault)=="timeout"?std::wstring(L"timeout"):std::wstring(L"pipe"))+L"')");
  running=false;
 }
public:
 ~AudioFilter(){Stop();}
 bool Start(HWND hwnd,unsigned session=1){
  Stop();activeEpoch=session;readFault="pipe";window=hwnd;SECURITY_ATTRIBUTES sa{sizeof(sa),nullptr,TRUE};HANDLE readIn=nullptr,writeOut=nullptr;
  if(!CreatePipe(&readIn,&input,&sa,4096)||!CreatePipe(&output,&writeOut,&sa,4096)){if(readIn)CloseHandle(readIn);Stop();return false;}
  SetHandleInformation(input,HANDLE_FLAG_INHERIT,0);SetHandleInformation(output,HANDLE_FLAG_INHERIT,0);
  wchar_t exe[32768];GetModuleFileNameW(nullptr,exe,32768);std::wstring path(exe);path=path.substr(0,path.find_last_of(L"\\"))+L"\\ExtrudaFilter.exe";
#ifdef EXTRUDA_INSTALLED_PROBE
  wchar_t installed[32768]{};if(!GetEnvironmentVariableW(L"ProgramFiles",installed,32768)){Stop();return false;}path=std::wstring(installed)+L"\\Extruda Phone Camera\\ExtrudaFilter.exe";
#endif
#ifdef EXTRUDA_FILTER_TEST
  if(!testProbe.empty())path=path.substr(0,path.find_last_of(L"\\"))+L"\\ExtrudaFilterProbe.exe";
#endif
  HANDLE nullError=CreateFileW(L"NUL",GENERIC_WRITE,FILE_SHARE_READ|FILE_SHARE_WRITE,&sa,OPEN_EXISTING,0,nullptr);
  STARTUPINFOEXW startup{};startup.StartupInfo.cb=sizeof(startup);startup.StartupInfo.dwFlags=STARTF_USESTDHANDLES;startup.StartupInfo.hStdInput=readIn;startup.StartupInfo.hStdOutput=writeOut;startup.StartupInfo.hStdError=nullError;
  PSID containerSid=nullptr;const auto profile=CreateAppContainerProfile(L"Extruda.PhoneCamera.AudioFilter",L"extruda local audio filter",L"Offline PCM processing; no network or device capabilities",nullptr,0,&containerSid);
  if(FAILED(profile)&&profile==HRESULT_FROM_WIN32(ERROR_ALREADY_EXISTS))DeriveAppContainerSidFromAppContainerName(L"Extruda.PhoneCamera.AudioFilter",&containerSid);
  SECURITY_CAPABILITIES capabilities{};capabilities.AppContainerSid=containerSid;
#ifdef EXTRUDA_FILTER_TEST
  // The production install inherits AppContainer read access from Program Files.
  // Only this public build-output directory needs a test-specific read grant.
  if(containerSid){const auto dir=path.substr(0,path.find_last_of(L"\\"));PACL old=nullptr,updated=nullptr;PSECURITY_DESCRIPTOR sd=nullptr;
   if(GetNamedSecurityInfoW(dir.c_str(),SE_FILE_OBJECT,DACL_SECURITY_INFORMATION,nullptr,nullptr,&old,nullptr,&sd)==ERROR_SUCCESS){
    EXPLICIT_ACCESSW entry{};entry.grfAccessPermissions=GENERIC_READ|GENERIC_EXECUTE;entry.grfAccessMode=GRANT_ACCESS;entry.grfInheritance=SUB_CONTAINERS_AND_OBJECTS_INHERIT;entry.Trustee.TrusteeForm=TRUSTEE_IS_SID;entry.Trustee.ptstrName=static_cast<LPWSTR>(containerSid);
    if(SetEntriesInAclW(1,&entry,old,&updated)==ERROR_SUCCESS){SetNamedSecurityInfoW(const_cast<wchar_t*>(dir.c_str()),SE_FILE_OBJECT,DACL_SECURITY_INFORMATION,nullptr,nullptr,updated,nullptr);LocalFree(updated);}LocalFree(sd);
   }
  }
#endif
  SIZE_T attributes=0;InitializeProcThreadAttributeList(nullptr,2,0,&attributes);
  std::vector<BYTE> attributeMemory(attributes);startup.lpAttributeList=reinterpret_cast<LPPROC_THREAD_ATTRIBUTE_LIST>(attributeMemory.data());
  HANDLE inherited[]={readIn,writeOut,nullError};
  const bool attributesInitialized=containerSid&&nullError!=INVALID_HANDLE_VALUE&&InitializeProcThreadAttributeList(startup.lpAttributeList,2,0,&attributes);
  bool attributesOk=attributesInitialized;
  if(attributesOk)attributesOk=UpdateProcThreadAttribute(startup.lpAttributeList,0,PROC_THREAD_ATTRIBUTE_HANDLE_LIST,inherited,sizeof(inherited),nullptr,nullptr)!=FALSE;
  if(attributesOk)attributesOk=UpdateProcThreadAttribute(startup.lpAttributeList,0,PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES,&capabilities,sizeof(capabilities),nullptr,nullptr)!=FALSE;
  PROCESS_INFORMATION pi{};auto command=L"\""+path+L"\"";
#ifdef EXTRUDA_FILTER_TEST
  if(!testProbe.empty())command+=L" \""+testProbe+L"\" "+std::to_wstring(testPort);
#endif
  job=CreateJobObjectW(nullptr,nullptr);JOBOBJECT_EXTENDED_LIMIT_INFORMATION limit{};limit.BasicLimitInformation.LimitFlags=JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE|JOB_OBJECT_LIMIT_ACTIVE_PROCESS|JOB_OBJECT_LIMIT_PROCESS_MEMORY;limit.BasicLimitInformation.ActiveProcessLimit=1;limit.ProcessMemoryLimit=512ULL*1024*1024;
  bool ok=attributesOk&&job&&SetInformationJobObject(job,JobObjectExtendedLimitInformation,&limit,sizeof(limit))&&CreateProcessW(path.c_str(),command.data(),nullptr,nullptr,TRUE,CREATE_NO_WINDOW|CREATE_SUSPENDED|EXTENDED_STARTUPINFO_PRESENT,nullptr,nullptr,&startup.StartupInfo,&pi);
  if(attributesInitialized)DeleteProcThreadAttributeList(startup.lpAttributeList);if(nullError!=INVALID_HANDLE_VALUE)CloseHandle(nullError);
  if(containerSid)FreeSid(containerSid);
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
  refused=L"input";size_t pos=0;unsigned fields[3]{};
  for(auto& field:fields){const auto split=message.find(L':',pos);if(split==std::wstring::npos||split==pos||split-pos>10)return false;
   unsigned long long value=0;for(size_t i=pos;i<split;i++){if(message[i]<L'0'||message[i]>L'9')return false;value=value*10+message[i]-L'0';}if(value>0xffffffffULL)return false;field=static_cast<unsigned>(value);pos=split+1;}
  if(fields[0]!=activeEpoch)return true; // Late audio from a closed graph is harmless.
  if(!running)return true;if(fields[2]<6||fields[2]>60)return false;
  // The token is echoed to JS; it has no authority and cannot select a path/device.
  const auto encoded=message.substr(pos);if(encoded.size()!=2560)return false;
  for(auto c:encoded)if(!((c>=L'A'&&c<=L'Z')||(c>=L'a'&&c<=L'z')||(c>=L'0'&&c<=L'9')||c==L'+'||c==L'/'))return false;
  Block block{};block.epoch=fields[0];block.sequence=fields[1];block.attenuation=static_cast<float>(fields[2]);DWORD bytes=1920;
  if(!CryptStringToBinaryW(encoded.c_str(),2560,CRYPT_STRING_BASE64,reinterpret_cast<BYTE*>(block.pcm.data()),&bytes,nullptr,nullptr)||bytes!=1920)return false;
  std::lock_guard<std::mutex> lock(mutex);if(queue.size()>=4){refused=L"queue";return false;}queue.push_back(block);changed.notify_one();return true;
 }
 unsigned Epoch()const{return activeEpoch;}
#ifdef EXTRUDA_FILTER_TEST
 void SetProbe(const std::wstring& path,unsigned port){testProbe=path;testPort=port;}
 bool ProbePassed(){if(!process||WaitForSingleObject(process,8000)!=WAIT_OBJECT_0)return false;DWORD code=1;return GetExitCodeProcess(process,&code)&&code==0;}
#endif
 bool Sandboxed()const{HANDLE token=nullptr;DWORD value=0,bytes=0;if(!process||!OpenProcessToken(process,TOKEN_QUERY,&token))return false;const bool ok=GetTokenInformation(token,TokenIsAppContainer,&value,sizeof(value),&bytes)&&value;CloseHandle(token);return ok;}
 std::wstring RefusalScript()const{return L"window.ExtrudaNoise?.failure("+std::to_wstring(activeEpoch)+L",'"+refused+L"')";}
 std::wstring Take(){std::lock_guard<std::mutex> lock(mutex);if(completed.empty())return {};auto script=completed.front();completed.pop_front();return script;}
};
