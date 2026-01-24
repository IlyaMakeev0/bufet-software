@echo off
echo ========================================
echo School Canteen - Simple Docker Start
echo ========================================
echo.
echo Используется упрощенная конфигурация
echo для решения проблем с Docker Desktop
echo.

REM Проверка Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker не установлен!
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker не запущен!
    echo Запустите Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker готов
echo.

echo Остановка старых контейнеров...
docker-compose down >nul 2>&1
docker-compose -f docker-compose.simple.yml down >nul 2>&1

echo.
echo Запуск с упрощенной конфигурацией...
echo (Это может занять 3-5 минут при первом запуске)
echo.

docker-compose -f docker-compose.simple.yml up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ошибка при запуске!
    echo.
    echo Попробуйте:
    echo 1. Перезапустить Docker Desktop
    echo 2. Выполнить: docker system prune -a
    echo 3. См. DOCKER_TROUBLESHOOTING_500.md
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Контейнеры запущены!
echo ========================================
echo.
echo Приложение: http://localhost:5000
echo Health check: http://localhost:5000/health
echo.
echo Логи: docker-compose -f docker-compose.simple.yml logs -f
echo Остановка: docker-compose -f docker-compose.simple.yml down
echo.

timeout /t 3 >nul
start http://localhost:5000

pause
