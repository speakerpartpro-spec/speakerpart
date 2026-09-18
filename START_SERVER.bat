@echo off
title SPEAKERPARTPRO Local Server
cd /d "%~dp0"

echo ====================================================
echo   SPEAKERPARTPRO Industrial Transducer Systems
echo   Local Web Server and B2B Admin Console
echo ====================================================
echo Website:     http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo Passcode:    admin123
echo ====================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    node server.js
    goto end
)

if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    "%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
    goto end
)

echo [ERROR] Node.js runtime not found. Please install Node.js or run with agy-node.
pause

:end
