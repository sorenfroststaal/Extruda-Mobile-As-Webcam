$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$taskVersion = (Get-Content package.json -Raw | ConvertFrom-Json).version
$taskRelease = Join-Path $PWD "windows\build\release-$taskVersion"
New-Item -ItemType Directory -Force -Path $taskRelease | Out-Null
$taskInstaller = "ExtrudaMobileAsWebcam-Setup-$taskVersion-x64.exe"
Copy-Item -LiteralPath 'windows\dist\ExtrudaSetup.exe' -Destination (Join-Path $taskRelease $taskInstaller)
Copy-Item -LiteralPath 'windows\app\camera.ico' -Destination (Join-Path $taskRelease 'extruda-mobile-as-webcam.ico')
$taskStage = Join-Path $taskRelease 'package'
New-Item -ItemType Directory -Force -Path $taskStage | Out-Null
foreach ($taskName in @('ExtrudaSetup.exe','ExtrudaCamera.exe','ExtrudaCamera.dll','README.md','LICENSE.txt','BRAND-NOTICE.txt','THIRD_PARTY_NOTICES.txt','UPSTREAM-LICENSE.txt','ui')) {
    Copy-Item -LiteralPath (Join-Path 'windows\dist' $taskName) -Destination $taskStage -Recurse -Force
}
Copy-Item -LiteralPath 'docs' -Destination $taskStage -Recurse -Force
Copy-Item -LiteralPath 'SECURITY.md','SECURITY-REVIEW.md' -Destination $taskStage -Force
$taskZip = Join-Path $taskRelease "Extruda-Mobile-As-Webcam-$taskVersion-win-x64.zip"
Compress-Archive -Path (Join-Path $taskStage '*') -DestinationPath $taskZip -Force
$taskAssets = @((Join-Path $taskRelease $taskInstaller), $taskZip, (Join-Path $taskRelease 'extruda-mobile-as-webcam.ico'))
$taskSums = foreach ($taskFile in $taskAssets) { $taskHash = Get-FileHash -LiteralPath $taskFile -Algorithm SHA256; "$($taskHash.Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($taskFile))" }
$taskSums | Set-Content -LiteralPath (Join-Path $taskRelease 'SHA256SUMS.txt') -Encoding ascii
Get-Item -LiteralPath $taskAssets | Select-Object Name,Length
