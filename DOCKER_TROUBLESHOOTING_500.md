# 🔧 Решение ошибки 500 Internal Server Error

## Проблема
```
unable to get image 'postgres:15-alpine': request returned 500 Internal Server Error
```

## Причина
Проблема с Docker Desktop на Windows или несовместимость версии API.

---

## ✅ Решение 1: Перезапуск Docker Desktop (самое простое)

### Шаг 1: Полностью закройте Docker Desktop
```bash
# В PowerShell (от администратора)
Stop-Process -Name "Docker Desktop" -Force
```

Или:
1. Кликните правой кнопкой на иконку Docker в трее
2. Выберите "Quit Docker Desktop"
3. Подождите 10 секунд

### Шаг 2: Запустите Docker Desktop заново
1. Откройте Docker Desktop из меню Пуск
2. Дождитесь полного запуска (зеленая иконка)
3. Попробуйте снова:
```bash
docker-compose up --build -d
```

---

## ✅ Решение 2: Обновление образа PostgreSQL

Я уже обновил `docker-compose.yml` на более новую версию PostgreSQL.

### Проверьте изменения:
```bash
# Должно быть postgres:16-alpine вместо postgres:15-alpine
docker-compose config | findstr postgres
```

### Запустите заново:
```bash
docker-compose down
docker-compose up --build -d
```

---

## ✅ Решение 3: Ручное скачивание образа

### Скачайте образ вручную:
```bash
# Попробуйте скачать образ напрямую
docker pull postgres:16-alpine

# Если не работает, попробуйте без alpine
docker pull postgres:16

# Или используйте latest
docker pull postgres:latest
```

### Если скачалось, запустите проект:
```bash
docker-compose up -d
```

---

## ✅ Решение 4: Использование обычного образа (без alpine)

Если alpine версия не работает, используйте обычную:

### Измените docker-compose.yml:
```yaml
db:
  image: postgres:16  # Вместо postgres:16-alpine
```

### Запустите:
```bash
docker-compose down
docker-compose up --build -d
```

---

## ✅ Решение 5: Очистка Docker и перезапуск

### Полная очистка:
```bash
# Остановить все контейнеры
docker-compose down -v

# Удалить все образы
docker system prune -a --volumes -f

# Перезапустить Docker Desktop
# (закрыть и открыть заново)

# Запустить проект
docker-compose up --build -d
```

---

## ✅ Решение 6: Проверка настроек Docker Desktop

### Шаг 1: Откройте настройки Docker Desktop
1. Кликните на иконку Docker в трее
2. Settings → General

### Шаг 2: Проверьте настройки:
- ✅ "Use WSL 2 based engine" должен быть включен (если доступен)
- ✅ "Use Docker Compose V2" должен быть включен

### Шаг 3: Перезапустите Docker Desktop

---

## ✅ Решение 7: Обновление Docker Desktop

### Проверьте версию:
```bash
docker --version
docker-compose --version
```

### Если версия старая:
1. Скачайте последнюю версию: https://www.docker.com/products/docker-desktop/
2. Установите обновление
3. Перезагрузите компьютер
4. Попробуйте снова

---

## ✅ Решение 8: Альтернативный docker-compose.yml

Создайте файл `docker-compose.simple.yml`:

```yaml
services:
  db:
    image: postgres:latest
    container_name: school-canteen-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: school_canteen
      POSTGRES_USER: canteen_user
      POSTGRES_PASSWORD: canteen_password_2024
    ports:
      - "5432:5432"
    networks:
      - canteen-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: school-canteen-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: school_canteen
      DB_USER: canteen_user
      DB_PASSWORD: canteen_password_2024
    ports:
      - "5000:5000"
    depends_on:
      - db
    networks:
      - canteen-network

networks:
  canteen-network:
    driver: bridge
```

### Запустите с этим файлом:
```bash
docker-compose -f docker-compose.simple.yml up --build -d
```

---

## 🔍 Диагностика

### Проверьте статус Docker:
```bash
# Проверка Docker
docker info

# Проверка доступных образов
docker images

# Проверка запущенных контейнеров
docker ps -a
```

### Проверьте логи Docker Desktop:
1. Откройте Docker Desktop
2. Settings → Troubleshoot
3. Посмотрите логи

---

## 📝 Что попробовать по порядку:

1. ✅ **Перезапуск Docker Desktop** (2 минуты)
2. ✅ **Использование postgres:16-alpine** (уже сделано)
3. ✅ **Ручное скачивание образа** (5 минут)
4. ✅ **Использование postgres:16 без alpine** (2 минуты)
5. ✅ **Полная очистка Docker** (5 минут)
6. ✅ **Проверка настроек** (3 минуты)
7. ✅ **Обновление Docker Desktop** (10 минут)
8. ✅ **Альтернативный docker-compose** (2 минуты)

---

## 🎯 Рекомендуемый порядок действий:

```bash
# 1. Перезапустите Docker Desktop
# (закройте и откройте заново)

# 2. Попробуйте запустить
docker-compose down
docker-compose up --build -d

# 3. Если не работает, скачайте образ вручную
docker pull postgres:16-alpine

# 4. Если не работает, попробуйте без alpine
docker pull postgres:16

# 5. Запустите проект
docker-compose up -d

# 6. Проверьте статус
docker ps
```

---

## ✅ После успешного запуска

### Проверьте, что все работает:
```bash
# Статус контейнеров
docker ps

# Логи
docker-compose logs -f

# Health check
curl http://localhost:5000/health
```

---

## 🆘 Если ничего не помогло

### Попробуйте использовать SQLite вместо PostgreSQL:

1. Используйте оригинальный `server/index.js` вместо `server/index-docker.js`
2. Запустите без Docker:
```bash
npm install
npm run server
npm run dev
```

### Или создайте issue с информацией:
```bash
# Соберите информацию
docker --version
docker-compose --version
docker info > docker-info.txt
```

---

## 📞 Дополнительная помощь

- **Docker Documentation**: https://docs.docker.com/desktop/troubleshoot/overview/
- **Docker Forums**: https://forums.docker.com/
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/docker

---

**Обновлено:** 2024-01-24  
**Статус:** Проблема известна и решаема
