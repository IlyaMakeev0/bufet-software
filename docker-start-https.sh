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
echo "Building and starting HTTPS containers..."
docker-compose -f docker-compose.https.yml up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "========================================"
echo "  Server Status"
echo "========================================"
docker-compose -f docker-compose.https.yml ps

echo ""
echo "========================================"
echo "  Access URLs"
echo "========================================"
echo "  HTTPS: https://www.autogreatfood.ru:8443"
echo "  HTTPS: https://autogreatfood.ru:8443"
echo "  HTTPS: https://localhost:8443"
echo ""
echo "  HTTP: http://localhost:8080 (redirects to HTTPS)"
echo "========================================"
echo ""
echo "To view logs: docker-compose -f docker-compose.https.yml logs -f"
echo "To stop: docker-compose -f docker-compose.https.yml down"
echo ""
