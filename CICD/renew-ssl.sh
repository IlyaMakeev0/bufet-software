#!/bin/bash

# Скрипт для ручного обновления SSL сертификатов
# Использование: ./renew-ssl.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info "Обновление SSL сертификатов..."

# Обновление сертификатов
docker-compose -f docker-compose.ssl.yml run --rm certbot renew

# Перезапуск nginx
info "Перезапуск nginx..."
docker-compose -f docker-compose.ssl.yml restart frontend

success "Сертификаты обновлены!"
info "Проверьте срок действия:"
echo "  docker-compose -f docker-compose.ssl.yml run --rm certbot certificates"
