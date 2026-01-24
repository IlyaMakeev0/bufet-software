@echo off
echo ========================================
echo School Canteen - Docker Stop Script
echo ========================================
echo.

echo Остановка контейнеров...
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ошибка при остановке контейнеров!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Контейнеры успешно остановлены!
echo.

pause
