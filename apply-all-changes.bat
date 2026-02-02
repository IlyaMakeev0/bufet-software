@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   ПРИМЕНЕНИЕ ВСЕХ ИЗМЕНЕНИЙ
echo ═══════════════════════════════════════════════════════════════
echo.

echo [1/4] Остановка контейнеров...
docker-compose -f docker-compose.production.yml down
echo ✅ Контейнеры остановлены
echo.

echo [2/4] Запуск PostgreSQL...
docker-compose -f docker-compose.production.yml up -d postgres
echo ⏳ Ожидание запуска PostgreSQL (15 секунд)...
timeout /t 15 /nobreak >nul
echo ✅ PostgreSQL запущен
echo.

echo [3/4] Применение миграции базы данных...
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen < add-menu-requests-and-notifications.sql
if %errorlevel% equ 0 (
    echo ✅ Миграция применена успешно
) else (
    echo ❌ Ошибка применения миграции
    echo Попробуйте выполнить команду вручную:
    echo docker exec -i school-canteen-db psql -U canteen_user -d school_canteen ^< add-menu-requests-and-notifications.sql
    pause
    exit /b 1
)
echo.

echo [4/4] Запуск всех контейнеров...
docker-compose -f docker-compose.production.yml up -d --build
echo ✅ Контейнеры запущены
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ✨ ВСЕ ИЗМЕНЕНИЯ ПРИМЕНЕНЫ!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Проверьте логи:
echo docker-compose -f docker-compose.production.yml logs -f backend
echo.
echo Сайт доступен по адресу: https://autogreatfood.ru
echo.
pause
