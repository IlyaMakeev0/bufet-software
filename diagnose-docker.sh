#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🔍 ДИАГНОСТИКА DOCKER ПРОБЛЕМЫ                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣ Остановка контейнеров..."
docker-compose -f docker-compose.https.yml down

echo ""
echo "2️⃣ Запуск БЕЗ healthcheck для диагностики..."
docker-compose -f docker-compose.https-no-health.yml up -d --build

echo ""
echo "3️⃣ Ожидание 30 секунд..."
sleep 30

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📊 СТАТУС КОНТЕЙНЕРОВ"
echo "═══════════════════════════════════════════════════════════"
docker-compose -f docker-compose.https-no-health.yml ps

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📝 ЛОГИ APP (последние 50 строк)"
echo "═══════════════════════════════════════════════════════════"
docker-compose -f docker-compose.https-no-health.yml logs --tail=50 app

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📝 ЛОГИ POSTGRES (последние 20 строк)"
echo "═══════════════════════════════════════════════════════════"
docker-compose -f docker-compose.https-no-health.yml logs --tail=20 postgres

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🧪 ТЕСТИРОВАНИЕ ENDPOINTS"
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "Тест 1: Health endpoint (HTTP)"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ HTTP Health endpoint работает!"
    curl -s http://localhost:8080/health
else
    echo "❌ HTTP Health endpoint НЕ работает"
fi

echo ""
echo "Тест 2: Health endpoint (HTTPS)"
if curl -k -s https://localhost:8443/health > /dev/null 2>&1; then
    echo "✅ HTTPS Health endpoint работает!"
    curl -k -s https://localhost:8443/health
else
    echo "❌ HTTPS Health endpoint НЕ работает"
fi

echo ""
echo "Тест 3: Редирект HTTP → HTTPS"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$HTTP_CODE" = "301" ]; then
    echo "✅ HTTP редирект работает (код: $HTTP_CODE)"
else
    echo "⚠️  HTTP редирект вернул код: $HTTP_CODE"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔍 ПРОВЕРКА ПОРТОВ"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Порт 8080:"
if nc -z localhost 8080 2>/dev/null || timeout 1 bash -c 'cat < /dev/null > /dev/tcp/localhost/8080' 2>/dev/null; then
    echo "✅ Порт 8080 открыт"
else
    echo "❌ Порт 8080 закрыт"
fi

echo ""
echo "Порт 8443:"
if nc -z localhost 8443 2>/dev/null || timeout 1 bash -c 'cat < /dev/null > /dev/tcp/localhost/8443' 2>/dev/null; then
    echo "✅ Порт 8443 открыт"
else
    echo "❌ Порт 8443 закрыт"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📁 ПРОВЕРКА СЕРТИФИКАТОВ В КОНТЕЙНЕРЕ"
echo "═══════════════════════════════════════════════════════════"
docker exec school-canteen-app ls -la /app/cert/ 2>/dev/null || echo "❌ Не удалось проверить сертификаты"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔧 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ В КОНТЕЙНЕРЕ"
echo "═══════════════════════════════════════════════════════════"
docker exec school-canteen-app env | grep -E "PORT|NODE_ENV|DB_HOST" 2>/dev/null || echo "❌ Не удалось получить переменные"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  💡 РЕКОМЕНДАЦИИ"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Если все тесты прошли успешно:"
echo "  → Проблема была в healthcheck"
echo "  → Используйте docker-compose.https-no-health.yml"
echo ""
echo "Если есть ошибки в логах:"
echo "  → Проверьте логи выше"
echo "  → Исправьте ошибки в коде"
echo ""
echo "Если порты закрыты:"
echo "  → Проверьте, что приложение запустилось"
echo "  → Смотрите логи: docker-compose -f docker-compose.https-no-health.yml logs app"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Для остановки: docker-compose -f docker-compose.https-no-health.yml down"
echo ""
