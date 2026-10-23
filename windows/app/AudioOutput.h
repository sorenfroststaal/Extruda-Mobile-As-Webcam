#pragma once
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <functiondiscoverykeys_devpkey.h>
#include <wrl/client.h>
#include <atomic>
#include <thread>
#include <mutex>
#include <deque>
#include <vector>
#include <string>
#include <algorithm>
#include <cwctype>
#include <wincrypt.h>

// User-mode rendering to an explicitly selected, already installed virtual cable.
// Never captures the PC microphone, changes defaults or opens physical speakers.
class AudioOutput {
    struct Device {std::wstring id,name;};
    std::vector<Device> devices;
    std::thread worker;
    std::atomic<bool> running{false};
    std::atomic<HRESULT> result{E_PENDING};
    std::mutex mutex;
    std::deque<short> samples;
    ULONGLONG lastPacket=0,rateWindow=0;
    unsigned rateCount=0;
    static std::wstring Quote(const std::wstring& input){
        std::wstring out=L"\"";
        for(auto c:input){if(c==L'"'||c==L'\\'){out+=L'\\';out+=c;}else if(c<32){wchar_t hex[7];swprintf_s(hex,L"\\u%04x",static_cast<unsigned>(c));out+=hex;}else out+=c;}
        return out+L"\"";
    }
    void Render(std::wstring id){
        using Microsoft::WRL::ComPtr;
        const HRESULT init=CoInitializeEx(nullptr,COINIT_MULTITHREADED);
        if(FAILED(init)){result=init;running=false;return;}
        ComPtr<IMMDeviceEnumerator> enumerator;ComPtr<IMMDevice> device;
        ComPtr<IAudioClient> client;ComPtr<IAudioRenderClient> renderer;
        HRESULT hr=CoCreateInstance(__uuidof(MMDeviceEnumerator),nullptr,CLSCTX_ALL,IID_PPV_ARGS(&enumerator));
        if(SUCCEEDED(hr))hr=enumerator->GetDevice(id.c_str(),&device);
        if(SUCCEEDED(hr))hr=device->Activate(__uuidof(IAudioClient),CLSCTX_ALL,nullptr,&client);
        WAVEFORMATEX format{};format.wFormatTag=WAVE_FORMAT_PCM;format.nChannels=1;format.nSamplesPerSec=48000;format.wBitsPerSample=16;format.nBlockAlign=2;format.nAvgBytesPerSec=96000;
        if(SUCCEEDED(hr))hr=client->Initialize(AUDCLNT_SHAREMODE_SHARED,AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM|AUDCLNT_STREAMFLAGS_SRC_DEFAULT_QUALITY,1000000,0,&format,nullptr);
        UINT32 capacity=0;
        if(SUCCEEDED(hr))hr=client->GetBufferSize(&capacity);
        if(SUCCEEDED(hr))hr=client->GetService(IID_PPV_ARGS(&renderer));
        if(SUCCEEDED(hr))hr=client->Start();
        result=hr;
        while(running&&SUCCEEDED(hr)){
            UINT32 padding=0;hr=client->GetCurrentPadding(&padding);
            const UINT32 frames=capacity>padding?capacity-padding:0;
            if(SUCCEEDED(hr)&&frames){
                BYTE* data=nullptr;hr=renderer->GetBuffer(frames,&data);
                if(SUCCEEDED(hr)){
                    auto output=reinterpret_cast<short*>(data);bool audible=false;
                    {std::lock_guard<std::mutex> lock(mutex);
                     if(GetTickCount64()-lastPacket>250)samples.clear();
                     for(UINT32 i=0;i<frames;i++){output[i]=samples.empty()?0:samples.front();if(!samples.empty()){samples.pop_front();audible=true;}}
                    }
                    hr=renderer->ReleaseBuffer(frames,audible?0:AUDCLNT_BUFFERFLAGS_SILENT);
                }
            }
            Sleep(5);
        }
        if(client){client->Stop();client->Reset();}
        if(FAILED(hr))result=hr;
        running=false;renderer.Reset();client.Reset();device.Reset();enumerator.Reset();CoUninitialize();
    }
public:
    ~AudioOutput(){Stop();}
    HRESULT Status() const {return result;}
    void Stop(){running=false;if(worker.joinable())worker.join();std::lock_guard<std::mutex> lock(mutex);samples.clear();lastPacket=0;}
    std::wstring DeviceScript(){
        using Microsoft::WRL::ComPtr;
        Stop();devices.clear();ComPtr<IMMDeviceEnumerator> enumerator;ComPtr<IMMDeviceCollection> collection;
        auto hr=CoCreateInstance(__uuidof(MMDeviceEnumerator),nullptr,CLSCTX_ALL,IID_PPV_ARGS(&enumerator));
        if(SUCCEEDED(hr))hr=enumerator->EnumAudioEndpoints(eRender,DEVICE_STATE_ACTIVE,&collection);
        UINT count=0;if(SUCCEEDED(hr))collection->GetCount(&count);
        for(UINT i=0;i<count&&devices.size()<32;i++){
            ComPtr<IMMDevice> device;ComPtr<IPropertyStore> properties;LPWSTR id=nullptr;PROPVARIANT name;PropVariantInit(&name);
            if(SUCCEEDED(collection->Item(i,&device))&&SUCCEEDED(device->OpenPropertyStore(STGM_READ,&properties))&&SUCCEEDED(properties->GetValue(PKEY_Device_FriendlyName,&name))&&name.vt==VT_LPWSTR){
                std::wstring label=name.pwszVal,lower=label;std::transform(lower.begin(),lower.end(),lower.begin(),towlower);
                const bool virtualCable=lower.find(L"cable input")!=std::wstring::npos&&lower.find(L"vb-audio")!=std::wstring::npos;
                const bool steamMicrophone=lower.find(L"steam streaming microphone")!=std::wstring::npos;
                if((virtualCable||steamMicrophone)&&SUCCEEDED(device->GetId(&id)))devices.push_back({id,label});
            }
            CoTaskMemFree(id);PropVariantClear(&name);
        }
        std::wstring script=L"window.extrudaAudioDevices?.([";
        for(size_t i=0;i<devices.size();i++){if(i)script+=L",";script+=L"{index:"+std::to_wstring(i)+L",name:"+Quote(devices[i].name)+L"}";}
        return script+L"]);";
    }
    HRESULT Start(unsigned index){
        Stop();if(index>=devices.size())return E_INVALIDARG;
        result=E_PENDING;running=true;rateWindow=GetTickCount64();rateCount=0;
        worker=std::thread(&AudioOutput::Render,this,devices[index].id);
        for(unsigned i=0;i<200&&result==E_PENDING;i++)Sleep(5);
        const HRESULT hr=result;if(hr==E_PENDING){Stop();return HRESULT_FROM_WIN32(ERROR_TIMEOUT);}if(FAILED(hr))Stop();return hr;
    }
    bool Push(const std::wstring& encoded){
        if(!running||FAILED(result)||encoded.size()!=2560)return false;
        const auto now=GetTickCount64();if(now-rateWindow>=1000){rateWindow=now;rateCount=0;}if(++rateCount>75){Stop();return false;}
        for(auto c:encoded)if(!((c>=L'A'&&c<=L'Z')||(c>=L'a'&&c<=L'z')||(c>=L'0'&&c<=L'9')||c==L'+'||c==L'/'))return false;
        short decoded[960]{};DWORD size=sizeof(decoded);
        if(!CryptStringToBinaryW(encoded.c_str(),static_cast<DWORD>(encoded.size()),CRYPT_STRING_BASE64,reinterpret_cast<BYTE*>(decoded),&size,nullptr,nullptr)||size!=sizeof(decoded))return false;
        std::lock_guard<std::mutex> lock(mutex);
        while(samples.size()+960>9600)samples.pop_front();samples.insert(samples.end(),std::begin(decoded),std::end(decoded));lastPacket=now;return true;
    }
};
