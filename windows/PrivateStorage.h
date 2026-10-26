#pragma once
#include <windows.h>
#include <sddl.h>
#include <aclapi.h>
#include <string>
#include <vector>
#pragma comment(lib,"advapi32.lib")
inline std::wstring CurrentUserSid(){
 HANDLE token=nullptr;if(!OpenProcessToken(GetCurrentProcess(),TOKEN_QUERY,&token))return {};
 DWORD size=0;GetTokenInformation(token,TokenUser,nullptr,0,&size);std::vector<BYTE> bytes(size);
 const bool ok=GetTokenInformation(token,TokenUser,bytes.data(),size,&size)!=FALSE;CloseHandle(token);if(!ok)return {};
 LPWSTR value=nullptr;if(!ConvertSidToStringSidW(reinterpret_cast<TOKEN_USER*>(bytes.data())->User.Sid,&value))return {};
 std::wstring sid(value);LocalFree(value);return sid;
}
class PrivateSecurity {
 PSECURITY_DESCRIPTOR sd=nullptr;
public:
 SECURITY_ATTRIBUTES attributes{sizeof(SECURITY_ATTRIBUTES),nullptr,FALSE};
 explicit PrivateSecurity(bool directory=false,bool serviceRead=false){
  const auto sid=CurrentUserSid();if(sid.empty())return;
  const auto inherit=directory?L"OICI":L"";
  const auto sddl=L"D:P(A;"+std::wstring(inherit)+L";FA;;;SY)(A;"+inherit+L";FA;;;"+sid+L")"+(serviceRead?L"(A;"+std::wstring(inherit)+L";GRGX;;;LS)":L"");
  if(ConvertStringSecurityDescriptorToSecurityDescriptorW(sddl.c_str(),SDDL_REVISION_1,&sd,nullptr))attributes.lpSecurityDescriptor=sd;
 }
 ~PrivateSecurity(){if(sd)LocalFree(sd);}
 bool Valid()const{return sd!=nullptr;}
};
inline bool EnsurePrivateDirectory(const std::wstring& path,bool serviceRead=false){
 PrivateSecurity security(true,serviceRead);if(!security.Valid())return false;
 if(CreateDirectoryW(path.c_str(),&security.attributes))return true;
 if(GetLastError()!=ERROR_ALREADY_EXISTS)return false;
 const DWORD flags=GetFileAttributesW(path.c_str());if(flags==INVALID_FILE_ATTRIBUTES||!(flags&FILE_ATTRIBUTE_DIRECTORY)||(flags&FILE_ATTRIBUTE_REPARSE_POINT))return false;
 PSID owner=nullptr;PSECURITY_DESCRIPTOR old=nullptr;
 if(GetNamedSecurityInfoW(path.c_str(),SE_FILE_OBJECT,OWNER_SECURITY_INFORMATION,&owner,nullptr,nullptr,nullptr,&old)!=ERROR_SUCCESS)return false;
 PSID expected=nullptr;const auto sid=CurrentUserSid();const bool same=ConvertStringSidToSidW(sid.c_str(),&expected)&&EqualSid(owner,expected);if(expected)LocalFree(expected);LocalFree(old);if(!same)return false;
 BOOL present=FALSE,defaulted=FALSE;PACL dacl=nullptr;
 if(!GetSecurityDescriptorDacl(security.attributes.lpSecurityDescriptor,&present,&dacl,&defaulted)||!present)return false;
 return SetNamedSecurityInfoW(const_cast<wchar_t*>(path.c_str()),SE_FILE_OBJECT,DACL_SECURITY_INFORMATION|PROTECTED_DACL_SECURITY_INFORMATION,nullptr,nullptr,dacl,nullptr)==ERROR_SUCCESS;
}
