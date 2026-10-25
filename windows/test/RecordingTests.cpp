#include <windows.h>
#include <cstdio>
#include <fstream>
#include <filesystem>
#include "../app/RecordingFile.h"
int wmain(){CoInitializeEx(nullptr,COINIT_APARTMENTTHREADED);std::filesystem::create_directories(L"windows/build/recording-file-tests");const std::wstring path=L"windows/build/recording-file-tests/output.webm";{std::ofstream f(path);f<<"old";}RecordingFile file;if(FAILED(file.OpenPath(nullptr,path)))return 1;{std::ifstream f(path);std::string value;f>>value;if(value!="old")return 2;}if(file.Push(L"%%%="))return 3;if(!file.Push(L"bmV3"))return 4;file.Finish();for(int i=0;i<1000&&file.Active();i++)Sleep(5);if(file.Active()||FAILED(file.Status()))return 5;{std::ifstream f(path);std::string value;f>>value;if(value!="new")return 6;}if(FAILED(file.OpenPath(nullptr,path)))return 7;if(!file.Push(L"cGFydGlhbA=="))return 8;file.Finish(false);for(int i=0;i<1000&&file.Active();i++)Sleep(5);if(file.Active()||SUCCEEDED(file.Status()))return 9;{std::ifstream f(path);std::string value;f>>value;if(value!="new")return 10;}puts("PASS: acknowledged file blocks commit atomically; invalid input rejected; abort preserves previous file.");CoUninitialize();}
