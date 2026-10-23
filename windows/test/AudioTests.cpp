#include <windows.h>
#include <cmath>
#include <cstdio>
#include <vector>
#include "../app/AudioOutput.h"
using Microsoft::WRL::ComPtr;
int wmain(int argc,wchar_t** argv){
 const bool monitor=argc>1&&wcscmp(argv[1],L"--monitor")==0;
    CoInitializeEx(nullptr,COINIT_MULTITHREADED);
    AudioOutput output;const auto devices=output.DeviceScript();wprintf(L"Virtual render devices: %s\n",devices.c_str());
    ComPtr<IMMDeviceEnumerator> enumerator;ComPtr<IMMDeviceCollection> collection;ComPtr<IMMDevice> selected;
    HRESULT hr=CoCreateInstance(__uuidof(MMDeviceEnumerator),nullptr,CLSCTX_ALL,IID_PPV_ARGS(&enumerator));
    if(SUCCEEDED(hr))hr=enumerator->EnumAudioEndpoints(eCapture,DEVICE_STATE_ACTIVE,&collection);
    UINT count=0;if(SUCCEEDED(hr))collection->GetCount(&count);
    for(UINT i=0;i<count;i++){
        ComPtr<IMMDevice> device;ComPtr<IPropertyStore> properties;PROPVARIANT name;PropVariantInit(&name);
        if(SUCCEEDED(collection->Item(i,&device))&&SUCCEEDED(device->OpenPropertyStore(STGM_READ,&properties))&&SUCCEEDED(properties->GetValue(PKEY_Device_FriendlyName,&name))&&name.vt==VT_LPWSTR){
            std::wstring lower=name.pwszVal;std::transform(lower.begin(),lower.end(),lower.begin(),towlower);
            if(lower.find(L"steam streaming microphone")!=std::wstring::npos||lower.find(L"cable output")!=std::wstring::npos)selected=device;
        }PropVariantClear(&name);
    }
    if(!selected){puts("SKIP: no supported virtual capture endpoint installed.");return 77;}
    ComPtr<IAudioClient> client;ComPtr<IAudioCaptureClient> capture;WAVEFORMATEX* format=nullptr;
    hr=selected->Activate(__uuidof(IAudioClient),CLSCTX_ALL,nullptr,&client);
    if(SUCCEEDED(hr))hr=client->GetMixFormat(&format);
    if(SUCCEEDED(hr))hr=client->Initialize(AUDCLNT_SHAREMODE_SHARED,0,1000000,0,format,nullptr);
    if(SUCCEEDED(hr))hr=client->GetService(IID_PPV_ARGS(&capture));
    if(SUCCEEDED(hr))hr=client->Start();
    if(SUCCEEDED(hr)&&!monitor)hr=output.Start(0);
    if(FAILED(hr)){printf("FAIL initialize: 0x%08X\n",static_cast<unsigned>(hr));CoTaskMemFree(format);return 1;}
    const double gain=devices.find(L"Steam Streaming Microphone")!=std::wstring::npos?0.03:1;
    short tone[960];for(unsigned i=0;i<960;i++)tone[i]=static_cast<short>(std::sin(i*6.283185307179586*1000/48000)*8192*gain);
    DWORD size=0;CryptBinaryToStringW(reinterpret_cast<BYTE*>(tone),sizeof(tone),CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,nullptr,&size);
    std::wstring encoded(size,L'\0');CryptBinaryToStringW(reinterpret_cast<BYTE*>(tone),sizeof(tone),CRYPT_STRING_BASE64|CRYPT_STRING_NOCRLF,encoded.data(),&size);encoded.resize(wcslen(encoded.c_str()));
    double peak=0,tail=0;auto start=GetTickCount64(),next=start;bool stopped=false;
    while(GetTickCount64()-start<(monitor?10000:2200)){
        auto now=GetTickCount64();if(!monitor&&now-start<1000&&now>=next){output.Push(encoded);next+=20;}
        if(!monitor&&now-start>=1000&&!stopped){output.Stop();stopped=true;}
        UINT32 packet=0;hr=capture->GetNextPacketSize(&packet);
        while(SUCCEEDED(hr)&&packet){
            BYTE* data=nullptr;UINT32 frames=0;DWORD flags=0;
            hr=capture->GetBuffer(&data,&frames,&flags,nullptr,nullptr);
            if(FAILED(hr))break;
            double sum=0;
            const GUID floatSubtype={3,0,0x0010,{0x80,0,0,0xaa,0,0x38,0x9b,0x71}};
            bool floating=format->wFormatTag==WAVE_FORMAT_IEEE_FLOAT||(format->wFormatTag==WAVE_FORMAT_EXTENSIBLE&&reinterpret_cast<WAVEFORMATEXTENSIBLE*>(format)->SubFormat==floatSubtype);
            if(!(flags&AUDCLNT_BUFFERFLAGS_SILENT))for(UINT32 i=0;i<frames*format->nChannels;i++){
                const double value=floating&&format->wBitsPerSample==32?reinterpret_cast<float*>(data)[i]:format->wBitsPerSample==16?reinterpret_cast<short*>(data)[i]/32768.0:0;
                sum+=value*value;
            }
            const double rms=std::sqrt(sum/std::max<UINT32>(1,frames*format->nChannels));
            if(monitor||now-start<1000)peak=std::max(peak,rms);if(now-start>1700)tail=std::max(tail,rms);
            capture->ReleaseBuffer(frames);hr=capture->GetNextPacketSize(&packet);
        }
        Sleep(5);
    }
    output.Stop();client->Stop();CoTaskMemFree(format);
    if(monitor){printf("Live virtual microphone peak RMS: %.8f (%.1f dBFS). No tone injected; no physical microphone accessed.\n",peak,20*std::log10(std::max(peak,1e-10)));return SUCCEEDED(hr)?0:1;}
    printf("Virtual capture RMS while sending: %.4f; after mute: %.4f\n",peak,tail);
    const bool ok=peak>0.02&&peak<0.9&&tail<0.002&&SUCCEEDED(hr);
    puts(ok?"PASS: synthetic PCM reaches virtual Windows microphone, then becomes silent on mute.":"FAIL: virtual audio routing or mute did not meet the expected signal thresholds.");return ok?0:1;
}
