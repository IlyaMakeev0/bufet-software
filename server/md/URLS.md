# 🌐 Все доступные URL

## 🚀 После запуска проекта

### Клиент (Frontend)

Попробуйте любой из этих адресов:

```
✅ http://localhost:3000
✅ http://127.0.0.1:3000
✅ http://0.0.0.0:3000
```

**Альтернативные порты:**
```
http://localhost:3001  (npm run dev:3001)
http://localhost:8080  (npm run dev:8080)
http://localhost:4000  (npm run dev:4000)
```

---

### Сервер (Backend API)

```
✅ http://localhost:5000
✅ http://127.0.0.1:5000
✅ http://0.0.0.0:5000
```

**Альтернативные порты:**
```
http://localhost:5001  (npm run server:5001)
http://localhost:8000  (npm run server:8000)
```

---

## 📱 API Endpoints

### Аутентификация

```
POST   http://localhost:5000/api/auth/register
POST   http://localhost:5000/api/auth/login
POST   http://localhost:5000/api/auth/logout
GET    http://localhost:5000/api/auth/check
```

### Меню

```
GET    http://localhost:5000/api/menu
GET    http://localhost:5000/api/menu?date=2024-01-23
```

### Заказы

```
GET    http://localhost:5000/api/orders
POST   http://localhost:5000/api/orders
```

### Абонементы

```
GET    http://localhost:5000/api/subscriptions
POST   http://localhost:5000/api/subscriptions
```

### Повар

```
GET    http://localhost:5000/api/chef/pending-meals
GET    http://localhost:5000/api/chef/issued-today
POST   http://localhost:5000/api/chef/issue-meal
```

### Администратор

```
GET    http://localhost:5000/api/admin/stats
GET    http://localhost:5000/api/admin/users
GET    http://localhost:5000/api/admin/recent-orders
```

---

## 🌍 Доступ из локальной сети

### Узнайте ваш IP адрес

**Windows:**
```cmd
ipconfig
```

**Linux/Mac:**
```bash
ifconfig
# или
ip addr show
```

Найдите IPv4 адрес, например: `192.168.1.100`

### Используйте IP адрес

```
http://192.168.1.100:3000  (клиент)
http://192.168.1.100:5000  (сервер)
```

⚠️ **Важно:** Устройства должны быть в одной сети!

---

## 🧪 Тестирование API

### С помощью curl

```bash
# Получить меню
curl http://localhost:5000/api/menu

# Проверить сессию
curl http://localhost:5000/api/auth/check

# Регистрация (POST)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.ru","password":"123456","firstName":"Иван","lastName":"Иванов","phone":"+79991234567","className":"10А","role":"student"}'
```

### С помощью браузера

Просто откройте в браузере:
```
http://localhost:5000/api/menu
```

### С помощью Postman

1. Откройте Postman
2. Создайте новый запрос
3. Введите URL: `http://localhost:5000/api/menu`
4. Нажмите Send

---

## 🔍 Проверка доступности

### Проверить клиент

```bash
curl http://localhost:3000
curl http://127.0.0.1:3000
```

### Проверить сервер

```bash
curl http://localhost:5000/api/menu
curl http://127.0.0.1:5000/api/menu
```

### Проверить из браузера

Откройте Developer Tools (F12) → Console:

```javascript
// Проверить API
fetch('http://localhost:5000/api/menu')
  .then(r => r.json())
  .then(console.log)

// Проверить сессию
fetch('http://localhost:5000/api/auth/check')
  .then(r => r.json())
  .then(console.log)
```

---

## 🎯 Примеры использования

### Регистрация ученика

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@school.ru',
    password: '123456',
    firstName: 'Иван',
    lastName: 'Иванов',
    phone: '+79991234567',
    className: '10А',
    role: 'student'
  })
})
```

### Вход

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@school.ru',
    password: '123456',
    role: 'student'
  })
})
```

### Получить меню

```javascript
fetch('http://localhost:5000/api/menu')
  .then(r => r.json())
  .then(menu => console.log(menu))
```

### Создать заказ

```javascript
fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    menuId: 'menu-item-id-here'
  })
})
```

---

## 🔐 CORS и куки

### Важно для API запросов

Если делаете запросы из другого домена, добавьте:

```javascript
fetch('http://localhost:5000/api/menu', {
  credentials: 'include'  // Для отправки cookies
})
```

### Настройка CORS

В `server/index.js` уже настроено:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

---

## 📱 Мобильный доступ

### Шаг 1: Узнайте IP компьютера

```cmd
ipconfig  (Windows)
ifconfig  (Linux/Mac)
```

### Шаг 2: Откройте на телефоне

```
http://192.168.1.100:3000
```

### Шаг 3: Убедитесь

- ✅ Компьютер и телефон в одной Wi-Fi сети
- ✅ Firewall не блокирует порты
- ✅ Сервер запущен с `host: '0.0.0.0'`

---

## 🐛 Проблемы?

### localhost не работает
→ Используйте `127.0.0.1`

### Не могу подключиться
→ Проверьте что сервер запущен

### CORS ошибка
→ Проверьте настройки в `server/index.js`

### 404 Not Found
→ Проверьте правильность URL

---

## 📚 Документация

- [ALTERNATIVE_PORTS.md](ALTERNATIVE_PORTS.md) - Альтернативные порты
- [WINDOWS_SETUP.md](WINDOWS_SETUP.md) - Инструкция для Windows
- [README.md](README.md) - Полная документация

---

## ✅ Быстрая проверка

После запуска откройте:

1. **Клиент:** http://localhost:3000
2. **API:** http://localhost:5000/api/menu
3. **Проверка:** Должны увидеть список блюд

**Работает?** Отлично! 🎉

**Не работает?** Смотрите [ALTERNATIVE_PORTS.md](ALTERNATIVE_PORTS.md)

---

**Версия:** 1.0.0  
**Дата:** 23 января 2024
