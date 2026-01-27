@echo off
echo ========================================
echo ИСПРАВЛЕНИЕ ПОДКЛЮЧЕНИЯ К БД
echo ========================================
echo.

echo Останавливаем контейнеры...
docker-compose down

echo.
echo Запускаем контейнеры заново...
docker-compose up -d

echo.
echo Ожидание запуска (10 секунд)...
timeout /t 10 /nobreak > nul

echo.
echo Проверка логов приложения:
echo ========================================
docker logs --tail 20 school-canteen-app

echo.
echo ========================================
echo Готово!
echo ========================================
echo.
echo Откройте: http://localhost:5000
echo.
echo Тестовые аккаунты:
echo   student@test.com / test123
echo   chef@test.com / test123
echo   admin@test.com / test123
echo.
pause
