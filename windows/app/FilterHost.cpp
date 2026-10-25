// Isolated host for the official DeepFilterNet 0.5.6 mono LADSPA plugin.
// Binary stdin/stdout: 960 mono PCM16 samples per block at 48 kHz.
#include <windows.h>
#include <algorithm>
#include <cmath>
#include <string>
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
