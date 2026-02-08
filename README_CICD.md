# 🍽️ School Canteen Management System

![Deploy Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
![Tests Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)

Система управления школьной столовой с автоматическим CI/CD деплоем.

## 🚀 Возможности

- ✅ **Автоматический деплой** - Push в main → автоматический деплой на production
- ✅ **Автотесты** - Проверка кода при каждом Pull Request
- ✅ **Автобэкапы** - Ежедневные backup базы данных
- ✅ **Числовые коды** - Вместо QR-кодов используются 6-значные коды
- ✅ **Уведомления** - Повара получают уведомления об одобренных закупках
- ✅ **PostgreSQL** - Надежная база данных
- ✅ **Docker** - Контейнеризация для легкого деплоя
- ✅ **HTTPS** - Безопасное соединение с SSL сертификатами

## 📋 Технологии

**Backend:**
- Node.js + Express
- PostgreSQL
- Docker + Docker Compose

**Frontend:**
- React + Vite
- Modern CSS

**DevOps:**
- GitHub Actions (CI/CD)
- Docker
- Nginx (reverse proxy)

## 🎯 Быстрый старт

### Локальная разработка

```bash
# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev
```

### Production деплой

```bash
# Просто сделайте push в main
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions автоматически задеплоит на сервер
```

## 📖 Документация

- [CICD_SETUP.md](CICD_SETUP.md) - Полная документация по CI/CD
- [НАСТРОЙКА_CICD.txt](НАСТРОЙКА_CICD.txt) - Быстрая настройка на русском
- [ИЗМЕНЕНИЯ_QR_И_УВЕДОМЛЕНИЯ.md](ИЗМЕНЕНИЯ_QR_И_УВЕДОМЛЕНИЯ.md) - Последние изменения

## 🔧 Настройка CI/CD

1. Добавьте GitHub Secrets:
   - `SSH_PRIVATE_KEY` - SSH ключ для доступа к серверу
   - `SERVER_HOST` - Адрес сервера (autogreatfood.ru)
   - `SERVER_USER` - Пользователь SSH (root)
   - `SERVER_PATH` - Путь к проекту (/root/bufet-software)

2. Настройте Git на сервере:
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

3. Сделайте первый push:
```bash
git push origin main
```

Подробнее: [НАСТРОЙКА_CICD.txt](НАСТРОЙКА_CICD.txt)

## 🧪 Тестирование

```bash
# Запустить тесты
npm test

# Проверить код перед push
test-before-push.bat

# Проверить Docker конфигурацию
docker-compose -f docker-compose.production.yml config
```

## 📊 Мониторинг

### GitHub Actions
Откройте **Actions** в вашем репозитории для просмотра статуса деплоев.

### Логи на сервере
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
docker-compose -f docker-compose.production.yml logs -f backend
```

## 🔄 Workflows

### Deploy to Production
- **Триггер:** Push в main/master
- **Действия:** Деплой на production сервер
- **Время:** ~2-3 минуты

### Run Tests
- **Триггер:** Push в любую ветку, Pull Request
- **Действия:** Запуск тестов и проверка кода
- **Время:** ~1-2 минуты

### Database Backup
- **Триггер:** Каждый день в 3:00 UTC
- **Действия:** Backup PostgreSQL базы данных
- **Хранение:** 7 дней

## 🛠️ Команды

### Локальная разработка
```bash
npm install          # Установить зависимости
npm run dev          # Запустить dev сервер
npm run build        # Собрать для production
npm test             # Запустить тесты
```

### Docker
```bash
# Запустить локально
docker-compose up -d

# Запустить production
docker-compose -f docker-compose.production.yml up -d --build

# Остановить
docker-compose down

# Посмотреть логи
docker-compose logs -f backend
```

### Деплой
```bash
# Автоматический (рекомендуется)
git push origin main

# Ручной через GitHub Actions
# GitHub → Actions → Deploy to Production → Run workflow
```

## 📝 Структура проекта

```
.
├── .github/
│   └── workflows/          # GitHub Actions workflows
│       ├── deploy.yml      # Автодеплой
│       ├── test.yml        # Автотесты
│       └── backup.yml      # Автобэкапы
├── server/                 # Backend код
│   ├── routes/            # API endpoints
│   ├── utils/             # Утилиты
│   └── index.js           # Главный файл сервера
├── src/                   # Frontend код
│   ├── components/        # React компоненты
│   └── pages/            # Страницы
├── cert/                  # SSL сертификаты
├── docker-compose.production.yml
├── Dockerfile
└── package.json
```

## 🔐 Безопасность

- ✅ HTTPS с SSL сертификатами
- ✅ Шифрование паролей (bcrypt)
- ✅ JWT токены для аутентификации
- ✅ Rate limiting для API
- ✅ SQL injection защита
- ✅ XSS защита

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте [CICD_SETUP.md](CICD_SETUP.md) - раздел Troubleshooting
2. Посмотрите логи в GitHub Actions
3. Проверьте логи на сервере

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🎉 Авторы

Разработано для автоматизации работы школьной столовой.

---

**🌐 Production:** https://autogreatfood.ru

**📧 Email:** ppredprof@gmail.com
