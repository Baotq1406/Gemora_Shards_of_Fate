@echo off
call "%~dp0npm-local.cmd" run dev:server
if errorlevel 1 (
  echo.
  echo Server startup failed. See the error above.
  pause
  exit /b 1
)
