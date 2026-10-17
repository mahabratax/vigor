@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.12 or newer, then run this file again.
  pause
  exit /b 1
)
echo Open http://localhost:8080/login in your browser.
echo Click Enter workspace. Press Ctrl+C here to stop Vigor.
node dist-gcp/server.mjs
pause
