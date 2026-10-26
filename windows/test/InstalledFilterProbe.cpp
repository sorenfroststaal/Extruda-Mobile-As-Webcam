#define EXTRUDA_INSTALLED_PROBE
#include "../app/AudioFilter.h"
#include <cstdio>
int main(){
 AudioFilter filter;if(!filter.Start(nullptr,99)||!filter.Sandboxed())return 1;
 if(!filter.Push(L"99:1:36:"+std::wstring(2560,L'A')))return 2;
 const auto start=GetTickCount64();while(GetTickCount64()-start<18000){const auto value=filter.Take();if(value.find(L".result(99,1,")!=std::wstring::npos){filter.Stop();puts("PASS: installed helper runs in AppContainer and returns processed PCM without test ACL grants.");return 0;}Sleep(2);}
 return 3;
}
