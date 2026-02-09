# Система управления школьной столовой

Комплексное веб-приложение для управления школьной столовой с разграничением прав доступа для учеников, поваров и администраторов.

## Видеообзор

https://rutube.ru/video/private/82a9eb25f80867b93af7d89a84c6dbe2/?p=ChJ4hmeJdLje16WF5JdLDw

## Ссылка на сайт

https://autogreatfood.ru/

## Описание

Система автоматизирует весь процесс работы столовой от планирования меню до выдачи заказов. Построена на современных веб-технологиях и обеспечивает безопасное, масштабируемое решение для образовательных учреждений любого размера.

## Основной функционал

### Портал ученика
- Регистрация аккаунта с подтверждением email
- Просмотр меню с планированием на 30 дней вперед
- Заказ отдельных блюд и управление абонементами
- Электронный кошелек с отслеживанием баланса
- Генерация QR-кода для получения заказа
- Полная история заказов и транзакций

### Интерфейс повара
- Управление очередью заказов в реальном времени
- Сканер QR-кодов для проверки заказов
- Отслеживание выдачи блюд
- Ежедневная статистика и метрики
- Автоматическое списание со склада

### Панель администратора
- Управление пользователями всех ролей
- Финансовая отчетность и аналитика выручки
- Общая статистика системы
- Мониторинг заказов
- Контроль складских запасов

## Технологический стек

### Frontend
- React 18.2 с функциональными компонентами и хуками
- React Router DOM для маршрутизации
- Vite для оптимизированной сборки
- Современный CSS с адаптивным дизайном

### Backend
- Node.js с фреймворком Express
- PostgreSQL для production-окружения
- SQLite для разработки и тестирования
- JWT-аутентификация
- bcrypt для хеширования паролей

### Безопасность
- Helmet.js для защиты HTTP-заголовков
- Express rate limiting
- Настройка CORS
- AES-256 шифрование конфиденциальных данных
- Поддержка двухфакторной аутентификации
- Логирование транзакций и аудит

## Требования

- Node.js 16+
- PostgreSQL 14+
- Docker и Docker Compose

## Установка и развертывание

### Docker

```bash
git clone <repository-url>
cd school-canteen
copy .env.example .env.docker
docker-compose up -d
docker-compose ps
```

Доступ:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- HTTPS: https://localhost:8443

### Локальная установка

```bash
git clone <repository-url>
cd school-canteen
npm install
copy .env.example .env
npm run server
npm run dev
```

Доступ: http://localhost:3000

### Production

```bash
docker-compose -f docker-compose.production.yml up -d
```

### Команды управления

```bash
docker-compose logs -f
docker-compose down
docker-compose down -v
docker-compose up -d --build
docker-compose ps
```

## Конфигурация

### Переменные окружения

Основные параметры конфигурации в `.env`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=ваш-секретный-ключ
ACCESS_TOKEN_SECRET=ваш-jwt-секрет
ENCRYPTION_KEY=ваш-ключ-шифрования
ADMIN_SECRET_CODE=код-регистрации-админа
CHEF_SECRET_CODE=код-регистрации-повара
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASSWORD=пароль-приложения
```

### Настройка базы данных

Приложение автоматически инициализирует схему базы данных при первом запуске. Для ручной настройки:

```bash
# PostgreSQL
psql -U postgres -d school_canteen -f init-db.sql

