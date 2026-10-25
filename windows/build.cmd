@echo off
setlocal
if not defined EXTRUDA_SETUP_NAME set "EXTRUDA_SETUP_NAME=ExtrudaSetup.exe"
cd /d "%~dp0.."
if not defined VSDEVCMD set "VSDEVCMD=C:\BuildToolsExtruda\Common7\Tools\VsDevCmd.bat"
if not exist "%VSDEVCMD%" (
  echo Set VSDEVCMD to your Visual Studio C++ developer command script.
  exit /b 1
)
call "%VSDEVCMD%" -arch=x64 -host_arch=x64 >nul
if errorlevel 1 exit /b 1
node scripts\build-i18n.mjs
if errorlevel 1 exit /b 1
if not exist windows\build mkdir windows\build
if not exist windows\dist mkdir windows\dist
.tools\cppwinrt\bin\cppwinrt.exe -base -output windows\build\generated
if errorlevel 1 exit /b 1
set "COMMON=/nologo /utf-8 /std:c++20 /EHsc /O2 /MT /W3 /MP4 /DUNICODE /D_UNICODE /DNOMINMAX /DWIN32_LEAN_AND_MEAN /I.tools\wil\include /Iwindows\build\generated %EXTRUDA_CFLAGS%"
if /I "%~1"=="finish" goto tests
if /I "%~1"=="app" goto app
cl %COMMON% /LD windows\camera\*.cpp /Fowindows\build\ /Fewindows\dist\ExtrudaCamera.dll /link /DEF:windows\camera\ExtrudaCamera.def mfplat.lib mf.lib mfuuid.lib mfsensorgroup.lib ole32.lib oleaut32.lib propsys.lib advapi32.lib user32.lib shlwapi.lib windowsapp.lib
if errorlevel 1 exit /b 1
:app
pushd windows\app
rc /nologo /fo ..\build\app.res app.rc
popd
if errorlevel 1 exit /b 1
cl %COMMON% /I.tools\webview2\build\native\include windows\app\main.cpp windows\build\app.res /Fowindows\build\app.obj /Fewindows\dist\ExtrudaCamera.exe /link /SUBSYSTEM:WINDOWS .tools\webview2\build\native\x64\WebView2LoaderStatic.lib mfplat.lib mf.lib mfuuid.lib mfsensorgroup.lib ole32.lib oleaut32.lib advapi32.lib user32.lib shell32.lib shlwapi.lib version.lib dwmapi.lib uuid.lib propsys.lib crypt32.lib
if errorlevel 1 exit /b 1
:tests
cl %COMMON% windows\test\AudioTests.cpp /Fowindows\build\audio-test.obj /Fewindows\dist\AudioTests.exe /link ole32.lib uuid.lib propsys.lib crypt32.lib
if errorlevel 1 exit /b 1
if not exist windows\dist\ui\brand mkdir windows\dist\ui\brand
node scripts\build-i18n.mjs
if errorlevel 1 exit /b 1
copy /y public\i18n.js windows\dist\ui\i18n.js >nul
copy /y public\i18n-core.js windows\dist\ui\i18n-core.js >nul
copy /y public\brand\logo-white.svg windows\dist\ui\brand\logo-white.svg >nul
if not exist windows\dist\ui\. mkdir windows\dist\ui\.
copy /y public\index.html windows\dist\ui\index.html >nul
if not exist windows\dist\ui\. mkdir windows\dist\ui\.
copy /y public\style.css windows\dist\ui\style.css >nul
if not exist windows\dist\ui\. mkdir windows\dist\ui\.
copy /y public\app.js windows\dist\ui\app.js >nul
copy /y public\audio.js windows\dist\ui\audio.js >nul
copy /y public\health.js windows\dist\ui\health.js >nul
copy /y public\video.js windows\dist\ui\video.js >nul
copy /y public\audio-worklet.js windows\dist\ui\audio-worklet.js >nul
if not exist windows\dist\ui\. mkdir windows\dist\ui\.
copy /y public\qr.js windows\dist\ui\qr.js >nul
if not exist windows\dist\ui\brand mkdir windows\dist\ui\brand
copy /y public\brand\logo.svg windows\dist\ui\brand\logo.svg >nul
if not exist windows\dist\ui\brand mkdir windows\dist\ui\brand
copy /y public\brand\camera.svg windows\dist\ui\brand\camera.svg >nul
if not exist windows\dist\ui\brand mkdir windows\dist\ui\brand
copy /y public\brand\tokens.css windows\dist\ui\brand\tokens.css >nul
if not exist windows\dist\ui\fonts mkdir windows\dist\ui\fonts
copy /y public\fonts\Nunito-Variable.woff2 windows\dist\ui\fonts\Nunito-Variable.woff2 >nul
if not exist windows\dist\ui\fonts mkdir windows\dist\ui\fonts
copy /y public\fonts\Inter-Variable.woff2 windows\dist\ui\fonts\Inter-Variable.woff2 >nul
if not exist windows\dist\ui\fonts mkdir windows\dist\ui\fonts
copy /y public\fonts\Nunito-OFL.txt windows\dist\ui\fonts\Nunito-OFL.txt >nul
if not exist windows\dist\ui\fonts mkdir windows\dist\ui\fonts
copy /y public\fonts\Inter-OFL.txt windows\dist\ui\fonts\Inter-OFL.txt >nul
copy /y public\fonts\Manrope-Variable.woff2 windows\dist\ui\fonts\Manrope-Variable.woff2 >nul
copy /y public\fonts\Manrope-OFL.txt windows\dist\ui\fonts\Manrope-OFL.txt >nul
cl %COMMON% windows\test\CameraTests.cpp /Fowindows\build\test.obj /Fewindows\dist\CameraTests.exe /link mfplat.lib mf.lib mfuuid.lib mfreadwrite.lib mfsensorgroup.lib ole32.lib advapi32.lib user32.lib
if errorlevel 1 exit /b 1
copy /y windows\Install.ps1 windows\dist\ >nul
copy /y windows\Uninstall.ps1 windows\dist\ >nul
copy /y windows\README.md windows\dist\README.md >nul
copy /y windows\camera\UPSTREAM-LICENSE.txt windows\dist\ >nul
copy /y windows\THIRD_PARTY_NOTICES.txt windows\dist\ >nul
copy /y LICENSE windows\dist\LICENSE.txt >nul
copy /y BRAND-NOTICE.txt windows\dist\BRAND-NOTICE.txt >nul
pushd windows
rc /nologo /fo build\setup.res setup.rc
popd
if errorlevel 1 exit /b 1
cl %COMMON% windows\setup.cpp windows\build\setup.res /Fowindows\build\setup.obj /Fewindows\dist\%EXTRUDA_SETUP_NAME% /link /SUBSYSTEM:WINDOWS /MANIFEST:EMBED /MANIFESTINPUT:windows\setup.manifest /MANIFESTUAC:NO shell32.lib ole32.lib user32.lib advapi32.lib
if errorlevel 1 exit /b 1
echo Windows build complete.

