@echo off
echo ========================================
echo School Canteen - Docker Startup Script
echo ========================================
echo.

REM Проверка установки Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker не установлен!
    echo Установите Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [OK] Docker установлен
echo.

REM Проверка запуска Docker
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker не запущен!
    echo Запустите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

echo [OK] Docker запущен
echo.

echo Попытка скачать образ PostgreSQL...
echo.

REM Попытка скачать образ вручную
docker pull postgres:16-alpine >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Не удалось скачать postgres:16-alpine
    echo Пробую альтернативную версию...
    docker pull postgres:16 >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Не удалось скачать postgres:16
        echo Пробую latest версию...
        docker pull postgres:latest >nul 2>&1
    )
)

echo.
echo Сборка и запуск контейнеров...
echo.

docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ошибка при запуске контейнеров!
    echo.
    echo Возможные решения:
    echo 1. Перезапустите Docker Desktop
    echo 2. Выполните: docker system prune -a
    echo 3. См. DOCKER_TROUBLESHOOTING_500.md
    echo.
    echo Для просмотра логов: docker-compose logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Контейнеры успешно запущены!
echo ========================================
echo.
echo Приложение доступно по адресу:
echo   http://localhost:5000
echo.
echo Health check:
echo   http://localhost:5000/health
echo.
echo Для просмотра логов:
echo   docker-compose logs -f
echo.
echo Для остановки:
echo   docker-compose down
echo.
echo Открываю браузер...
timeout /t 3 >nul
start http://localhost:5000

pause
