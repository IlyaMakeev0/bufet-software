# 🚀 Docker Quick Start

## Быстрый старт за 3 шага

### 1️⃣ Установите Docker
- **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: `sudo apt-get install docker.io docker-compose`

### 2️⃣ Запустите проект

#### Windows (двойной клик):
```
docker-start.bat
```

#### Linux/Mac (терминал):
```bash
docker-compose up --build -d
```

### 3️⃣ Откройте браузер
```
http://localhost:5000
```

---

## 🎮 Управление

### Windows (bat-файлы)
- `docker-start.bat` - Запуск
- `docker-stop.bat` - Остановка
- `docker-rebuild.bat` - Пересборка
- `docker-logs.bat` - Просмотр логов

### Linux/Mac (команды)
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Пересборка
docker-compose up --build -d

# Логи
docker-compose logs -f
```

---

## 📊 Проверка работы

### Статус контейнеров
```bash
docker ps
```
Должны быть запущены:
- `school-canteen-app` (порт 5000)
- `school-canteen-db` (порт 5432)

### Health Check
```bash
curl http://localhost:5000/health
```
Ответ: `{"status":"ok","timestamp":"..."}`

### Проверка БД
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT COUNT(*) FROM menu;"
```

---

## 🔧 Troubleshooting

### Порт занят
```bash
# Измените порт в docker-compose.yml:
ports:
  - "5001:5000"  # Используйте 5001 вместо 5000
```

### Контейнер не запускается
```bash
# Просмотр логов
docker-compose logs app

# Пересборка без кэша
docker-compose build --no-cache
docker-compose up -d
```

### Очистка и перезапуск
```bash
# Удалить все (включая данные БД!)
docker-compose down -v

# Запустить заново
docker-compose up --build -d
```

---

## 📚 Подробная документация
См. [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## ✅ Готово!
Приложение работает на http://localhost:5000 🎉
