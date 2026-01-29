#!/bin/bash

echo "Checking Docker logs..."
echo ""

echo "=== App Container Logs ==="
docker-compose -f docker-compose.https.yml logs --tail=50 app

echo ""
echo "=== PostgreSQL Container Logs ==="
docker-compose -f docker-compose.https.yml logs --tail=20 postgres

echo ""
echo "=== Container Status ==="
docker-compose -f docker-compose.https.yml ps

echo ""
echo "=== Health Check Details ==="
docker inspect school-canteen-app 2>/dev/null | grep -A 20 Health || echo "Container not found"