# SQLite
sqlite3 school_canteen.db < init-db.sql
```

## Документация API

### Аутентификация

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Завершение сессии
- `GET /api/auth/check` - Проверка сессии
- `POST /api/auth/verify-email` - Подтверждение email
- `POST /api/auth/forgot-password` - Запрос сброса пароля
- `POST /api/auth/reset-password` - Подтверждение сброса пароля

### Управление меню

- `GET /api/menu` - Получить список блюд
- `GET /api/menu/date/:date` - Меню на конкретную дату
- `POST /api/menu` - Создать блюдо (только админ)
- `PUT /api/menu/:id` - Обновить блюдо (только админ)
- `DELETE /api/menu/:id` - Удалить блюдо (только админ)

### Обработка заказов

- `GET /api/orders` - История заказов пользователя
- `POST /api/orders` - Создать новый заказ
- `GET /api/orders/:id` - Детали заказа
- `PUT /api/orders/:id/cancel` - Отменить заказ

### Система QR-кодов

- `POST /api/qrcode/generate/order/:orderId` - Сгенерировать QR-код заказа
- `POST /api/qrcode/validate` - Проверить QR-код
- `POST /api/qrcode/issue/:orderId` - Выдать заказ по QR-коду

### Операции повара

- `GET /api/chef/pending-meals` - Заказы на выдачу
- `GET /api/chef/issued-today` - Журнал выдачи за день
- `POST /api/chef/issue-meal` - Отметить выдачу блюда

### Административные функции

- `GET /api/admin/stats` - Статистика системы
- `GET /api/admin/users` - Управление пользователями
- `GET /api/admin/orders` - Все заказы
- `GET /api/admin/revenue` - Финансовые отчеты
- `POST /api/admin/balance/:userId` - Изменить баланс пользователя

## Project Structure

```
school-canteen/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── StudentDashboard.jsx
│   │   ├── ChefDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── pages/                    # Route pages
│   │   ├── Home.jsx
│   │   ├── StudentAuth.jsx
│   │   ├── ChefAuth.jsx
│   │   ├── AdminAuth.jsx
│   │   ├── Dashboard.jsx
│   │   └── ForgotPassword.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/                       # Backend source
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── subscriptions.js
│   │   ├── chef.js
│   │   └── admin.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── jwt.js
│   │   └── security.js
│   ├── utils/                    # Utility functions
│   │   ├── phone.js
│   │   ├── emailService.js
│   │   ├── encryption.js
│   │   ├── twoFactor.js
│   │   ├── qrCode.js
│   │   └── transactionLogger.js
│   ├── database.js
│   ├── database-postgres.js
│   └── index.js
├── docker-compose.yml
├── Dockerfile
├── package.json
└── vite.config.js
```

## Схема базы данных

### Основные таблицы

- `users` - Учетные записи пользователей и аутентификация
- `menu` - Блюда меню и цены
- `orders` - Записи заказов и статусы
- `subscriptions` - Абонементы на питание
- `issued_meals` - Отслеживание выдачи
- `inventory` - Управление складом
- `menu_requests` - Предложения учеников по меню
- `notifications` - Системные уведомления
- `transaction_logs` - Журнал аудита
- `password_resets` - Токены восстановления пароля

## Функции безопасности

### Аутентификация
- Хеширование паролей bcrypt с солью
- JWT-токены с механизмом обновления
- HTTP-only защищенные cookies
- Управление сессиями с истечением срока
- Обязательное подтверждение email
- Сброс пароля с ограниченными по времени токенами

### Защита данных
- AES-256 шифрование конфиденциальных данных
- Защита от SQL-инъекций через параметризованные запросы
- XSS-защита через санитизацию ввода
- CSRF-валидация токенов
- Rate limiting на endpoints аутентификации
- Логирование транзакций для соответствия аудиту

### Контроль доступа
- Ролевые разрешения (RBAC)
- Секретные коды для регистрации персонала
- Валидация сессий на защищенных маршрутах
- Проверка авторизации API endpoints

## Тестирование

### Тестовые аккаунты

```
Ученик:
Email: student@test.com
Пароль: test123

Повар:
Email: chef@test.com
Пароль: test123

Администратор:
Email: admin@test.com
Пароль: test123
```

### Запуск тестов

```bash
npm test
npm run test:integration
npm run test:e2e
```

## Развертывание

### Чеклист для production

- Установить NODE_ENV=production
- Настроить PostgreSQL
- Сгенерировать секреты
- Включить HTTPS/SSL
- Настроить email-сервис
- Настроить резервное копирование
- Настроить мониторинг и логирование
- Проверить заголовки безопасности
- Протестировать критические пути

### Docker Production

```bash
docker-compose -f docker-compose.production.yml up -d
```

## Производительность

- Среднее время ответа API: < 100мс
- Размер frontend-бандла: ~200KB (gzipped)
- Оптимизация запросов БД с индексами
- Стратегия кеширования данных меню
- Ленивая загрузка компонентов дашборда

## Поддержка браузеров

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Участие в разработке

См. CONTRIBUTING.md:
- Стандарты кода
- Git workflow
- Pull request процесс
- Требования к тестированию

## Документация

Дополнительная документация доступна в `server/md/`:
- `DOCKER_GUIDE.md` - Руководство по Docker
- `QR_CODE_SYSTEM.md` - Детали реализации QR-кодов
- `INVENTORY_SYSTEM.md` - Управление складом
- `SECURITY_AUDIT.md` - Реализация безопасности
- `API_REFERENCE.md` - Полная документация API

## Устранение неполадок

### Порт уже используется

```bash
PORT=5001
```

### Ошибка подключения к БД

- Проверьте PostgreSQL
- Проверьте DATABASE_URL
- Проверьте права пользователя

### Email не отправляется

- Проверьте SMTP-учетные данные
- Проверьте файрвол
- Просмотрите логи

## Лицензия

MIT License - подробности в файле LICENSE

## Поддержка

- GitHub Issues

## История изменений

См. CHANGELOG.md

## Лицензия

MIT License
