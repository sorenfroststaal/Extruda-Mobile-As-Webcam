#include <winsock2.h>
#define EXTRUDA_FILTER_TEST
#include "../app/AudioFilter.h"
#include "../PrivateStorage.h"
#include <filesystem>
#include <iostream>
#pragma comment(lib,"ws2_32.lib")
int main(){
 std::filesystem::create_directories(L"windows/build/sandbox-tests");
 const auto canary=std::filesystem::absolute(L"windows/build/sandbox-tests/private-canary.txt").wstring();PrivateSecurity security;
 auto file=CreateFileW(canary.c_str(),GENERIC_WRITE,0,&security.attributes,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,nullptr);if(file==INVALID_HANDLE_VALUE)return 1;CloseHandle(file);
 WSADATA network{};if(WSAStartup(MAKEWORD(2,2),&network))return 2;
 auto listener=socket(AF_INET,SOCK_STREAM,IPPROTO_TCP);sockaddr_in address{};address.sin_family=AF_INET;address.sin_addr.s_addr=htonl(INADDR_LOOPBACK);
 if(bind(listener,reinterpret_cast<sockaddr*>(&address),sizeof(address))||listen(listener,1))return 3;int bytes=sizeof(address);getsockname(listener,reinterpret_cast<sockaddr*>(&address),&bytes);
 AudioFilter filter;filter.SetProbe(canary,ntohs(address.sin_port));const bool ok=filter.Start(nullptr)&&filter.Sandboxed()&&filter.ProbePassed();filter.Stop();closesocket(listener);WSACleanup();DeleteFileW(canary.c_str());
 std::cout<<(ok?"PASS: AppContainer with no capabilities cannot read a private user file or connect to a listening TCP socket.\n":"FAIL: sandbox boundary probe.\n");return ok?0:4;
}
