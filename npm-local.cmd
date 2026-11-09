@echo off
setlocal
cd /d "%~dp0"

rem Find Node.js and npm even when the terminal has an outdated PATH.
set "NPM_EXE="
if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_EXE=%ProgramFiles%\nodejs\npm.cmd"
if exist "%USERPROFILE%\AppData\Roaming\npm\npm.cmd" set "NPM_EXE=%USERPROFILE%\AppData\Roaming\npm\npm.cmd"
if exist "%APPDATA%\npm\npm.cmd" set "NPM_EXE=%APPDATA%\npm\npm.cmd"
if defined NPM_EXE goto run

where.exe node.exe >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 24 and reopen your terminal.
  echo Launcher: %~f0
  echo USERPROFILE: %USERPROFILE%
  echo APPDATA: %APPDATA%
  exit /b 1
)
where.exe npm.cmd >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Install Node.js 24 with npm and reopen your terminal.
  echo Launcher: %~f0
  echo USERPROFILE: %USERPROFILE%
  echo APPDATA: %APPDATA%
  exit /b 1
)

set "NPM_EXE=npm.cmd"

:run
for %%I in ("%NPM_EXE%") do set "PATH=%%~dpI;%PATH%"
call "%NPM_EXE%" %*
exit /b %errorlevel%
