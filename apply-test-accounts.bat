@echo off
echo ========================================
echo Создание тестовых аккаунтов
echo ========================================
echo.

echo Применяем SQL скрипт для создания тестовых аккаунтов...
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen < create-test-accounts.sql

echo.
echo ========================================
echo Готово!
echo ========================================
echo.
echo Тестовые аккаунты:
echo.
echo СТУДЕНТ:
echo   Email: student@test.com
echo   Пароль: test123
echo.
echo ПОВАР:
echo   Email: chef@test.com
echo   Пароль: test123
echo.
echo АДМИНИСТРАТОР:
echo   Email: admin@test.com
echo   Пароль: test123
echo.
echo Дополнительные студенты:
echo   student2@test.com / test123
echo   student3@test.com / test123
echo.
pause
