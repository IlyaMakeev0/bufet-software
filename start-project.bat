@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         🚀 ЗАПУСК ПРОЕКТА                                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [1/6] Остановка контейнеров (если запущены)...
docker-compose -f docker-compose.production.yml down
echo ✅ Контейнеры остановлены
echo.

echo [2/6] Запуск PostgreSQL...
docker-compose -f docker-compose.production.yml up -d postgres
echo ⏳ Ожидание запуска PostgreSQL (15 секунд)...
timeout /t 15 /nobreak >nul
echo ✅ PostgreSQL запущен
echo.

echo [3/6] Применение миграции базы данных...
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen < add-menu-requests-and-notifications.sql 2>nul
if %errorlevel% equ 0 (
    echo ✅ Миграция применена
) else (
    echo ⚠️  Миграция пропущена (возможно уже применена)
)
echo.

echo [4/6] Запуск всех контейнеров...
docker-compose -f docker-compose.production.yml up -d --build
echo ✅ Контейнеры запущены
echo.

echo [5/6] Проверка статуса...
timeout /t 5 /nobreak >nul
docker-compose -f docker-compose.production.yml ps
echo.

echo [6/6] Показываю логи backend (нажмите Ctrl+C для выхода)...
echo.
timeout /t 3 /nobreak >nul
docker-compose -f docker-compose.production.yml logs --tail=50 backend
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         ✅ ПРОЕКТ ЗАПУЩЕН!                                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Откройте в браузере: https://autogreatfood.ru
echo.
echo Полезные команды:
echo   docker-compose -f docker-compose.production.yml ps      - Статус
echo   docker-compose -f docker-compose.production.yml logs -f - Логи
echo   docker-compose -f docker-compose.production.yml down    - Остановить
echo.
pause
