@echo off
echo ========================================
echo   Starting School Canteen Server
echo   with HTTPS Support
echo ========================================
echo.

REM Проверка наличия сертификатов
if not exist "cert\key.txt" (
    echo [ERROR] Certificate key not found: cert\key.txt
    echo Please make sure SSL certificates are in the cert folder
    pause
    exit /b 1
)

if not exist "cert\www_autogreatfood_ru_2026_08_30.crt" (
    echo [ERROR] Certificate not found: cert\www_autogreatfood_ru_2026_08_30.crt
    echo Please make sure SSL certificates are in the cert folder
    pause
    exit /b 1
)

echo [OK] SSL Certificates found
echo.

REM Установка переменных окружения
set NODE_ENV=production
set HTTP_PORT=8080
set HTTPS_PORT=8443
set ENABLE_HTTPS=true

echo Starting server...
echo HTTP Port: %HTTP_PORT% (redirects to HTTPS)
echo HTTPS Port: %HTTPS_PORT%
echo.

REM Запуск сервера
node server/index.js

pause
