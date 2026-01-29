@echo off
echo ========================================
echo School Canteen - Docker Rebuild Script
echo ========================================
echo.

echo Остановка и удаление контейнеров...
docker-compose down

echo.
echo Пересборка образов без кэша...
docker-compose build --no-cache

echo.
echo Запуск контейнеров...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ошибка при пересборке!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Контейнеры успешно пересобраны и запущены!
echo.
echo Приложение доступно по адресу:
echo   http://localhost:5000
echo.

pause
