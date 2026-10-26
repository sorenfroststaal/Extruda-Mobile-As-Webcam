#define EXTRUDA_FILTER_TEST
#include "../app/AudioFilter.h"
#include <iostream>
#include <cmath>
int main(){
 AudioFilter filter;if(!filter.Start(nullptr,42)){std::cerr<<"Cannot start local filter\n";return 1;}
 if(!filter.Sandboxed()){std::cerr<<"Filter is not inside AppContainer\n";return 16;}
 if(filter.Push(L"1:invalid")||filter.Push(L"bad:"+std::wstring(2560,L'A'))){std::cerr<<"Invalid packet accepted\n";return 2;}
 double before=0,after=0;unsigned random=123;const auto start=GetTickCount64();
 for(int block=0;block<100;block++){
  short pcm[960];for(auto& sample:pcm){random=random*1664525+1013904223;sample=static_cast<short>((static_cast<double>(random)/4294967296.*2.-1.)*3000);if(block>=30)before+=static_cast<double>(sample)*sample;}
  DWORD size=2561;wchar_t encoded[2561];CryptBinaryToStringW(reinterpret_cast<BYTE*>(pcm),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,encoded,&size);
  if(!filter.Push(L"42:"+std::to_wstring(block)+L":36:"+std::wstring(encoded))){std::cerr<<"Valid packet rejected\n";return 3;}
  std::wstring result;const auto timeout=GetTickCount64();while(GetTickCount64()-timeout<18000){result=filter.Take();if(result.find(L".result(")!=std::wstring::npos)break;Sleep(1);}
  if(result.find(L"(42,")==std::wstring::npos){std::cerr<<"Missing tagged result\n";return 4;}
  const auto first=result.find(L'\'')+1,last=result.find(L'\'',first);const auto data=result.substr(first,last-first);size=1920;
  if(!CryptStringToBinaryW(data.c_str(),static_cast<DWORD>(data.size()),CRYPT_STRING_BASE64,reinterpret_cast<BYTE*>(pcm),&size,nullptr,nullptr)||size!=1920)return 5;
  if(block>=30)for(auto sample:pcm)after+=static_cast<double>(sample)*sample;
 }
 const double reduction=10*log10(before/std::max(1.,after));
 std::cout<<"100 local blocks, noise reduction "<<reduction<<" dB, total "<<GetTickCount64()-start<<" ms\n";
 if(reduction<6||!std::isfinite(reduction))return 7;
 double mildBefore=0,mildAfter=0;
 for(unsigned block=0;block<100;block++){
  short pcm[960];for(auto& sample:pcm){random=random*1664525+1013904223;sample=static_cast<short>((static_cast<double>(random)/4294967296.*2.-1.)*3000);if(block>=30)mildBefore+=static_cast<double>(sample)*sample;}
  DWORD size=2561;wchar_t encoded[2561];CryptBinaryToStringW(reinterpret_cast<BYTE*>(pcm),1920,CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,encoded,&size);
  if(!filter.Push(L"42:"+std::to_wstring(block+100)+L":6:"+encoded))return 13;
  std::wstring result;const auto timeout=GetTickCount64();while(GetTickCount64()-timeout<3000){result=filter.Take();if(result.find(L".result(")!=std::wstring::npos)break;Sleep(1);}
  const auto first=result.find(L'\'')+1,last=result.find(L'\'',first);const auto data=result.substr(first,last-first);size=1920;
  if(!CryptStringToBinaryW(data.c_str(),static_cast<DWORD>(data.size()),CRYPT_STRING_BASE64,reinterpret_cast<BYTE*>(pcm),&size,nullptr,nullptr)||size!=1920)return 14;
  if(block>=30)for(auto sample:pcm)mildAfter+=static_cast<double>(sample)*sample;
 }
 const double mild=10*log10(mildBefore/std::max(1.,mildAfter));filter.Stop();
 std::cout<<"Live strength change: 6 dB setting measured "<<mild<<" dB versus "<<reduction<<" dB at 36 dB setting\n";
 if(reduction-mild<12||mild<3||mild>12)return 15;
 // Model is warm: sustain actual 50 blocks/sec without queue overflow.
 if(!filter.Start(nullptr,42))return 8;
 const auto packet=L"42:0:36:"+std::wstring(2560,L'A');if(!filter.Push(packet))return 9;
 while(GetTickCount64()-start<30000){if(filter.Take().find(L".result(")!=std::wstring::npos)break;Sleep(1);}
 const auto liveStart=GetTickCount64();unsigned sent=0,received=0;
 while(GetTickCount64()-liveStart<5000&&received<100){
  const auto elapsed=GetTickCount64()-liveStart;
  if(sent<100&&elapsed>=sent*20){if(!filter.Push(packet)){std::cerr<<"Realtime queue overflow\n";return 10;}sent++;}
  for(auto message=filter.Take();!message.empty();message=filter.Take())if(message.find(L".result(")!=std::wstring::npos)received++;
  Sleep(1);
 }
 const auto liveMs=GetTickCount64()-liveStart;filter.Stop();
 std::cout<<"Realtime: "<<received<<"/100 blocks in "<<liveMs<<" ms\n";
 if(received!=100||liveMs>2400)return 11;
 // Restart owns a fresh helper/model; no leaked subprocess survives Stop.
 if(!filter.Start(nullptr,42))return 12;filter.Stop();
 std::cout<<"PASS: local model, bounded tagged PCM, invalid input, stop and restart.\n";
}
