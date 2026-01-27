@echo off
echo ========================================
echo Проверка исправлений
echo ========================================
echo.

echo [1/4] Проверка файлов дизайна...
if exist "src\index.css" (
    echo ✓ src\index.css найден
) else (
    echo ✗ src\index.css НЕ найден
)

if exist "src\pages\Dashboard.css" (
    echo ✓ src\pages\Dashboard.css найден
) else (
    echo ✗ src\pages\Dashboard.css НЕ найден
)

if exist "src\pages\Auth.css" (
    echo ✓ src\pages\Auth.css найден
) else (
    echo ✗ src\pages\Auth.css НЕ найден
)

if exist "src\pages\Home.css" (
    echo ✓ src\pages\Home.css найден
) else (
    echo ✗ src\pages\Home.css НЕ найден
)

echo.
echo [2/4] Проверка документации...
if exist "HOSTING_GUIDE.md" (
    echo ✓ HOSTING_GUIDE.md создан
) else (
    echo ✗ HOSTING_GUIDE.md НЕ создан
)

if exist "FIXES_APPLIED.md" (
    echo ✓ FIXES_APPLIED.md создан
) else (
    echo ✗ FIXES_APPLIED.md НЕ создан
)

if exist ".env.production" (
    echo ✓ .env.production создан
) else (
    echo ✗ .env.production НЕ создан
)

echo.
echo [3/4] Проверка базы данных...
if exist "server\database.js" (
    echo ✓ server\database.js найден
    findstr /C:"parseFloat" server\database.js >nul
    if errorlevel 1 (
        echo ✗ Исправление типов НЕ найдено
    ) else (
        echo ✓ Исправление типов применено
    )
) else (
    echo ✗ server\database.js НЕ найден
)

echo.
echo [4/4] Проверка роутов...
if exist "server\routes\auth.js" (
    echo ✓ server\routes\auth.js найден
    findstr /C:"parseFloat(amount)" server\routes\auth.js >nul
    if errorlevel 1 (
        echo ✗ Исправление пополнения баланса НЕ найдено
    ) else (
        echo ✓ Исправление пополнения баланса применено
    )
) else (
    echo ✗ server\routes\auth.js НЕ найден
)

echo.
echo ========================================
echo Проверка завершена!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Запустите: npm install
echo 2. Запустите: npm run dev
echo 3. Откройте: http://localhost:5000
echo 4. Проверьте новый дизайн
echo 5. Проверьте пополнение баланса
echo.
echo Для хостинга смотрите: HOSTING_GUIDE.md
echo.
pause
