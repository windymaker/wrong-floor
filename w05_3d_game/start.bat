@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE="
where node >nul 2>nul
if not errorlevel 1 set "NODE_EXE=node.exe"
if not defined NODE_EXE if exist "%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not defined NODE_EXE if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
if not defined NODE_EXE (
  echo Node.js was not found. Install Node.js 18 or newer from https://nodejs.org and try again.
  pause
  exit /b 1
)
"%NODE_EXE%" server.js --open
pause
