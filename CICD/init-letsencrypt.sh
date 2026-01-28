#!/bin/bash

# Скрипт для первоначальной настройки Let's Encrypt SSL сертификатов
# Использование: ./init-letsencrypt.sh your-domain.com your-email@example.com

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции вывода
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Проверка аргументов
if [ "$#" -lt 2 ]; then
    error "Использование: $0 <domain> <email>\nПример: $0 example.com admin@example.com"
fi

DOMAIN=$1
EMAIL=$2
STAGING=${3:-0} # 0 = production, 1 = staging (для тестирования)

info "Настройка SSL для домена: $DOMAIN"
info "Email для уведомлений: $EMAIL"

# Проверка что домен указывает на этот сервер
info "Проверка DNS записей..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    warning "DNS запись домена ($DOMAIN_IP) не совпадает с IP сервера ($SERVER_IP)"
    warning "Убедитесь что A-запись домена указывает на IP этого сервера"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Отменено пользователем"
    fi
fi

# Создание директорий
info "Создание директорий..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Скачивание рекомендованных параметров TLS
info "Скачивание рекомендованных параметров TLS..."
if [ ! -e "./certbot/conf/options-ssl-nginx.conf" ] || [ ! -e "./certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
    success "Параметры TLS скачаны"
fi

# Создание временного самоподписанного сертификата
info "Создание временного самоподписанного сертификата..."
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
mkdir -p "./certbot/conf/live/$DOMAIN"

if [ ! -e "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt \
        certbot/certbot \
        certonly --standalone --register-unsafely-without-email --agree-tos \
        --staging -d $DOMAIN --cert-name $DOMAIN \
        || warning "Не удалось создать временный сертификат, продолжаем..."
fi

# Обновление nginx конфигурации с правильным доменом
info "Обновление nginx конфигурации..."
sed -i "s/your-domain.com/$DOMAIN/g" ./CICD/nginx.ssl.conf
success "Nginx конфигурация обновлена"

# Запуск nginx
info "Запуск nginx..."
docker-compose -f docker-compose.ssl.yml up -d frontend
sleep 5

# Удаление временного сертификата
info "Удаление временного сертификата..."
docker-compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Получение настоящего сертификата
info "Получение SSL сертификата от Let's Encrypt..."

if [ $STAGING != "0" ]; then
    warning "Используется staging режим (для тестирования)"
    STAGING_ARG="--staging"
else
    STAGING_ARG=""
fi

docker-compose -f docker-compose.ssl.yml run --rm certbot \
    certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    success "SSL сертификат успешно получен!"
else
    error "Не удалось получить SSL сертификат"
fi

# Перезапуск nginx с новым сертификатом
info "Перезапуск nginx..."
docker-compose -f docker-compose.ssl.yml restart frontend

success "Настройка завершена!"
echo ""
info "Ваш сайт теперь доступен по адресу: https://$DOMAIN"
info "Сертификат будет автоматически обновляться каждые 12 часов"
echo ""
warning "Проверьте что сайт работает корректно:"
echo "  curl -I https://$DOMAIN"
echo ""
info "Для просмотра логов certbot:"
echo "  docker-compose -f docker-compose.ssl.yml logs certbot"
