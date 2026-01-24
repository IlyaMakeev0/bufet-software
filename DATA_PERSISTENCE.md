# 💾 Сохранение данных в Docker

## Проблема решена!

Теперь данные **сохраняются** между перезапусками контейнеров!

---

## Что было исправлено

### Проблема:
При каждом запуске приложения вызывался `initDatabase()`, который **удалял все таблицы**:
```javascript
// Старый код:
DROP TABLE IF EXISTS users CASCADE
DROP TABLE IF EXISTS menu CASCADE
// ... и т.д.
```

### Решение:
Теперь перед инициализацией **проверяется**, существуют ли таблицы:
```javascript
// Новый код:
const tableCheck = await client.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  );
`)

if (tablesExist) {
  console.log('✅ Database already initialized, skipping...')
  return
}
```

---

## Как это работает

### Первый запуск:
1. Приложение проверяет, существует ли таблица `users`
2. Таблицы не существуют → создаются все таблицы
3. Добавляется тестовое меню
4. Логи: `📊 Initializing database for the first time...`

### Последующие запуски:
1. Приложение проверяет, существует ли таблица `users`
2. Таблица существует → **пропускается инициализация**
3. Все данные сохранены!
4. Логи: `✅ Database already initialized, skipping...`

---

## 🔄 Перезапуск контейнеров

### Обычный перезапуск (данные сохраняются):
```bash
docker-compose restart
```

### Остановка и запуск (данные сохраняются):
```bash
docker-compose stop
docker-compose start
```

### Пересборка (данные сохраняются):
```bash
docker-compose up --build -d
```

### Перезапуск с удалением контейнеров (данные сохраняются):
```bash
docker-compose down
docker-compose up -d
```

---

## 🗑️ Удаление данных

### Если нужно удалить ВСЕ данные:
```bash
# Остановить контейнеры И удалить volumes
docker-compose down -v
```

**Внимание!** Флаг `-v` удаляет volumes, где хранятся данные PostgreSQL!

### Если нужно пересоздать БД:
```bash
# 1. Остановить и удалить volumes
docker-compose down -v

# 2. Запустить заново
docker-compose up -d
```

При следующем запуске таблицы будут созданы заново.

---

## 📊 Где хранятся данные

### Docker Volume:
```yaml
volumes:
  postgres_data:
    driver: local
```

Данные хранятся в Docker volume `postgres_data`, который:
- ✅ Сохраняется между перезапусками контейнеров
- ✅ Сохраняется при `docker-compose down`
- ✅ Сохраняется при пересборке образов
- ❌ Удаляется только при `docker-compose down -v`

### Проверка volumes:
```bash
# Список volumes
docker volume ls

# Информация о volume
docker volume inspect bufet-software_postgres_data
```

---

## 🧪 Тестирование

### 1. Создайте пользователя
```
http://localhost:5000/student-auth
Email: test@student.com
```

### 2. Проверьте в БД
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT email FROM users;"
```

### 3. Перезапустите контейнеры
```bash
docker-compose restart
```

### 4. Проверьте снова
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT email FROM users;"
```

**Результат:** Пользователь должен остаться! ✅

---

## 📝 Логи при запуске

### Первый запуск (новая БД):
```
🔄 Checking PostgreSQL database...
📊 Initializing database for the first time...
✅ PostgreSQL database initialized successfully!
```

### Последующие запуски (БД существует):
```
🔄 Checking PostgreSQL database...
✅ Database already initialized, skipping...
```

---

## 🔧 Команды для управления данными

### Backup базы данных:
```bash
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup.sql
```

### Восстановление из backup:
```bash
docker exec -i school-canteen-db psql -U canteen_user school_canteen < backup.sql
```

### Просмотр всех пользователей:
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT email, first_name, role, balance FROM users;"
```

### Удаление конкретного пользователя:
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "DELETE FROM users WHERE email='test@student.com';"
```

---

## ⚠️ Важно!

### Данные сохраняются при:
- ✅ `docker-compose restart`
- ✅ `docker-compose stop` + `docker-compose start`
- ✅ `docker-compose down` + `docker-compose up`
- ✅ `docker-compose up --build`
- ✅ Перезагрузке компьютера

### Данные удаляются при:
- ❌ `docker-compose down -v` (флаг -v удаляет volumes!)
- ❌ `docker volume rm bufet-software_postgres_data`
- ❌ `docker system prune -a --volumes`

---

## 🎯 Рекомендации

### Для разработки:
```bash
# Обычный перезапуск (данные сохраняются)
docker-compose restart

# Пересборка после изменения кода (данные сохраняются)
docker-compose up --build -d
```

### Для очистки и начала с нуля:
```bash
# Удалить все данные и начать заново
docker-compose down -v
docker-compose up --build -d
```

### Для production:
```bash
# Регулярные backup
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup_$(date +%Y%m%d).sql

# Автоматический backup (cron)
0 2 * * * docker exec school-canteen-db pg_dump -U canteen_user school_canteen > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## ✅ Проверка после обновления

### 1. Пересоберите контейнеры:
```bash
docker-compose up --build -d
```

### 2. Проверьте логи:
```bash
docker-compose logs app | findstr "Database"
```

Должно быть:
```
✅ Database already initialized, skipping...
```

Или (если первый запуск):
```
📊 Initializing database for the first time...
```

### 3. Создайте пользователя и перезапустите:
```bash
# Создайте пользователя через веб-интерфейс
# Затем:
docker-compose restart

# Проверьте, что пользователь остался:
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT email FROM users;"
```

---

## 🎉 Готово!

Теперь ваши данные сохраняются между перезапусками!

**Попробуйте:**
1. Зарегистрируйте пользователя
2. Перезапустите контейнеры: `docker-compose restart`
3. Войдите с теми же credentials
4. Все работает! ✅

---

**Версия:** 1.0.6  
**Дата:** 2024-01-24  
**Статус:** ✅ Данные сохраняются!
