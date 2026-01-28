@echo off
chcp 65001 >nul
echo ========================================
echo 🔒 Настройка HTTPS с Let's Encrypt
echo ========================================
echo.

REM Проверка аргументов
if "%~1"=="" (
    echo ❌ Ошибка: Не указан домен
    echo.
    echo Использование: setup-ssl.bat ДОМЕН EMAIL
    echo Пример: setup-ssl.bat example.com admin@example.com
    echo.
    pause
    exit /b 1
)

if "%~2"=="" (
    echo ❌ Ошибка: Не указан email
    echo.
    echo Использование: setup-ssl.bat ДОМЕН EMAIL
    echo Пример: setup-ssl.bat example.com admin@example.com
    echo.
    pause
    exit /b 1
)

set DOMAIN=%~1
set EMAIL=%~2
set STAGING=%~3

echo Домен: %DOMAIN%
echo Email: %EMAIL%
echo.

REM Проверка Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker не установлен!
    echo Установите Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker установлен
echo.

REM Создание директорий
echo 📁 Создание директорий...
if not exist "certbot\conf" mkdir certbot\conf
if not exist "certbot\www" mkdir certbot\www
echo ✅ Директории созданы
echo.

REM Скачивание параметров TLS
echo 📥 Скачивание параметров TLS...
if not exist "certbot\conf\options-ssl-nginx.conf" (
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -o certbot\conf\options-ssl-nginx.conf
)
if not exist "certbot\conf\ssl-dhparams.pem" (
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem -o certbot\conf\ssl-dhparams.pem
)
echo ✅ Параметры TLS скачаны
echo.

REM Обновление nginx конфигурации
echo 🔧 Обновление nginx конфигурации...
powershell -Command "(Get-Content CICD\nginx.ssl.conf) -replace 'your-domain.com', '%DOMAIN%' | Set-Content CICD\nginx.ssl.conf"
echo ✅ Конфигурация обновлена
echo.

REM Запуск nginx
echo 🚀 Запуск nginx...
docker-compose -f CICD\docker-compose.ssl.yml up -d frontend
timeout /t 5 /nobreak >nul
echo ✅ Nginx запущен
echo.

REM Получение сертификата
echo 🔐 Получение SSL сертификата...
if "%STAGING%"=="1" (
    echo ⚠️  Используется staging режим (для тестирования)
    docker-compose -f CICD\docker-compose.ssl.yml run --rm certbot certonly --webroot -w /var/www/certbot --staging --email %EMAIL% --agree-tos --no-eff-email -d %DOMAIN%
) else (
    docker-compose -f CICD\docker-compose.ssl.yml run --rm certbot certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d %DOMAIN%
)

if errorlevel 1 (
    echo.
    echo ❌ Не удалось получить сертификат
    echo.
    echo Возможные причины:
    echo - DNS не указывает на этот сервер
    echo - Порты 80 или 443 закрыты
    echo - Достигнут лимит Let's Encrypt
    echo.
    echo Попробуйте staging режим для тестирования:
    echo setup-ssl.bat %DOMAIN% %EMAIL% 1
    echo.
    pause
    exit /b 1
)

echo ✅ Сертификат получен!
echo.

REM Перезапуск nginx
echo 🔄 Перезапуск nginx...
docker-compose -f CICD\docker-compose.ssl.yml restart frontend
echo ✅ Nginx перезапущен
echo.

echo ========================================
echo ✅ Настройка завершена!
echo ========================================
echo.
echo Ваш сайт теперь доступен по адресу:
echo https://%DOMAIN%
echo.
echo Сертификат будет автоматически обновляться каждые 12 часов
echo.
echo Проверьте что сайт работает:
echo curl -I https://%DOMAIN%
echo.
echo Для просмотра логов:
echo docker-compose -f CICD\docker-compose.ssl.yml logs certbot
echo.
pause
