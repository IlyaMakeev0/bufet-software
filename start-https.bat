@echo off
echo ========================================
echo   HTTPS Server Startup
echo   www.autogreatfood.ru
echo ========================================
echo.

echo Checking administrator rights...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with administrator rights
) else (
    echo [WARNING] Not running as administrator
    echo Ports 80 and 443 require administrator rights
    echo.
    echo Please run this script as administrator:
    echo 1. Right-click on start-https.bat
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo Starting HTTPS server...
echo.

node server/index.js

pause
