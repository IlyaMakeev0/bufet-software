@echo off
echo ========================================
echo Перезапуск Docker с новым дизайном
echo ========================================
echo.

echo [1/5] Остановка контейнеров...
docker-compose down
echo.

echo [2/5] Удаление старых образов...
docker-compose rm -f
echo.

echo [3/5] Пересборка образов...
docker-compose build --no-cache
echo.

echo [4/5] Запуск контейнеров...
docker-compose up -d
echo.

echo [5/5] Ожидание запуска (10 секунд)...
timeout /t 10 /nobreak
echo.

echo ========================================
echo Проверка статуса
echo ========================================
docker-compose ps
echo.

echo ========================================
echo Логи приложения
echo ========================================
docker-compose logs --tail=50 app
echo.

echo ========================================
echo Готово!
echo ========================================
echo.
echo Приложение доступно по адресу:
echo http://localhost:5000
echo.
echo Для просмотра логов в реальном времени:
echo docker-compose logs -f app
echo.
pause
