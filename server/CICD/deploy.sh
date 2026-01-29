#!/bin/bash

# Скрипт деплоя для проекта "Школьная столовая"
# Использование: ./deploy.sh [command]

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

# Проверка Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен. Установите Docker: https://docs.docker.com/get-docker/"
    fi
    
    if ! docker compose version &> /dev/null; then
        error "Docker Compose не установлен"
    fi
    
    success "Docker установлен"
}

# Проверка .env файла
check_env() {
    if [ ! -f ".env" ]; then
        warning ".env файл не найден"
        info "Создаю .env из примера..."
        cp CICD/.env.example .env
        warning "Отредактируйте .env файл перед запуском!"
        exit 1
    fi
    success ".env файл найден"
}

# Запуск сервисов
start() {
    info "Запуск сервисов..."
    check_docker
    check_env
    
    docker compose -f docker-compose.production.yml up -d
    
    success "Сервисы запущены!"
    info "Проверьте статус: ./deploy.sh status"
}

# Остановка сервисов
stop() {
    info "Остановка сервисов..."
    docker compose -f docker-compose.production.yml down
    success "Сервисы остановлены"
}

# Перезапуск сервисов
restart() {
    info "Перезапуск сервисов..."
    docker compose -f docker-compose.production.yml restart
    success "Сервисы перезапущены"
}

# Статус сервисов
status() {
    info "Статус сервисов:"
    docker compose -f docker-compose.production.yml ps
}

# Логи
logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker compose -f docker-compose.production.yml logs -f --tail=100
    else
        docker compose -f docker-compose.production.yml logs -f --tail=100 "$SERVICE"
    fi
}

# Обновление
update() {
    info "Обновление приложения..."
    
    # Скачиваем новые образы
    info "Скачивание новых образов..."
    docker compose -f docker-compose.production.yml pull
    
    # Перезапускаем сервисы
    info "Перезапуск сервисов..."
    docker compose -f docker-compose.production.yml up -d --remove-orphans
    
    # Очищаем старые образы
    info "Очистка старых образов..."
    docker image prune -af
    
    success "Обновление завершено!"
}

# Сборка локально
build() {
    info "Сборка образов локально..."
    docker compose -f docker-compose.production.yml build --no-cache
    success "Образы собраны"
}

# Health check
health() {
    info "Проверка здоровья сервисов..."
    
    # Backend
    if curl -f http://localhost:5000/api/menu &> /dev/null; then
        success "Backend: OK"
    else
        error "Backend: FAIL"
    fi
    
    # Frontend
    if curl -f http://localhost/ &> /dev/null; then
        success "Frontend: OK"
    else
        error "Frontend: FAIL"
    fi
    
    # Database
    if docker exec school-canteen-db pg_isready -U canteen_user &> /dev/null; then
        success "Database: OK"
    else
        error "Database: FAIL"
    fi
    
    success "Все сервисы работают!"
}

# Бэкап базы данных
backup() {
    BACKUP_DIR="./backups"
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$BACKUP_DIR"
    
    info "Создание бэкапа базы данных..."
    docker exec school-canteen-db pg_dump -U canteen_user school_canteen > "$BACKUP_FILE"
    
    success "Бэкап создан: $BACKUP_FILE"
}

# Восстановление базы данных
restore() {
    BACKUP_FILE=${1:-}
    
    if [ -z "$BACKUP_FILE" ]; then
        error "Укажите файл бэкапа: ./deploy.sh restore <файл>"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Файл не найден: $BACKUP_FILE"
    fi
    
    warning "Это удалит текущую базу данных!"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Отменено"
        exit 0
    fi
    
    info "Восстановление базы данных..."
    docker exec -i school-canteen-db psql -U canteen_user school_canteen < "$BACKUP_FILE"
    
    success "База данных восстановлена"
}

# Очистка
clean() {
    warning "Это удалит все контейнеры, образы и volumes!"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Отменено"
        exit 0
    fi
    
    info "Остановка сервисов..."
    docker compose -f docker-compose.production.yml down -v
    
    info "Очистка образов..."
    docker system prune -af
    
    success "Очистка завершена"
}

# Помощь
help() {
    cat << EOF
🚀 Скрипт деплоя для проекта "Школьная столовая"

Использование: ./deploy.sh [command]

Команды:
  start       Запустить все сервисы
  stop        Остановить все сервисы
  restart     Перезапустить все сервисы
  status      Показать статус сервисов
  logs        Показать логи (опционально: logs <service>)
  update      Обновить приложение (скачать новые образы и перезапустить)
  build       Собрать образы локально
  health      Проверить здоровье сервисов
  backup      Создать бэкап базы данных
  restore     Восстановить базу данных из бэкапа
  clean       Очистить все (контейнеры, образы, volumes)
  help        Показать эту справку

Примеры:
  ./deploy.sh start
  ./deploy.sh logs backend
  ./deploy.sh backup
  ./deploy.sh restore backups/backup_20260128_120000.sql

EOF
}

# Главная функция
main() {
    COMMAND=${1:-help}
    
    case $COMMAND in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs "${2:-}"
            ;;
        update)
            update
            ;;
        build)
            build
            ;;
        health)
            health
            ;;
        backup)
            backup
            ;;
        restore)
            restore "${2:-}"
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            help
            ;;
        *)
            error "Неизвестная команда: $COMMAND\nИспользуйте: ./deploy.sh help"
            ;;
    esac
}

# Запуск
main "$@"
