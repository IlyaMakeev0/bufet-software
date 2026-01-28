@echo off
echo ========================================
echo Применение миграции QR-кодов
echo ========================================
echo.

echo Добавление полей для QR-кодов в базу данных...
sqlite3 school_canteen.db < add-qr-code-fields.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Миграция успешно применена!
    echo ========================================
    echo.
    echo Добавлены поля:
    echo - orders.qr_token
    echo - orders.qr_expires_at
    echo - orders.issued_at
    echo - orders.issued_by
    echo - subscriptions.qr_token
    echo - subscriptions.qr_expires_at
    echo.
) else (
    echo.
    echo ========================================
    echo Ошибка применения миграции!
    echo ========================================
    echo.
)

pause
