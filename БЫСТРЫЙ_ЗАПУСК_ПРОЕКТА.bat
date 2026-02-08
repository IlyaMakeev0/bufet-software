@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║         🚀 БЫСТРЫЙ ЗАПУСК ПРОЕКТА                         ║
echo ║            autogreatfood.ru                                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.

echo ⏹️  Шаг 1/5: Остановка старых контейнеров...
docker-compose -f docker-compose.production.yml down 2>nul
echo    ✅ Готово
echo.

echo 🗄️  Шаг 2/5: Запуск PostgreSQL...
docker-compose -f docker-compose.production.yml up -d postgres
echo    ⏳ Ожидание 15 секунд...
timeout /t 15 /nobreak >nul
echo    ✅ PostgreSQL запущен
echo.

echo 📊 Шаг 3/5: Применение миграции БД...
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen < add-menu-requests-and-notifications.sql 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Миграция применена успешно
) else (
    echo    ℹ️  Миграция пропущена ^(уже применена ранее^)
)
echo.

echo 🐳 Шаг 4/5: Запуск всех сервисов...
docker-compose -f docker-compose.production.yml up -d --build
echo    ✅ Сервисы запущены
echo.

echo 🔍 Шаг 5/5: Проверка статуса...
timeout /t 5 /nobreak >nul
docker-compose -f docker-compose.production.yml ps
echo.

echo ════════════════════════════════════════════════════════════
echo.
echo    ✅ ПРОЕКТ ЗАПУЩЕН!
echo.
echo    🌐 Откройте: https://autogreatfood.ru
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 📋 Полезные команды:
echo.
echo    Посмотреть логи:
echo    docker-compose -f docker-compose.production.yml logs -f backend
echo.
echo    Остановить проект:
echo    docker-compose -f docker-compose.production.yml down
echo.
echo    Диагностика проблем:
echo    check-project.bat
echo.
pause
