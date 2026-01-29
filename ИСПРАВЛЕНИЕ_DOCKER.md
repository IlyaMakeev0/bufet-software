# 🔧 Исправление Docker - Контейнер Unhealthy

## ✅ Что Было Исправлено

### Проблема
```
ERROR: for app  Container "89d65879dc44" is unhealthy.
ERROR: Encountered errors while bringing up the project.
```

### Причины
1. `server/index-docker.js` не поддерживал HTTPS
2. Отсутствовал healthcheck для контейнера app
3. Порты в Dockerfile не соответствовали конфигурации

### Решение

**Обновлены файлы:**

1. **server/index-docker.js**
   - ✅ Добавлена поддержка HTTPS
   - ✅ Добавлена поддержка HTTP редиректа
   - ✅ Автоматическая загрузка SSL сертификатов
   - ✅ Fallback на HTTP если нет сертификатов

2. **docker-compose.https.yml**
   - ✅ Добавлен healthcheck для контейнера app
   - ✅ Проверка через /health endpoint
   - ✅ Увеличен start_period до 40s

3. **Dockerfile**
   - ✅ Обновлены порты (8080, 8443)
   - ✅ Обновлены переменные окружения

---

## 🚀 Запуск После Исправления

### Шаг 1: Остановить старые контейнеры

```bash
docker-compose -f docker-compose.https.yml down -v
```

### Шаг 2: Очистить Docker кеш (опционально)

```bash
# Удалить старые образы
docker system prune -a

# Или только неиспользуемые образы
docker image prune -a
```

### Шаг 3: Пересобрать и запустить

```bash
# Через скрипт
chmod +x docker-start-https.sh
./docker-start-https.sh

# Или вручную
docker-compose -f docker-compose.https.yml up -d --build
```

### Шаг 4: Проверить статус

```bash
# Статус контейнеров
docker-compose -f docker-compose.https.yml ps

# Логи
docker-compose -f docker-compose.https.yml logs -f app
```

---

## 🧪 Проверка Работы

### Проверка Healthcheck

```bash
# Проверить health status
docker inspect school-canteen-app | grep -A 10 Health

# Или через docker-compose
docker-compose -f docker-compose.https.yml ps
```

Должно быть: `State: healthy`

### Проверка Endpoint

```bash
# Проверка health endpoint
curl http://localhost:8080/health

# Должен вернуть:
# {"status":"ok","timestamp":"2026-01-29T..."}
```

### Проверка HTTPS

```bash
# Проверка HTTPS
curl -k https://localhost:8443/health

# Проверка редиректа
curl -I http://localhost:8080
# Должен вернуть: 301 Moved Permanently
```

---

## 📊 Что Изменилось в index-docker.js

### До (только HTTP)
```javascript
const PORT = process.env.PORT || 80
app.listen(PORT, '0.0.0.0', ...)
```

### После (HTTPS + HTTP)
```javascript
const HTTP_PORT = process.env.HTTP_PORT || 8080
const HTTPS_PORT = process.env.HTTPS_PORT || 8443

// Загрузка SSL сертификатов
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  sslOptions = { key: ..., cert: ... }
}

// HTTPS сервер
https.createServer(sslOptions, app).listen(HTTPS_PORT, ...)

// HTTP редирект
if (ENABLE_HTTP_REDIRECT) {
  httpApp.listen(HTTP_PORT, ...)
}
```

---

## 🔍 Healthcheck Конфигурация

### docker-compose.https.yml
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
  interval: 30s      # Проверка каждые 30 секунд
  timeout: 10s       # Таймаут 10 секунд
  retries: 3         # 3 попытки
  start_period: 40s  # Ждать 40 секунд перед первой проверкой
```

### Endpoint /health
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

---

## 🆘 Решение Проблем

### Контейнер все еще unhealthy

**Проверить логи:**
```bash
docker-compose -f docker-compose.https.yml logs app
```

**Возможные причины:**
1. База данных не готова → увеличьте start_period
2. Порт занят → проверьте `lsof -i :8080`
3. Ошибка в коде → смотрите логи

### База данных не подключается

**Проверить PostgreSQL:**
```bash
docker-compose -f docker-compose.https.yml logs postgres
```

**Проверить healthcheck БД:**
```bash
docker inspect school-canteen-db | grep -A 10 Health
```

### Сертификаты не загружаются

**Проверить монтирование:**
```bash
docker exec school-canteen-app ls -la /app/cert/
```

**Должно быть:**
```
-r--r--r-- 1 root root 1707 key.txt
-r--r--r-- 1 root root 2277 www_autogreatfood_ru_2026_08_30.crt
```

### Порты не открываются

**Проверить, что порты свободны:**
```bash
sudo lsof -i :8080
sudo lsof -i :8443
```

**Освободить порт:**
```bash
sudo kill -9 PID
```

---

## 📋 Чеклист После Исправления

- [ ] Остановлены старые контейнеры
- [ ] Пересобраны образы
- [ ] Контейнеры запущены
- [ ] Статус: healthy
- [ ] /health endpoint отвечает
- [ ] HTTPS работает (https://localhost:8443)
- [ ] HTTP редирект работает
- [ ] Логи без ошибок

---

## 🎯 Быстрая Команда

```bash
# Все в одной команде
docker-compose -f docker-compose.https.yml down -v && \
docker-compose -f docker-compose.https.yml up -d --build && \
sleep 45 && \
docker-compose -f docker-compose.https.yml ps && \
curl http://localhost:8080/health
```

---

## 📖 Дополнительная Информация

### Логи в реальном времени
```bash
docker-compose -f docker-compose.https.yml logs -f
```

### Перезапуск только app
```bash
docker-compose -f docker-compose.https.yml restart app
```

### Войти в контейнер
```bash
docker exec -it school-canteen-app sh
```

### Проверить переменные окружения
```bash
docker exec school-canteen-app env | grep PORT
```

---

## 🎉 Готово!

После исправлений контейнер должен запуститься успешно и показать статус `healthy`.

**Проверьте:**
```bash
docker-compose -f docker-compose.https.yml ps
```

**Откройте:**
```
https://localhost:8443
```

Все должно работать! 🚀
