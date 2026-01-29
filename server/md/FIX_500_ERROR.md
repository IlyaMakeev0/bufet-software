# 🔧 Быстрое решение ошибки 500

## Проблема
```
unable to get image 'postgres:15-alpine': request returned 500 Internal Server Error
```

---

## ✅ РЕШЕНИЕ (2 минуты)

### Используйте упрощенную версию запуска:

**Windows:**
```
Двойной клик на: docker-start-simple.bat
```

**Или в командной строке:**
```bash
docker-compose -f docker-compose.simple.yml up --build -d
```

**Linux/Mac:**
```bash
docker-compose -f docker-compose.simple.yml up --build -d
```

---

## Что это делает?

Использует `postgres:latest` вместо `postgres:16-alpine`, что решает проблемы совместимости с Docker Desktop 28.x

---

## Проверка

### 1. Контейнеры запущены?
```bash
docker ps
```

### 2. Приложение работает?
```
http://localhost:5000
```

### 3. Health check
```
http://localhost:5000/health
```

---

## Управление

### Остановка
```bash
docker-compose -f docker-compose.simple.yml down
```

### Логи
```bash
docker-compose -f docker-compose.simple.yml logs -f
```

### Перезапуск
```bash
docker-compose -f docker-compose.simple.yml restart
```

---

## Если все еще не работает

### 1. Перезапустите Docker Desktop
1. Закройте Docker Desktop полностью
2. Откройте заново
3. Дождитесь зеленой иконки
4. Попробуйте снова

### 2. Очистите Docker
```bash
docker system prune -a -f
docker-compose -f docker-compose.simple.yml up --build -d
```

### 3. Используйте скрипт исправления
```bash
.\docker-fix-500.bat
```

---

## Подробная документация

См. [DOCKER_TROUBLESHOOTING_500.md](./DOCKER_TROUBLESHOOTING_500.md)

---

**Готово! Теперь должно работать! 🎉**
