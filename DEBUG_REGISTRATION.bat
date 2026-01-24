@echo off
echo ========================================
echo Debug Registration - Real-time Logs
echo ========================================
echo.
echo Открываю логи в реальном времени...
echo Попробуйте зарегистрироваться сейчас!
echo.
echo Нажмите Ctrl+C для выхода
echo.

docker-compose logs app -f
