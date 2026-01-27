# 🗄️ Информация о базе данных

## 📊 Используемая база данных

**PostgreSQL 16**

## 🔧 Конфигурация

### Docker контейнер
```yaml
Образ: postgres:16
Контейнер: school-canteen-db
Порт: 5432
```

### Параметры подключения
```
База данных: school_canteen
Пользователь: canteen_user
Пароль: canteen_password_2024
Хост: db (внутри Docker) / localhost (снаружи)
Порт: 5432
```

### Node.js драйвер
```json
"pg": "^8.17.2"
```

## 📁 Структура базы данных

### Таблицы (11 шт):

#### 1. users - Пользователи
```sql
- id (TEXT, PRIMARY KEY)
- email (TEXT, UNIQUE)
- password (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- phone (TEXT, UNIQUE)
- class_name (TEXT) - для учеников
- position (TEXT) - для сотрудников
- role (TEXT) - student/chef/admin
- balance (NUMERIC) - баланс ученика
- allergies (TEXT) - аллергии
- food_preferences (TEXT) - предпочтения
- created_at (TIMESTAMP)
```

#### 2. menu - Меню
```sql
- id (TEXT, PRIMARY KEY)
- day (DATE)
- name (TEXT)
- description (TEXT)
- price (NUMERIC)
- meal_type (TEXT) - завтрак/обед/полдник
- created_at (TIMESTAMP)
```

#### 3. orders - Заказы
```sql
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FK -> users)
- menu_id (TEXT, FK -> menu)
- status (TEXT) - ожидает/оплачен/отменен
- created_at (TIMESTAMP)
```

#### 4. issued_meals - Выданные блюда
```sql
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FK -> users)
- menu_id (TEXT, FK -> menu)
- issue_date (DATE)
- status (TEXT) - ожидает выдачи/выдан
- issued_by (TEXT, FK -> users)
- created_at (TIMESTAMP)
```

#### 5. subscriptions - Абонементы
```sql
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FK -> users)
- meal_type (TEXT)
- start_date (DATE)
- end_date (DATE)
- meals_remaining (INTEGER)
- status (TEXT) - активен/истек
- created_at (TIMESTAMP)
```

#### 6. reviews - Отзывы
```sql
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FK -> users)
- menu_id (TEXT, FK -> menu)
- rating (INTEGER)
- comment (TEXT)
- created_at (TIMESTAMP)
```

#### 7. inventory - Склад
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- quantity (NUMERIC)
- unit (TEXT) - кг/л/шт/упак
- min_quantity (NUMERIC)
- updated_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 8. inventory_log - История склада
```sql
- id (TEXT, PRIMARY KEY)
- inventory_id (TEXT, FK -> inventory)
- action (TEXT) - пополнение/списание
- quantity_change (NUMERIC)
- quantity_before (NUMERIC)
- quantity_after (NUMERIC)
- reason (TEXT)
- created_by (TEXT, FK -> users)
- created_at (TIMESTAMP)
```

#### 9. menu_ingredients - Ингредиенты блюд
```sql
- id (TEXT, PRIMARY KEY)
- menu_id (TEXT, FK -> menu)
- ingredient_name (TEXT)
- quantity (NUMERIC)
- unit (TEXT)
- created_at (TIMESTAMP)
```

#### 10. purchase_requests - Заявки на закупку
```sql
- id (TEXT, PRIMARY KEY)
- item (TEXT)
- quantity (NUMERIC)
- unit (TEXT)
- urgency (TEXT) - обычная/высокая/срочная
- status (TEXT) - ожидает/одобрена/отклонена
- created_by (TEXT, FK -> users)
- created_at (TIMESTAMP)
```

