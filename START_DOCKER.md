# 🚀 START HERE - Docker Quick Launch

## Запуск проекта в Docker за 3 шага

---

## ⚡ Шаг 1: Установите Docker

### Windows
1. Скачайте: https://www.docker.com/products/docker-desktop/
2. Установите Docker Desktop
3. Перезагрузите компьютер
4. Запустите Docker Desktop

### Linux
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
```

### Mac
1. Скачайте: https://www.docker.com/products/docker-desktop/
2. Установите Docker Desktop
3. Запустите Docker Desktop

---

## ⚡ Шаг 2: Запустите проект

### Windows (самый простой способ)
**Двойной клик на файл:**
```
docker-start.bat
```

### Или через командную строку
```bash
# Windows
.\docker-start.bat

# Linux/Mac
docker-compose up --build -d
```

**Подождите 3-5 минут** (первый запуск)

---

## ⚡ Шаг 3: Откройте браузер

```
http://localhost:5000
```

**Готово! 🎉**

---

## 🎮 Управление

### Остановка
```bash
# Windows
.\docker-stop.bat

# Linux/Mac
docker-compose down
```

### Просмотр логов
```bash
# Windows
.\docker-logs.bat

# Linux/Mac
docker-compose logs -f
```

### Перезапуск
```bash
# Windows
.\docker-rebuild.bat

# Linux/Mac
docker-compose up --build -d
```

---

## ✅ Проверка

### Контейнеры запущены?
```bash
docker ps
```
Должны быть:
- `school-canteen-app` (порт 5000)
- `school-canteen-db` (порт 5432)

### Приложение работает?
```
http://localhost:5000/health
```
Должен вернуть: `{"status":"ok"}`

---

## 🆘 Проблемы?

### Docker не запускается
1. Откройте Docker Desktop
2. Дождитесь зеленой иконки в трее
3. Попробуйте снова

### Порт 5000 занят
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Контейнер падает
```bash
# Просмотр логов
docker-compose logs app

# Пересборка
docker-compose down
docker-compose up --build -d
```

---

## 📚 Больше информации

### Быстрые ссылки
- 📖 [Полное руководство](./DOCKER_GUIDE.md)
- ⚡ [Быстрый старт](./DOCKER_QUICKSTART.md)
- 🎮 [Все команды](./DOCKER_COMMANDS.md)
- 🧪 [Тестирование](./DOCKER_TESTING.md)
- 🗂️ [Навигация](./DOCKER_INDEX.md)

### Пошаговая инструкция
👉 [DOCKER_FINAL_INSTRUCTIONS.md](./DOCKER_FINAL_INSTRUCTIONS.md)

---

## 🎯 Что дальше?

1. ✅ Зарегистрируйтесь в приложении
2. ✅ Войдите в систему
3. ✅ Посмотрите меню
4. ✅ Создайте заказ
5. ✅ Протестируйте функции

---

**Успехов! 🚀**

**Нужна помощь?** См. [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) → Troubleshooting
