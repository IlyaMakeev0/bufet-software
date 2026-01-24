@echo off
echo ========================================
echo School Canteen - Docker Test Script
echo ========================================
echo.

echo [1/6] Проверка установки Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker не установлен
    pause
    exit /b 1
)
echo [OK] Docker установлен

echo.
echo [2/6] Проверка запуска Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker не запущен
    pause
    exit /b 1
)
echo [OK] Docker запущен

echo.
echo [3/6] Проверка docker-compose.yml...
docker-compose config >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Ошибка в docker-compose.yml
    pause
    exit /b 1
)
echo [OK] docker-compose.yml корректен

echo.
echo [4/6] Проверка Dockerfile...
if not exist Dockerfile (
    echo [FAIL] Dockerfile не найден
    pause
    exit /b 1
)
echo [OK] Dockerfile найден

echo.
echo [5/6] Проверка необходимых файлов...
if not exist server\index-docker.js (
    echo [FAIL] server\index-docker.js не найден
    pause
    exit /b 1
)
if not exist server\database-postgres.js (
    echo [FAIL] server\database-postgres.js не найден
    pause
    exit /b 1
)
echo [OK] Все необходимые файлы на месте

echo.
echo [6/6] Проверка портов...
netstat -an | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Порт 5000 уже занят
    echo Остановите приложение на порту 5000 или измените порт в docker-compose.yml
) else (
    echo [OK] Порт 5000 свободен
)

echo.
echo ========================================
echo [SUCCESS] Все проверки пройдены!
echo ========================================
echo.
echo Готово к запуску. Выполните:
echo   docker-start.bat
echo.

pause