#### 11. menu_requests - Заявки на новые блюда
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- price (NUMERIC)
- meal_type (TEXT)
- ingredients (JSONB) - массив ингредиентов
- created_by (TEXT, FK -> users)
- status (TEXT) - ожидает/одобрена/отклонена
- admin_comment (TEXT)
- reviewed_by (TEXT, FK -> users)
- created_at (TIMESTAMP)
- reviewed_at (TIMESTAMP)
```

## 📊 Текущие данные

```bash
# Проверить количество записей
docker exec school-canteen-db psql -U canteen_user -d school_canteen -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'menu', COUNT(*) FROM menu
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'menu_ingredients', COUNT(*) FROM menu_ingredients
UNION ALL
SELECT 'menu_requests', COUNT(*) FROM menu_requests;
"
```

### Ожидаемые данные:
- **Пользователи:** зависит от регистраций
- **Меню:** 270 блюд (90 дней × 3 приема пищи)
- **Склад:** 30 продуктов
- **Ингредиенты:** 1350 связей (270 блюд × 5 ингредиентов)

## 🔌 Подключение к базе данных

### Из Docker контейнера:
```bash
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen
```

### Из локальной машины:
```bash
psql -h localhost -p 5432 -U canteen_user -d school_canteen
```

### Из приложения (Node.js):
```javascript
import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'school_canteen',
  user: process.env.DB_USER || 'canteen_user',
  password: process.env.DB_PASSWORD || 'canteen_password_2024'
})
```

## 🛠️ Полезные команды

### Просмотр таблиц:
```bash
docker exec school-canteen-db psql -U canteen_user -d school_canteen -c "\dt"
```

### Просмотр структуры таблицы:
```bash
docker exec school-canteen-db psql -U canteen_user -d school_canteen -c "\d table_name"
```

### Выполнение SQL запроса:
```bash
docker exec school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT * FROM users LIMIT 5;"
```

### Выполнение SQL файла:
```bash
docker cp script.sql school-canteen-db:/tmp/
docker exec school-canteen-db psql -U canteen_user -d school_canteen -f /tmp/script.sql
```

### Бэкап базы данных:
```bash
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup.sql
```

### Восстановление из бэкапа:
```bash
docker cp backup.sql school-canteen-db:/tmp/
docker exec school-canteen-db psql -U canteen_user -d school_canteen -f /tmp/backup.sql
```

## 💾 Хранение данных

### Docker volume:
```yaml
volumes:
  postgres_data:
    driver: local
```

Данные хранятся в Docker volume `postgres_data` и сохраняются между перезапусками контейнера.

### Расположение:
```bash
# Проверить расположение volume
docker volume inspect bufet-software_postgres_data
```

## 🔒 Безопасность

### Текущие настройки (для разработки):
- Пароль: `canteen_password_2024`
- Порт открыт: `5432`

### Для продакшена рекомендуется:
1. Изменить пароль на более сложный
2. Использовать переменные окружения из `.env` файла
3. Закрыть порт 5432 снаружи
4. Настроить SSL соединение
5. Ограничить доступ по IP

## 📈 Производительность

### Индексы:
- PRIMARY KEY на всех таблицах
- UNIQUE на email и phone в users
- INDEX на status в menu_requests
- FOREIGN KEY для связей между таблицами

### Оптимизация:
- Используется connection pool
- JSONB для гибкого хранения ингредиентов
- Индексы на часто используемых полях

## 🔄 Миграции

Текущая система использует SQL скрипты для инициализации:
- `init-db.sql` - базовая структура
- `add-missing-tables.sql` - дополнительные таблицы
- `add-menu-requests-table.sql` - таблица заявок
- `populate-inventory.sql` - данные склада
- `working-ingredients.sql` - ингредиенты блюд

## 📚 Дополнительная информация

- **Версия PostgreSQL:** 16
- **Кодировка:** UTF-8
- **Часовой пояс:** UTC
- **Драйвер Node.js:** pg (node-postgres)
- **ORM:** Не используется (чистый SQL)

---

**Статус:** ✅ PostgreSQL 16 работает  
**Порт:** 5432  
**База данных:** school_canteen
