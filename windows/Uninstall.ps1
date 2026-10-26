#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$taskSetup = Join-Path $PSScriptRoot 'ExtrudaSetup.exe'
if (!(Test-Path -LiteralPath $taskSetup)) { throw 'Use the official setup executable with --uninstall.' }
$taskProcess = Start-Process -FilePath $taskSetup -ArgumentList '--uninstall' -Wait -PassThru -WindowStyle Normal
if ($taskProcess.ExitCode -ne 0) { throw "Uninstall failed: $($taskProcess.ExitCode)" }
