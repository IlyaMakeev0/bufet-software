@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         🔍 ДИАГНОСТИКА ПРОЕКТА                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [1/7] Проверка Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker не установлен или не запущен
    pause
    exit /b 1
)
echo ✅ Docker работает
echo.

echo [2/7] Проверка Docker Compose...
docker-compose --version
if %errorlevel% neq 0 (
    echo ❌ Docker Compose не установлен
    pause
    exit /b 1
)
echo ✅ Docker Compose работает
echo.

echo [3/7] Статус контейнеров...
docker-compose -f docker-compose.production.yml ps
echo.

echo [4/7] Проверка портов 80 и 443...
netstat -ano | findstr ":80 " | findstr "LISTENING"
netstat -ano | findstr ":443 " | findstr "LISTENING"
echo.

echo [5/7] Логи PostgreSQL (последние 20 строк)...
echo ───────────────────────────────────────────────────────────────
docker-compose -f docker-compose.production.yml logs --tail=20 postgres
echo ───────────────────────────────────────────────────────────────
echo.

echo [6/7] Логи Backend (последние 30 строк)...
echo ───────────────────────────────────────────────────────────────
docker-compose -f docker-compose.production.yml logs --tail=30 backend
echo ───────────────────────────────────────────────────────────────
echo.

echo [7/7] Проверка доступности сайта...
curl -k -s -o nul -w "HTTP Status: %%{http_code}\n" https://localhost
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         ✅ ДИАГНОСТИКА ЗАВЕРШЕНА                             ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Если видите ошибки выше, скопируйте их и покажите мне.
echo.
pause
