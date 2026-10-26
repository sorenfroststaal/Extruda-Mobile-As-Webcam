// Isolated host for the official DeepFilterNet 0.5.6 mono LADSPA plugin.
// Binary stdin/stdout: 960 mono PCM16 samples per block at 48 kHz.
#ifdef EXTRUDA_SANDBOX_PROBE
#include <winsock2.h>
#include <shellapi.h>
#pragma comment(lib,"ws2_32.lib")
#pragma comment(lib,"shell32.lib")
#else
#include <windows.h>
#endif
#include <algorithm>
#include <cmath>
#include <string>
#pragma comment(lib,"advapi32.lib")
struct Hint {int flags;float min,max;};
struct Descriptor {
 unsigned long id;const char* label;int properties;const char *name,*maker,*copyright;
 unsigned long count;const int* ports;const char** names;const Hint* hints;void* data;
 void* (*instantiate)(const Descriptor*,unsigned long);
 void (*connect)(void*,unsigned long,float*);void (*activate)(void*);
 void (*run)(void*,unsigned long);void (*add)(void*,unsigned long);void (*gain)(void*,float);
 void (*deactivate)(void*);void (*cleanup)(void*);
};
bool ReadExact(HANDLE h,void* p,DWORD size){DWORD n;while(size){if(!ReadFile(h,p,size,&n,nullptr)||!n)return false;size-=n;p=static_cast<char*>(p)+n;}return true;}
bool WriteExact(HANDLE h,const void* p,DWORD size){DWORD n;while(size){if(!WriteFile(h,p,size,&n,nullptr)||!n)return false;size-=n;p=static_cast<const char*>(p)+n;}return true;}
int main(){
 SetErrorMode(SEM_FAILCRITICALERRORS|SEM_NOGPFAULTERRORBOX);
 HANDLE token=nullptr;DWORD sandbox=0,bytes=0;
 if(!OpenProcessToken(GetCurrentProcess(),TOKEN_QUERY,&token))return 7;
 const bool contained=GetTokenInformation(token,TokenIsAppContainer,&sandbox,sizeof(sandbox),&bytes)&&sandbox;
 DWORD size=0;GetTokenInformation(token,TokenCapabilities,nullptr,0,&size);std::string storage(size,'\0');
 const bool noCapabilities=size&&GetTokenInformation(token,TokenCapabilities,storage.data(),size,&bytes)&&reinterpret_cast<TOKEN_GROUPS*>(storage.data())->GroupCount==0;CloseHandle(token);
 if(!contained||!noCapabilities)return 7;
#ifdef EXTRUDA_SANDBOX_PROBE
 int argc=0;auto argv=CommandLineToArgvW(GetCommandLineW(),&argc);if(!argv||argc!=3)return 20;
 auto probeFile=CreateFileW(argv[1],GENERIC_READ,FILE_SHARE_READ,nullptr,OPEN_EXISTING,0,nullptr);
 const bool denied=probeFile==INVALID_HANDLE_VALUE&&GetLastError()==ERROR_ACCESS_DENIED;if(probeFile!=INVALID_HANDLE_VALUE)CloseHandle(probeFile);
 WSADATA network{};if(WSAStartup(MAKEWORD(2,2),&network))return 23;
 auto connection=socket(AF_INET,SOCK_STREAM,IPPROTO_TCP);sockaddr_in target{};target.sin_family=AF_INET;target.sin_addr.s_addr=htonl(INADDR_LOOPBACK);target.sin_port=htons(static_cast<u_short>(_wtoi(argv[2])));
 u_long nonblocking=1;ioctlsocket(connection,FIONBIO,&nonblocking);
 const int connected=connect(connection,reinterpret_cast<sockaddr*>(&target),sizeof(target));const int error=WSAGetLastError();bool blocked=connected==SOCKET_ERROR&&error==WSAEACCES;
 if(connected==SOCKET_ERROR&&error==WSAEWOULDBLOCK){fd_set writable,errors;FD_ZERO(&writable);FD_ZERO(&errors);FD_SET(connection,&writable);FD_SET(connection,&errors);timeval timeout{3,0};const auto selected=select(0,nullptr,&writable,&errors,&timeout);
  if(selected==0)blocked=true;else if(selected>0){int status=0,size=sizeof(status);getsockopt(connection,SOL_SOCKET,SO_ERROR,reinterpret_cast<char*>(&status),&size);blocked=status==WSAEACCES;}
 }
 closesocket(connection);WSACleanup();LocalFree(argv);
 return !denied?21:blocked?0:22;
#endif
 wchar_t path[32768];GetModuleFileNameW(nullptr,path,32768);
 const auto file=std::wstring(path);const auto dll=file.substr(0,file.find_last_of(L"\\"))+L"\\deep_filter.dll";
 auto module=LoadLibraryExW(dll.c_str(),nullptr,LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR|LOAD_LIBRARY_SEARCH_SYSTEM32);
 if(!module)return 2;
 auto get=reinterpret_cast<const Descriptor*(*)(unsigned long)>(GetProcAddress(module,"ladspa_descriptor"));
 const auto d=get?get(0):nullptr;
 if(!d||d->id!=7843795||d->count!=8||!d->instantiate||!d->connect||!d->run)return 3;
 auto instance=d->instantiate(d,48000);if(!instance)return 4;
 float input[960]{},output[960]{},controls[]={36,-15,35,35,0,0};
 d->connect(instance,0,input);d->connect(instance,1,output);
 for(unsigned long i=0;i<6;i++)d->connect(instance,i+2,&controls[i]);
 if(d->activate)d->activate(instance);
 const auto in=GetStdHandle(STD_INPUT_HANDLE),out=GetStdHandle(STD_OUTPUT_HANDLE);
 const DWORD ready=0x44464E33;if(!WriteExact(out,&ready,sizeof(ready)))return 5;
 short pcm[960];
 float attenuation=36;
 while(ReadExact(in,&attenuation,sizeof(attenuation))&&ReadExact(in,pcm,sizeof(pcm))){
  if(!std::isfinite(attenuation)||attenuation<6||attenuation>60)return 6;
  controls[0]=attenuation;
  for(int i=0;i<960;i++)input[i]=pcm[i]/32768.f;
  d->run(instance,960);
  for(int i=0;i<960;i++){const float v=std::isfinite(output[i])?std::clamp(output[i],-1.f,1.f):0;pcm[i]=static_cast<short>(v*32767);}
  if(!WriteExact(out,pcm,sizeof(pcm)))break;
 }
 // The upstream plugin owns background threads; process exit releases them.
 // Never unload its DLL while those threads could still execute.
 ExitProcess(0);
}
