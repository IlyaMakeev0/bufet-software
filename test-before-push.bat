@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         🧪 ПРОВЕРКА ПЕРЕД PUSH                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Проверка синтаксиса JavaScript...
echo.
node --check server/index.js
if %errorlevel% neq 0 (
    echo ❌ Ошибка синтаксиса в server/index.js
    pause
    exit /b 1
)
echo ✅ Синтаксис корректен
echo.

echo [2/5] Проверка Docker конфигурации...
echo.
docker-compose -f docker-compose.production.yml config > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ошибка в docker-compose.production.yml
    pause
    exit /b 1
)
echo ✅ Docker конфигурация корректна
echo.

echo [3/5] Проверка наличия необходимых файлов...
echo.
if not exist "server\index.js" (
    echo ❌ Отсутствует server\index.js
    pause
    exit /b 1
)
if not exist "docker-compose.production.yml" (
    echo ❌ Отсутствует docker-compose.production.yml
    pause
    exit /b 1
)
if not exist "package.json" (
    echo ❌ Отсутствует package.json
    pause
    exit /b 1
)
echo ✅ Все необходимые файлы на месте
echo.

echo [4/5] Проверка Git статуса...
echo.
git status --short
echo.

echo [5/5] Проверка непроиндексированных изменений...
echo.
git diff --name-only
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ                             ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Готово к push!
echo.
echo Команды для push:
echo   git add .
echo   git commit -m "Your message"
echo   git push origin main
echo.
pause
