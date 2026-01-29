#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🧹 ПОЛНАЯ ОЧИСТКА И ПЕРЕЗАПУСК DOCKER                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣ Остановка всех связанных контейнеров..."
docker stop school-canteen-app school-canteen-db 2>/dev/null || true

echo ""
echo "2️⃣ Удаление контейнеров..."
docker rm school-canteen-app school-canteen-db 2>/dev/null || true

echo ""
echo "3️⃣ Остановка через docker-compose (все варианты)..."
docker-compose -f docker-compose.https.yml down 2>/dev/null || true
docker-compose -f docker-compose.https-no-health.yml down 2>/dev/null || true
docker-compose -f docker-compose.yml down 2>/dev/null || true

echo ""
echo "4️⃣ Удаление volumes (опционально)..."
read -p "Удалить данные базы данных? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker volume rm bufet-software_postgres_data 2>/dev/null || true
    echo "✅ Volumes удалены"
else
    echo "⏭️  Volumes сохранены"
fi

echo ""
echo "5️⃣ Очистка неиспользуемых образов (опционально)..."
read -p "Очистить старые образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker image prune -f
    echo "✅ Образы очищены"
else
    echo "⏭️  Образы сохранены"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 ЗАПУСК НОВЫХ КОНТЕЙНЕРОВ"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Выберите конфигурацию:"
echo "  1) БЕЗ healthcheck (рекомендуется для отладки)"
echo "  2) С healthcheck (для production)"
echo ""
read -p "Ваш выбор (1/2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]
then
    echo ""
    echo "Запуск БЕЗ healthcheck..."
    docker-compose -f docker-compose.https-no-health.yml up -d --build
    COMPOSE_FILE="docker-compose.https-no-health.yml"
else
    echo ""
    echo "Запуск С healthcheck..."
    docker-compose -f docker-compose.https.yml up -d --build
    COMPOSE_FILE="docker-compose.https.yml"
fi

echo ""
echo "⏳ Ожидание запуска (45 секунд)..."
for i in {45..1}; do
    echo -ne "⏳ $i секунд...\r"
    sleep 1
done
echo ""

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📊 СТАТУС КОНТЕЙНЕРОВ"
echo "═══════════════════════════════════════════════════════════"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🧪 ПРОВЕРКА РАБОТЫ"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Проверка health endpoint..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health endpoint работает!"
    curl -s http://localhost:8080/health
else
    echo "❌ Health endpoint не отвечает"
    echo ""
    echo "Проверьте логи:"
    echo "  docker-compose -f $COMPOSE_FILE logs app"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🌐 ДОСТУП"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  🔒 HTTPS: https://localhost:8443"
echo "  🔄 HTTP:  http://localhost:8080"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📋 ПОЛЕЗНЫЕ КОМАНДЫ"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Логи:      docker-compose -f $COMPOSE_FILE logs -f"
echo "  Остановка: docker-compose -f $COMPOSE_FILE down"
echo "  Статус:    docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "✅ Готово!"
echo ""
