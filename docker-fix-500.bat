@echo off
echo ========================================
echo Docker 500 Error - Fix Script
echo ========================================
echo.

echo Этот скрипт попытается исправить ошибку 500 Internal Server Error
echo.
pause

echo.
echo [1/5] Остановка контейнеров...
docker-compose down -v

echo.
echo [2/5] Очистка Docker...
docker system prune -a -f

echo.
echo [3/5] Скачивание образа PostgreSQL...
echo Пробую postgres:16-alpine...
docker pull postgres:16-alpine
if %errorlevel% neq 0 (
    echo Не удалось. Пробую postgres:16...
    docker pull postgres:16
    if %errorlevel% neq 0 (
        echo Не удалось. Пробую postgres:latest...
        docker pull postgres:latest
    )
)

echo.
echo [4/5] Скачивание образа Node.js...
docker pull node:18-alpine

echo.
echo [5/5] Запуск проекта...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Все еще есть ошибки!
    echo.
    echo Попробуйте:
    echo 1. Перезагрузить компьютер
    echo 2. Переустановить Docker Desktop
    echo 3. См. DOCKER_TROUBLESHOOTING_500.md
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Проблема исправлена!
echo ========================================
echo.
echo Приложение доступно: http://localhost:5000
echo.

pause
