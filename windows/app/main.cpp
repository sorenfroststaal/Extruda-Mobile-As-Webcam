#include <windows.h>
#include <mfapi.h>
#include <dwmapi.h>
#include <mfvirtualcamera.h>
#include <wrl.h>
#include <shlobj.h>
#include <shellapi.h>
#include <memory>
#include <algorithm>
#include <string>
#include <fstream>
#include "WebView2.h"
#include "WebView2EnvironmentOptions.h"
#include "FrameWriter.h"
#include "NativeTranslations.h"
#include "HelpLinks.h"
#include "AudioOutput.h"
#include "RecordingFile.h"
AudioOutput audioOutput;
RecordingFile recordingFile;
bool closeAfterRecording=false;
bool recordingSmokeTest=false;
bool recordingAudioTest=false;
using namespace Microsoft::WRL;
static constexpr wchar_t Site[] = L"https://app.extruda.local/index.html";
HWND window;
ComPtr<ICoreWebView2Environment> environment;
ComPtr<ICoreWebView2Controller> controller;
ComPtr<ICoreWebView2> web;
ComPtr<ICoreWebView2SharedBuffer> shared;
ComPtr<IMFVirtualCamera> camera;
std::unique_ptr<FrameWriter> writer;
BYTE* frameData = nullptr;
bool closing = false;
bool smokeTest = false;
bool systemSmokeTest = false;
bool selectorSmokeTest = false;
bool pairingSmokeTest = false;
unsigned smokeFrames = 0;
std::wstring bridge;
unsigned outputWidth = FrameWidth, outputHeight = FrameHeight;
std::wstring settingsPath;
std::wstring ConfigScript() {
    return L"window.extrudaCaptureSize = {width:" + std::to_wstring(outputWidth) + L",height:" + std::to_wstring(outputHeight) + L"};window.extrudaResolutionApplied?.(" + std::to_wstring(outputWidth) + L"," + std::to_wstring(outputHeight) + L");";
}
bool Trusted(const wchar_t* uri) {
    const std::wstring origin = L"https://app.extruda.local";
    return uri && wcsncmp(uri, origin.c_str(), origin.size()) == 0 && (uri[origin.size()] == 0 || uri[origin.size()] == L'/' || uri[origin.size()] == L'?' || uri[origin.size()] == L'#');
}
void Error(const wchar_t* message, HRESULT hr) {
    if (pairingSmokeTest) { std::ofstream out("pairing-native-error.txt"); out << std::hex << static_cast<unsigned>(hr); for(auto p=message;*p;++p)out << static_cast<char>(*p<128?*p:'?'); PostQuitMessage(1); return; }
    wchar_t text[1024]{}; swprintf_s(text, L"%s\n\n%s: 0x%08X", NativeText(message), NativeText(L"Fejlkode"), static_cast<unsigned>(hr));
    MessageBoxW(window, text, L"extruda - mobile as webcam", MB_OK | MB_ICONERROR);
}
HRESULT StartCamera() {
    auto name = L"extruda - mobile as webcam (" + std::to_wstring(outputWidth) + L"x" + std::to_wstring(outputHeight) + L")";
    auto hr = MFCreateVirtualCamera(MFVirtualCameraType_SoftwareCameraSource, MFVirtualCameraLifetime_Session, MFVirtualCameraAccess_CurrentUser, name.c_str(), CameraClassId, nullptr, 0, &camera);
    if (FAILED(hr)) return hr;
    hr = camera->SetString(FramePathAttribute, writer->path.c_str());
    if (SUCCEEDED(hr)) hr = camera->SetUINT64(FrameSizeAttribute, (static_cast<UINT64>(outputWidth) << 32) | outputHeight);
    if (SUCCEEDED(hr)) hr = camera->Start(nullptr);
    return hr;
}
void InitWeb() {
    PWSTR local = nullptr;
    SHGetKnownFolderPath(FOLDERID_LocalAppData, 0, nullptr, &local);
    const auto data = std::wstring(local ? local : L".") + L"\\ExtrudaPhoneCamera";
    CoTaskMemFree(local); CreateDirectoryW(data.c_str(), nullptr);
    auto options = Make<CoreWebView2EnvironmentOptions>();
    options->put_AdditionalBrowserArguments(L"--disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows");
    auto hr = CreateCoreWebView2EnvironmentWithOptions(nullptr, (data + L"\\WebView2").c_str(), options.Get(), Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>([](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
        if (FAILED(result)) { Error(L"Microsoft Edge WebView2 Runtime mangler eller kunne ikke starte.", result); return result; }
        environment = env;
        return env->CreateCoreWebView2Controller(window, Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>([](HRESULT result, ICoreWebView2Controller* c) -> HRESULT {
            if (FAILED(result)) { Error(L"Appvinduet kunne ikke oprettes.", result); return result; }
            controller = c; controller->get_CoreWebView2(&web);
            wchar_t executable[MAX_PATH]{}; GetModuleFileNameW(nullptr,executable,MAX_PATH);
            std::wstring folder(executable); folder = folder.substr(0,folder.find_last_of(L"\\")) + L"\\ui";
            ComPtr<ICoreWebView2_3> localWeb; auto localHr = web.As(&localWeb);
            if (SUCCEEDED(localHr)) localHr = localWeb->SetVirtualHostNameToFolderMapping(L"app.extruda.local",folder.c_str(),COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_DENY);
            if (FAILED(localHr)) { Error(L"Kunne ikke indlæse den lokale brugerflade.",localHr); return localHr; }

            RECT rect; GetClientRect(window, &rect); controller->put_Bounds(rect);
            ComPtr<ICoreWebView2Settings> settings; web->get_Settings(&settings);
            settings->put_AreDevToolsEnabled(FALSE); settings->put_AreDefaultContextMenusEnabled(FALSE); settings->put_IsStatusBarEnabled(FALSE);
            EventRegistrationToken token;
            web->add_NavigationStarting(Callback<ICoreWebView2NavigationStartingEventHandler>([](ICoreWebView2*, ICoreWebView2NavigationStartingEventArgs* e) -> HRESULT { if(recordingFile.Active()){e->put_Cancel(TRUE);return S_OK;} LPWSTR uri = nullptr; e->get_Uri(&uri); bool allowed = Trusted(uri); CoTaskMemFree(uri); if (!allowed) e->put_Cancel(TRUE); audioOutput.Stop(); if (writer) writer->Clear(); shared.Reset(); frameData = nullptr; return S_OK; }).Get(), &token);
            web->add_NewWindowRequested(Callback<ICoreWebView2NewWindowRequestedEventHandler>([](ICoreWebView2*, ICoreWebView2NewWindowRequestedEventArgs* e) -> HRESULT {
                e->put_Handled(TRUE);
                BOOL userInitiated=FALSE; e->get_IsUserInitiated(&userInitiated);
                LPWSTR source=nullptr; web->get_Source(&source); const bool trusted=Trusted(source); CoTaskMemFree(source);
                LPWSTR uri=nullptr; e->get_Uri(&uri);
                if(userInitiated && trusted && AllowedHelpLink(uri))ShellExecuteW(window,L"open",uri,nullptr,nullptr,SW_SHOWNORMAL);
                CoTaskMemFree(uri); return S_OK;
            }).Get(), &token);
            web->add_PermissionRequested(Callback<ICoreWebView2PermissionRequestedEventHandler>([](ICoreWebView2*, ICoreWebView2PermissionRequestedEventArgs* e) -> HRESULT { e->put_State(COREWEBVIEW2_PERMISSION_STATE_DENY); return S_OK; }).Get(), &token);
            web->add_NavigationCompleted(Callback<ICoreWebView2NavigationCompletedEventHandler>([](ICoreWebView2*, ICoreWebView2NavigationCompletedEventArgs* e) -> HRESULT {
                BOOL success = FALSE; e->get_IsSuccess(&success);
                if (!success) { Error(L"Kunne ikke hente parringssiden. Kontrollér internetforbindelsen.", E_FAIL); return S_OK; }
                LPWSTR source = nullptr; web->get_Source(&source); bool trusted = Trusted(source); CoTaskMemFree(source);
                if (trusted) {
                    auto script = ConfigScript() + bridge;
                    if (pairingSmokeTest) script = L"try{" + script + L"}catch(e){chrome.webview.postMessage('pairing-failed:'+String(e.message).slice(0,80))}";
                    web->ExecuteScript(script.c_str(), nullptr);
                }
                return S_OK;
            }).Get(), &token);
            web->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>([](ICoreWebView2*, ICoreWebView2WebMessageReceivedEventArgs* e) -> HRESULT {
                LPWSTR source = nullptr; e->get_Source(&source); bool trusted = Trusted(source); CoTaskMemFree(source); if (!trusted || closing) return S_OK;
                LPWSTR raw = nullptr; if (FAILED(e->TryGetWebMessageAsString(&raw))) return S_OK;
                if (wcsnlen_s(raw,262157) > 262156) { CoTaskMemFree(raw); return S_OK; }
                std::wstring message(raw); CoTaskMemFree(raw);
                if(message.rfind(L"record-data:",0)==0){if(!recordingFile.Push(message.substr(12)))web->ExecuteScript(L"window.ExtrudaRecording?.ack(false)",nullptr);return S_OK;}
                if(message.size()>4096)return S_OK;
                if(message.rfind(L"audio-pcm:",0)==0){
                    const bool accepted=audioOutput.Push(message.substr(10));
                    web->ExecuteScript(!accepted||FAILED(audioOutput.Status())?L"window.extrudaAudioAck?.(false);window.extrudaAudioError?.()":L"window.extrudaAudioAck?.(true)",nullptr);return S_OK;
                }
                if(message.size()>128)return S_OK;
                if(message==L"record-open:mp4"||message==L"record-open:webm"){
                    const auto hr=recordingSmokeTest?recordingFile.OpenPath(window,message==L"record-open:mp4"?L"recording-smoke.mp4":L"recording-smoke.webm"):recordingFile.Choose(window,message==L"record-open:mp4");
                    const auto script=L"window.ExtrudaRecording?.opened("+std::wstring(SUCCEEDED(hr)?L"true,":L"false,")+RecordingFile::Quote(SUCCEEDED(hr)?recordingFile.DisplayPath():hr==HRESULT_FROM_WIN32(ERROR_CANCELLED)?L"":L"save-error")+L")";
                    web->ExecuteScript(script.c_str(),nullptr);return S_OK;
                }
                if(message==L"record-finish"||message==L"record-abort"){recordingFile.Finish(message==L"record-finish");return S_OK;}
                if(message==L"record-window-close"){PostMessageW(window,WM_CLOSE,0,0);return S_OK;}
                if(message==L"record-reveal"&&!recordingFile.Active()&&!recordingFile.DisplayPath().empty()&&GetFileAttributesW(recordingFile.DisplayPath().c_str())!=INVALID_FILE_ATTRIBUTES){const auto arguments=L"/select,\""+recordingFile.DisplayPath()+L"\"";ShellExecuteW(window,L"open",L"explorer.exe",arguments.c_str(),nullptr,SW_SHOWNORMAL);return S_OK;}
                if(message==L"audio-stop")audioOutput.Stop();
                else if(message==L"audio-devices")web->ExecuteScript(audioOutput.DeviceScript().c_str(),nullptr);
                else if(message.rfind(L"audio-route:",0)==0){
                    wchar_t* end=nullptr;const auto index=wcstoul(message.c_str()+12,&end,10);
                    if(!end||end==message.c_str()+12||*end||index>=32||FAILED(audioOutput.Start(static_cast<unsigned>(index))))web->ExecuteScript(L"window.extrudaAudioError?.()",nullptr);
                    else web->ExecuteScript(L"window.extrudaAudioStarted?.()",nullptr);
                }
                else if (message.rfind(L"language:",0) == 0) {
                    SetNativeLanguage(message.c_str()+9);
                } else if (message == L"theme:dark" || message == L"theme:light") {
                    BOOL dark = message == L"theme:dark"; DwmSetWindowAttribute(window,DWMWA_USE_IMMERSIVE_DARK_MODE,&dark,sizeof(dark));
                } else if (message.rfind(L"pairing-failed:",0) == 0 && pairingSmokeTest) {
                    std::ofstream output("pairing-smoke-error.txt"); for (auto ch : message) output << static_cast<char>(ch < 128 ? ch : '?');
                    std::ofstream("pairing-smoke-result.json") << "{\"ok\":false}";
                    PostMessageW(window,WM_CLOSE,0,0);
                } else if (message == L"pairing-ready" && pairingSmokeTest) {
                    std::ofstream("pairing-smoke-result.json") << "{\"ok\":true,\"automaticPairing\":true,\"qrVisible\":true}";
                    PostMessageW(window, WM_CLOSE, 0, 0);
                } else if (message == L"ready" && !shared) {
                    ComPtr<ICoreWebView2Environment12> env12; ComPtr<ICoreWebView2_17> web17;
                    auto hr = environment.As(&env12); if (SUCCEEDED(hr)) hr = web.As(&web17);
                    if (SUCCEEDED(hr)) hr = env12->CreateSharedBuffer(MaxFrameBytes, &shared);
                    if (SUCCEEDED(hr)) hr = shared->get_Buffer(&frameData);
                    if (SUCCEEDED(hr)) hr = web17->PostSharedBufferToScript(shared.Get(), COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_WRITE, nullptr);
                    if (FAILED(hr)) Error(L"Opdater Microsoft Edge WebView2 Runtime for at sende video til kameraet.", hr);
                } else if (message.rfind(L"resolution:", 0) == 0 && writer) {
                    unsigned width = 0, height = 0;
                    if (swscanf_s(message.c_str(), L"resolution:%ux%u", &width, &height) != 2 || !SupportedSize(width, height)) return S_OK;
                    auto previousWidth = outputWidth, previousHeight = outputHeight;
                    writer->Clear(); if (camera) { camera->Stop(); camera->Remove(); camera->Shutdown(); camera.Reset(); }
                    outputWidth = width; outputHeight = height;
                    try { writer = std::make_unique<FrameWriter>(width, height); } catch (...) { Error(L"Kunne ikke ændre opløsning.", E_FAIL); return S_OK; }
                    auto hr = smokeTest ? S_OK : StartCamera();
                    if (FAILED(hr)) {
                        outputWidth = previousWidth; outputHeight = previousHeight;
                        writer = std::make_unique<FrameWriter>(outputWidth, outputHeight); camera.Reset(); StartCamera();
                        Error(L"Luk kameraet i Teams og vælg opløsningen igen.", hr);
                    } else if (!smokeTest && !systemSmokeTest) {
                        WritePrivateProfileStringW(L"Camera", L"Width", std::to_wstring(width).c_str(), settingsPath.c_str());
                        WritePrivateProfileStringW(L"Camera", L"Height", std::to_wstring(height).c_str(), settingsPath.c_str());
                    }
                    web->ExecuteScript(ConfigScript().c_str(), nullptr);
                } else if (message == L"frame" && frameData && writer) {
                    writer->Write(frameData);
                    if ((smokeTest || systemSmokeTest) && ++smokeFrames == 30) {
                        const bool valid = frameData[0] == 20 && frameData[1] == 80 && frameData[2] == 200;
                        std::ofstream("smoke-result.json") << "{\"ok\":" << (valid ? "true" : "false") << ",\"frames\":30,\"width\":" << outputWidth << ",\"height\":" << outputHeight << "}";
                        if (!systemSmokeTest) PostMessageW(window, WM_CLOSE, 0, 0);
                    }
                    web->ExecuteScript(L"window.extrudaFrameAck?.()", nullptr);
                } else if (message == L"clear" && writer) writer->Clear();
                return S_OK;
            }).Get(), &token);
            wchar_t locale[LOCALE_NAME_MAX_LENGTH]{};
            LCIDToLocaleName(MAKELCID(GetUserDefaultUILanguage(),SORT_DEFAULT),locale,LOCALE_NAME_MAX_LENGTH,0);
            auto languageScript = std::wstring(L"window.extrudaSystemLanguage='") + locale + L"';";
            return web->AddScriptToExecuteOnDocumentCreated(languageScript.c_str(),Callback<ICoreWebView2AddScriptToExecuteOnDocumentCreatedCompletedHandler>([](HRESULT hr,LPCWSTR)->HRESULT { if(FAILED(hr))return hr; return web->Navigate(Site); }).Get());
        }).Get());
    }).Get());
    if (FAILED(hr)) Error(L"Microsoft Edge WebView2 Runtime kunne ikke indlæses.", hr);
}
LRESULT CALLBACK Proc(HWND hwnd, UINT msg, WPARAM w, LPARAM l) {
    if(msg==WM_APP+82&&web){
        if(w==1)web->ExecuteScript(SUCCEEDED(recordingFile.Status())?L"window.ExtrudaRecording?.ack(true)":L"window.ExtrudaRecording?.ack(false)",nullptr);
        else {const auto script=std::wstring(L"window.ExtrudaRecording?.saved(")+(SUCCEEDED(recordingFile.Status())?L"true)":L"false)");web->ExecuteScript(script.c_str(),nullptr);if(closeAfterRecording&&SUCCEEDED(recordingFile.Status()))PostMessageW(hwnd,WM_CLOSE,0,0);else closeAfterRecording=false;}return 0;
    }
    if (msg == WM_TIMER && systemSmokeTest) { PostMessageW(hwnd, WM_CLOSE, 0, 0); return 0; }
    if (msg == WM_SIZE && controller) { RECT rect; GetClientRect(hwnd, &rect); controller->put_Bounds(rect); return 0; }
    if (msg == WM_CLOSE) {if(recordingFile.Active()){closeAfterRecording=true;if(web)web->ExecuteScript(L"window.ExtrudaRecording?.stop()",nullptr);return 0;} closing = true; audioOutput.Stop(); if (writer) writer->Clear(); if (controller) controller->Close(); if (camera) { camera->Stop(); camera->Shutdown(); } DestroyWindow(hwnd); return 0; }
    if (msg == WM_DESTROY) { PostQuitMessage(0); return 0; }
    return DefWindowProcW(hwnd, msg, w, l);
}
int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int show) {
    wchar_t userLocale[LOCALE_NAME_MAX_LENGTH]{}; LCIDToLocaleName(MAKELCID(GetUserDefaultUILanguage(),SORT_DEFAULT),userLocale,LOCALE_NAME_MAX_LENGTH,0); SetNativeLanguage(userLocale);
    pairingSmokeTest = wcsstr(GetCommandLineW(), L"--pairing-smoke") != nullptr;
    recordingSmokeTest=wcsstr(GetCommandLineW(),L"--recording-smoke")!=nullptr;
    recordingAudioTest=wcsstr(GetCommandLineW(),L"--recording-smoke-audio")!=nullptr;
    smokeTest = wcsstr(GetCommandLineW(), L"--smoke-test") != nullptr;
    const bool systemSelectorTest = wcsstr(GetCommandLineW(), L"--system-selector-smoke") != nullptr;
    selectorSmokeTest = wcsstr(GetCommandLineW(), L"--selector-smoke") != nullptr || systemSelectorTest;
    smokeTest = smokeTest || (selectorSmokeTest && !systemSelectorTest);
    systemSmokeTest = wcsstr(GetCommandLineW(), L"--system-smoke") != nullptr || systemSelectorTest||recordingSmokeTest;
    PWSTR local = nullptr; SHGetKnownFolderPath(FOLDERID_LocalAppData, 0, nullptr, &local);
    auto settingsFolder = std::wstring(local ? local : L".") + L"\\ExtrudaPhoneCamera"; CoTaskMemFree(local); CreateDirectoryW(settingsFolder.c_str(), nullptr);
    settingsPath = settingsFolder + L"\\settings.ini";
    outputWidth = 1920; outputHeight = 1080;
    if (smokeTest || systemSmokeTest) { outputWidth = FrameWidth; outputHeight = FrameHeight; }
    if (auto size = wcsstr(GetCommandLineW(), L"--resolution=")) {
        unsigned width = 0, height = 0;
        if (swscanf_s(size, L"--resolution=%ux%u", &width, &height) == 2 && SupportedSize(width, height)) { outputWidth = width; outputHeight = height; }
    }
    SetProcessDPIAware();
    if (FAILED(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED))) return 1;
    MFStartup(MF_VERSION);
    HANDLE single = CreateMutexW(nullptr, TRUE, L"Local\\ExtrudaPhoneCameraReceiver");
    if (!single || GetLastError() == ERROR_ALREADY_EXISTS) { MessageBoxW(nullptr, NativeText(L"extruda - mobile as webcam er allerede åben."), L"Extruda", MB_OK); if (single) CloseHandle(single); return 1; }
    auto resource = FindResourceW(instance, MAKEINTRESOURCEW(101), RT_RCDATA);
    auto bytes = SizeofResource(instance, resource); auto ptr = static_cast<const char*>(LockResource(LoadResource(instance, resource)));
    int count = MultiByteToWideChar(CP_UTF8, 0, ptr, bytes, nullptr, 0); bridge.resize(count); MultiByteToWideChar(CP_UTF8, 0, ptr, bytes, bridge.data(), count);
    if (smokeTest || systemSmokeTest) bridge = L"window.extrudaTestPattern = true;\n" + bridge;
    if(recordingSmokeTest)bridge=L"window.extrudaRecordingTest=true;\n"+bridge;
    if(recordingAudioTest)bridge=L"window.extrudaRecordingTestAudio=true;\n"+bridge;
    if (selectorSmokeTest) bridge = L"window.extrudaSelectorTest = true;\n" + bridge;
    if (pairingSmokeTest) bridge = L"window.extrudaPairingTest = true;\n" + bridge;
    WNDCLASSW cls{}; cls.hInstance = instance; cls.lpfnWndProc = Proc; cls.lpszClassName = L"ExtrudaPhoneCamera"; cls.hIcon = LoadIconW(instance, MAKEINTRESOURCEW(1)); cls.hCursor = LoadCursor(nullptr, IDC_ARROW); RegisterClassW(&cls);
    MONITORINFO monitor{sizeof(MONITORINFO)};
    GetMonitorInfoW(MonitorFromPoint(POINT{0, 0}, MONITOR_DEFAULTTOPRIMARY), &monitor);
    const int dpi = GetDpiForSystem();
    const int availableWidth = monitor.rcWork.right - monitor.rcWork.left;
    const int availableHeight = monitor.rcWork.bottom - monitor.rcWork.top;
    const int width = std::min(MulDiv(1200, dpi, 96), availableWidth - 24);
    const int height = std::min(MulDiv(900, dpi, 96), availableHeight - 24);
    window = CreateWindowExW(0, cls.lpszClassName, L"extruda - mobile as webcam", WS_OVERLAPPEDWINDOW,
        monitor.rcWork.left + (availableWidth - width) / 2, monitor.rcWork.top + (availableHeight - height) / 2,
        width, height, nullptr, nullptr, instance, nullptr);
    try { writer = std::make_unique<FrameWriter>(outputWidth, outputHeight); } catch (...) { Error(L"Kunne ikke oprette den lokale videoforbindelse.", HRESULT_FROM_WIN32(GetLastError())); return 1; }
    auto hr = smokeTest ? S_OK : StartCamera();
    if (FAILED(hr)) { Error(L"Det virtuelle kamera kunne ikke startes. Kør installationsprogrammet igen og kontrollér Windows’ kameratilladelser.", hr); return 1; }
    ShowWindow(window, show); InitWeb();
    if (systemSmokeTest) SetTimer(window, 1, 30000, nullptr);
    MSG msg; while (GetMessageW(&msg, nullptr, 0, 0) > 0) { TranslateMessage(&msg); DispatchMessageW(&msg); }
    shared.Reset(); web.Reset(); controller.Reset(); environment.Reset(); camera.Reset(); writer.reset(); CloseHandle(single);
    MFShutdown(); CoUninitialize(); return 0;
}


