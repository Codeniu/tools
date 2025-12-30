@echo off
echo ========================================
echo   MP4 to GIF Tool - HTTP Server
echo ========================================
echo.
echo Starting HTTP server on port 8000...
echo.

cd /d "%~dp0"

python -m http.server 8000

pause
