#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$taskSetup = Join-Path $PSScriptRoot 'ExtrudaSetup.exe'
if (!(Test-Path -LiteralPath $taskSetup)) { throw 'Run the official setup executable from the release package.' }
$taskProcess = Start-Process -FilePath $taskSetup -Wait -PassThru -WindowStyle Normal
if ($taskProcess.ExitCode -ne 0) { throw "Setup failed: $($taskProcess.ExitCode)" }
