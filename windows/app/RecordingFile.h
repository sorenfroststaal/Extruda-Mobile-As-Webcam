#pragma once
#include <windows.h>
#include <shobjidl.h>
#include <shlobj.h>
#include <wrl/client.h>
#include <wincrypt.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>
#include <string>
#include <atomic>
#include <cwctype>
#include <filesystem>
#include "../PrivateStorage.h"

// One acknowledged block in flight. Only a user-selected save target is writable.
// An interrupted recording remains a .partial file; the old target is untouched.
class RecordingFile {
    HANDLE file=INVALID_HANDLE_VALUE;std::wstring target,partial;HWND owner=nullptr;
    std::thread worker;std::mutex mutex;std::condition_variable wake;
    std::vector<BYTE> block;bool quit=false,finish=false,occupied=false,commit=false;
    unsigned blocksWritten=0;
    std::atomic<bool> active{false};std::atomic<HRESULT> result{S_OK};
    void Run(){
        for(;;){
            std::vector<BYTE> next;bool final=false;
            {std::unique_lock<std::mutex> lock(mutex);wake.wait(lock,[&]{return quit||finish||!block.empty();});if(quit)break;next.swap(block);final=finish&&next.empty();}
            if(final){
                if(SUCCEEDED(result)&&!FlushFileBuffers(file))result=HRESULT_FROM_WIN32(GetLastError());
                CloseHandle(file);file=INVALID_HANDLE_VALUE;
                if(SUCCEEDED(result)&&commit&&!MoveFileExW(partial.c_str(),target.c_str(),MOVEFILE_REPLACE_EXISTING|MOVEFILE_WRITE_THROUGH))result=HRESULT_FROM_WIN32(GetLastError());
                active=false;PostMessageW(owner,WM_APP+82,2,0);return;
            }
            if(++blocksWritten%32==0){ULARGE_INTEGER available{};const auto directory=std::filesystem::path(target).parent_path().wstring();if(GetDiskFreeSpaceExW(directory.c_str(),&available,nullptr,nullptr)&&available.QuadPart<128ULL*1024*1024)result=HRESULT_FROM_WIN32(ERROR_DISK_FULL);}
            DWORD written=0;if(SUCCEEDED(result)&&(!WriteFile(file,next.data(),static_cast<DWORD>(next.size()),&written,nullptr)||written!=next.size()))result=HRESULT_FROM_WIN32(GetLastError()?GetLastError():ERROR_WRITE_FAULT);
            {std::lock_guard<std::mutex> lock(mutex);occupied=false;}
            PostMessageW(owner,WM_APP+82,1,0);
        }
        if(file!=INVALID_HANDLE_VALUE){CloseHandle(file);file=INVALID_HANDLE_VALUE;}active=false;
    }
public:
    ~RecordingFile(){Shutdown();}
    bool Active()const{return active;}
    HRESULT Status()const{return result;}
    static std::wstring Quote(const std::wstring& value){std::wstring out=L"\"";for(auto c:value){if(c==L'"'||c==L'\\'){out+=L'\\';out+=c;}else if(c<32){wchar_t hex[7];swprintf_s(hex,L"\\u%04x",static_cast<unsigned>(c));out+=hex;}else out+=c;}return out+L"\"";}
    std::wstring DisplayPath()const{return target;}
    bool StorageWarning()const{
        auto path=target;for(auto& c:path)c=static_cast<wchar_t>(towlower(c));if(path.rfind(L"\\\\",0)==0)return true;
        for(const auto name:{L"OneDrive",L"OneDriveCommercial",L"OneDriveConsumer"}){wchar_t root[32768]{};if(GetEnvironmentVariableW(name,root,32768)){std::wstring prefix(root);for(auto& c:prefix)c=static_cast<wchar_t>(towlower(c));if(path==prefix||path.rfind(prefix+L"\\",0)==0)return true;}}
        wchar_t root[32768]{};if(!GetVolumePathNameW(target.c_str(),root,32768))return true;DWORD flags=0;
        return GetDriveTypeW(root)!=DRIVE_FIXED||!GetVolumeInformationW(root,nullptr,0,nullptr,nullptr,&flags,nullptr,0)||!(flags&FILE_PERSISTENT_ACLS);
    }
    HRESULT OpenPath(HWND window,const std::wstring& path){
        if(active)return E_UNEXPECTED;Shutdown();owner=window;target=path;GUID id{};if(FAILED(CoCreateGuid(&id)))return E_FAIL;wchar_t suffix[40]{};StringFromGUID2(id,suffix,40);
        PrivateSecurity security;if(!security.Valid())return E_ACCESSDENIED;
        partial=target+L"."+suffix+L".partial";file=CreateFileW(partial.c_str(),GENERIC_WRITE,0,&security.attributes,CREATE_NEW,FILE_ATTRIBUTE_NORMAL,nullptr);if(file==INVALID_HANDLE_VALUE)return HRESULT_FROM_WIN32(GetLastError());
        result=S_OK;blocksWritten=0;quit=finish=occupied=commit=false;block.clear();active=true;worker=std::thread(&RecordingFile::Run,this);return S_OK;
    }
    HRESULT Choose(HWND window,bool mp4){
        if(active)return E_UNEXPECTED;Microsoft::WRL::ComPtr<IFileSaveDialog> dialog;
        auto hr=CoCreateInstance(CLSID_FileSaveDialog,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&dialog));if(FAILED(hr))return hr;
        const COMDLG_FILTERSPEC filter{mp4?L"MP4 video (*.mp4)":L"WebM video (*.webm)",mp4?L"*.mp4":L"*.webm"};dialog->SetFileTypes(1,&filter);dialog->SetDefaultExtension(mp4?L"mp4":L"webm");
        dialog->SetOptions(FOS_FORCEFILESYSTEM|FOS_OVERWRITEPROMPT|FOS_PATHMUSTEXIST|FOS_STRICTFILETYPES);
        SYSTEMTIME now{};GetLocalTime(&now);wchar_t name[100]{};swprintf_s(name,L"extruda-%04u%02u%02u-%02u%02u%02u.%s",now.wYear,now.wMonth,now.wDay,now.wHour,now.wMinute,now.wSecond,mp4?L"mp4":L"webm");dialog->SetFileName(name);
        PWSTR local=nullptr;hr=SHGetKnownFolderPath(FOLDERID_LocalAppData,0,nullptr,&local);if(FAILED(hr))return hr;
        const std::wstring base=std::wstring(local)+L"\\ExtrudaPhoneCamera";CoTaskMemFree(local);
        if(!CreateDirectoryW(base.c_str(),nullptr)&&GetLastError()!=ERROR_ALREADY_EXISTS)return HRESULT_FROM_WIN32(GetLastError());
        const auto recordings=base+L"\\Recordings";if(!EnsurePrivateDirectory(recordings))return E_ACCESSDENIED;
        Microsoft::WRL::ComPtr<IShellItem> folder;if(SUCCEEDED(SHCreateItemFromParsingName(recordings.c_str(),nullptr,IID_PPV_ARGS(&folder))))dialog->SetFolder(folder.Get());
        hr=dialog->Show(window);if(FAILED(hr))return hr;Microsoft::WRL::ComPtr<IShellItem> item;hr=dialog->GetResult(&item);if(FAILED(hr))return hr;
        PWSTR path=nullptr;hr=item->GetDisplayName(SIGDN_FILESYSPATH,&path);if(FAILED(hr))return hr;const std::wstring selected=path;CoTaskMemFree(path);return OpenPath(window,selected);
    }
    bool Push(const std::wstring& encoded){
        if(!active||FAILED(result)||encoded.empty()||encoded.size()>262144||encoded.size()%4)return false;
        for(auto c:encoded)if(!((c>=L'A'&&c<=L'Z')||(c>=L'a'&&c<=L'z')||(c>=L'0'&&c<=L'9')||c==L'+'||c==L'/'||c==L'='))return false;
        DWORD bytes=196608;std::vector<BYTE> data(bytes);if(!CryptStringToBinaryW(encoded.c_str(),static_cast<DWORD>(encoded.size()),CRYPT_STRING_BASE64|CRYPT_STRING_STRICT,data.data(),&bytes,nullptr,nullptr)||!bytes||bytes>196608)return false;data.resize(bytes);
        {std::lock_guard<std::mutex> lock(mutex);if(occupied||finish||quit)return false;block=std::move(data);occupied=true;}wake.notify_one();return true;
    }
    void Finish(bool save=true){if(!active)return;{std::lock_guard<std::mutex> lock(mutex);if(finish)return;finish=true;commit=save;if(!save)result=E_ABORT;}if(!save&&worker.joinable())CancelSynchronousIo(worker.native_handle());wake.notify_one();}
    void Shutdown(){if(worker.joinable()){{std::lock_guard<std::mutex> lock(mutex);quit=true;}CancelSynchronousIo(worker.native_handle());wake.notify_one();worker.join();}if(file!=INVALID_HANDLE_VALUE){CloseHandle(file);file=INVALID_HANDLE_VALUE;}active=false;}
};
