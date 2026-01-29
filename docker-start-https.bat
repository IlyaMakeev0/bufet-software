@echo off
echo ========================================
echo   Docker HTTPS Server Startup
echo   www.autogreatfood.ru
echo ========================================
echo.

echo Stopping existing containers...
docker-compose -f docker-compose.https.yml down

echo.
echo Building and starting HTTPS containers...
docker-compose -f docker-compose.https.yml up -d --build

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Server Status
echo ========================================
docker-compose -f docker-compose.https.yml ps

echo.
echo ========================================
echo   Access URLs
echo ========================================
echo   HTTPS: https://www.autogreatfood.ru
echo   HTTPS: https://autogreatfood.ru
echo   HTTPS: https://localhost
echo.
echo   HTTP redirects to HTTPS automatically
echo ========================================
echo.
echo To view logs: docker-compose -f docker-compose.https.yml logs -f
echo To stop: docker-compose -f docker-compose.https.yml down
echo.

pause
