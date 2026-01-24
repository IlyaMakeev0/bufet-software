@echo off
echo ========================================
echo Сброс базы данных с новой структурой
echo ========================================
echo.

echo Останавливаем Docker контейнеры...
docker-compose down -v

echo.
echo Удаляем старые данные...
if exist school_canteen.db del school_canteen.db

echo.
echo Запускаем контейнеры заново...
docker-compose up -d

echo.
echo Ожидаем инициализации базы данных (35 секунд)...
timeout /t 35 /nobreak

echo.
echo Добавляем недостающие таблицы...
docker cp add-missing-tables.sql school-canteen-db:/tmp/add-tables.sql
docker exec school-canteen-db psql -U canteen_user -d school_canteen -f /tmp/add-tables.sql

echo.
echo Заполняем склад продуктами...
docker cp populate-inventory.sql school-canteen-db:/tmp/populate.sql
docker exec school-canteen-db psql -U canteen_user -d school_canteen -f /tmp/populate.sql

echo.
echo Добавляем ингредиенты к блюдам...
docker cp working-ingredients.sql school-canteen-db:/tmp/ingredients.sql
docker exec school-canteen-db psql -U canteen_user -d school_canteen -f /tmp/ingredients.sql

echo.
echo ========================================
echo База данных пересоздана!
echo ========================================
echo.
echo Новые возможности:
echo - Связь ингредиентов с блюдами (1350 записей)
echo - Автоматическое списание при выдаче
echo - История изменений склада
echo - Минимальные остатки продуктов (30 продуктов)
echo.
echo Откройте http://localhost:3000
echo.
pause
