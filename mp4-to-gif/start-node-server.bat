@echo off
echo ========================================
echo   MP4 to GIF Tool - Node.js Server
echo ========================================
echo.
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo.
echo Starting server with SharedArrayBuffer support...
echo Server will run at: http://localhost:8080
echo.

cd /d "%~dp0"
node server.js

pause
