#!/bin/bash

echo "========================================"
echo "  Docker HTTPS Server Startup"
echo "  www.autogreatfood.ru"
echo "  Ports: 8080 (HTTP) → 8443 (HTTPS)"
echo "========================================"
echo ""

echo "Stopping existing containers..."
docker-compose -f docker-compose.https.yml down

echo ""
echo "Removing old volumes (optional)..."
read -p "Remove old database data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker-compose -f docker-compose.https.yml down -v
    echo "✅ Volumes removed"
fi

echo ""
echo "Building and starting HTTPS containers..."
docker-compose -f docker-compose.https.yml up -d --build

echo ""
echo "Waiting for services to start (45 seconds)..."
for i in {45..1}; do
    echo -ne "⏳ $i seconds remaining...\r"
    sleep 1
done
echo ""

echo ""
echo "========================================"
echo "  Server Status"
echo "========================================"
docker-compose -f docker-compose.https.yml ps

echo ""
echo "========================================"
echo "  Health Check"
echo "========================================"
echo "Checking /health endpoint..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    curl -s http://localhost:8080/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/health
else
    echo "⚠️  Health check failed. Check logs:"
    echo "   docker-compose -f docker-compose.https.yml logs app"
fi

echo ""
echo "========================================"
echo "  Access URLs"
echo "========================================"
echo "  🔒 HTTPS: https://localhost:8443"
echo "  🔒 HTTPS: https://www.autogreatfood.ru:8443"
echo "  🔄 HTTP:  http://localhost:8080 (redirects to HTTPS)"
echo "========================================"
echo ""
echo "📋 Useful commands:"
echo "  View logs:    docker-compose -f docker-compose.https.yml logs -f"
echo "  Stop:         docker-compose -f docker-compose.https.yml down"
echo "  Restart:      docker-compose -f docker-compose.https.yml restart"
echo "  Health check: curl http://localhost:8080/health"
echo ""
