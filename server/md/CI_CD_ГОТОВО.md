# 🎉 CI/CD система полностью настроена!

## ✅ Что реализовано

Полная система непрерывной интеграции и развертывания для проекта "Школьная столовая".

### 📦 Компоненты:

1. **Docker контейнеризация**
   - Backend (Node.js + Express)
   - Frontend (React + Vite + Nginx)
   - Database (PostgreSQL 15)
   - Изолированная сеть
   - Persistent volumes

2. **CI/CD Pipeline (GitHub Actions)**
   - Автоматическое тестирование
   - Автоматическая сборка
   - Создание Docker образов
   - Публикация в GitHub Container Registry
   - Автоматический деплой на сервер
   - Health checks после деплоя

3. **Production готовность**
   - Multi-stage Docker builds
   - Nginx reverse proxy
   - Gzip compression
   - Security headers
   - Кэширование статических файлов
   - Health checks
   - Graceful shutdown
   - Логирование

4. **Утилиты**
   - Скрипт деплоя (`deploy.sh`)
   - Docker Compose конфигурация
   - Примеры переменных окружения

5. **Документация**
   - Быстрый старт
   - Полная инструкция
   - README с обзором
   - Troubleshooting guide

## 📁 Структура файлов

```
CICD/
├── НАЧНИТЕ_ЗДЕСЬ.txt              ← Начните отсюда!
├── БЫСТРЫЙ_СТАРТ.txt              ← Пошаговая инструкция
├── README.md                       ← Обзор системы
├── ПОЛНАЯ_ИНСТРУКЦИЯ.md           ← Детальное руководство
├── ГОТОВО_К_ИСПОЛЬЗОВАНИЮ.md      ← Итоговая информация
│
├── Dockerfile.backend              ← Backend Docker образ
├── Dockerfile.frontend             ← Frontend Docker образ
├── docker-compose.production.yml   ← Orchestration
├── nginx.production.conf           ← Nginx конфигурация
│
├── .github-workflows-ci-cd.yml     ← GitHub Actions workflow
├── deploy.sh                       ← Скрипт управления
├── .dockerignore                   ← Исключения для Docker
└── .env.example                    ← Пример переменных
```

## 🚀 Быстрый старт

### 1. Переместите файлы:

```bash
# GitHub Actions workflow
mkdir -p .github/workflows
mv CICD/.github-workflows-ci-cd.yml .github/workflows/ci-cd.yml

# Docker конфигурация
cp CICD/.dockerignore ./.dockerignore
cp CICD/docker-compose.production.yml ./
```

### 2. Создайте .env:

```bash
cp CICD/.env.example .env
# Отредактируйте .env с вашими значениями
```

### 3. Тестируйте локально:

```bash
docker-compose -f docker-compose.production.yml up -d
```

### 4. Откройте в браузере:

```
http://localhost
```

## 📖 Документация

### Для быстрого старта:
👉 **[CICD/НАЧНИТЕ_ЗДЕСЬ.txt](CICD/НАЧНИТЕ_ЗДЕСЬ.txt)** - Навигация по документации

👉 **[CICD/БЫСТРЫЙ_СТАРТ.txt](CICD/БЫСТРЫЙ_СТАРТ.txt)** - Пошаговая инструкция (5-10 минут)

### Для детального изучения:
👉 **[CICD/README.md](CICD/README.md)** - Обзор системы

👉 **[CICD/ПОЛНАЯ_ИНСТРУКЦИЯ.md](CICD/ПОЛНАЯ_ИНСТРУКЦИЯ.md)** - Детальное руководство (30+ минут)

### Итоговая информация:
👉 **[CICD/ГОТОВО_К_ИСПОЛЬЗОВАНИЮ.md](CICD/ГОТОВО_К_ИСПОЛЬЗОВАНИЮ.md)** - Что создано и как использовать

## 🛠️ Использование deploy.sh

```bash
# Сделайте скрипт исполняемым (Linux/Mac)
chmod +x CICD/deploy.sh

# Основные команды:
./CICD/deploy.sh start      # Запустить сервисы
./CICD/deploy.sh stop       # Остановить сервисы
./CICD/deploy.sh status     # Показать статус
./CICD/deploy.sh logs       # Показать логи
./CICD/deploy.sh update     # Обновить приложение
./CICD/deploy.sh backup     # Создать бэкап БД
./CICD/deploy.sh health     # Проверить здоровье
./CICD/deploy.sh help       # Показать все команды
```

## 🔐 GitHub Secrets

Добавьте в: **Settings → Secrets and variables → Actions**

### Для SSH деплоя:
```
SSH_HOST          = IP адрес сервера
SSH_USER          = пользователь SSH
SSH_PRIVATE_KEY   = приватный SSH ключ
SSH_PORT          = 22
```

### Для приложения:
```
DB_USER               = canteen_user
DB_PASSWORD           = ваш_пароль
SESSION_SECRET        = случайная_строка_32_символа
JWT_SECRET            = случайная_строка_32_символа
JWT_REFRESH_SECRET    = случайная_строка_32_символа
ENCRYPTION_KEY        = строка_ровно_32_символа
EMAIL_HOST            = smtp.gmail.com
EMAIL_PORT            = 587
EMAIL_USER            = ваш-email@gmail.com
EMAIL_PASSWORD        = пароль_приложения
FRONTEND_URL          = https://ваш-домен.com
BACKEND_URL           = https://ваш-домен.com
```

### Генерация секретов:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Архитектура

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│  ┌──────────────────────────────────┐  │
│  │  Push → GitHub Actions Trigger   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        GitHub Actions CI/CD             │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │  Test  │→ │ Build  │→ │ Docker │   │
│  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    GitHub Container Registry            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Backend  │  │ Frontend │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Production Server (VPS)            │
│  ┌──────────────────────────────────┐  │
│  │      Docker Compose              │  │
│  │  ┌────────┐ ┌────────┐ ┌──────┐ │  │
│  │  │Postgres│ │Backend │ │Nginx │ │  │
│  │  │ :5432  │ │ :5000  │ │ :80  │ │  │
│  │  └────────┘ └────────┘ └──────┘ │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🔄 Workflow

### При Push в main:
1. ✅ Запускаются тесты и линтинг
2. 🏗️ Собирается backend и frontend
3. 🐳 Создаются Docker образы
4. 📤 Образы публикуются в GHCR
5. 🚀 Автоматический деплой на сервер
6. 🏥 Health checks после деплоя

### При Pull Request:
1. ✅ Запускаются тесты
2. 🏗️ Проверяется сборка
3. 📊 Отчет о результатах

## 📈 Мониторинг

```bash
# Статус контейнеров
docker compose -f docker-compose.production.yml ps

# Логи всех сервисов
docker compose -f docker-compose.production.yml logs -f

# Логи конкретного сервиса
docker compose -f docker-compose.production.yml logs -f backend

# Использование ресурсов
docker stats

# Health checks
curl http://localhost:5000/api/menu
curl http://localhost/
```

## 🐛 Troubleshooting

### Backend не запускается:
```bash
docker compose -f docker-compose.production.yml restart postgres
sleep 10
docker compose -f docker-compose.production.yml restart backend
```

### Frontend показывает 502:
```bash
docker compose -f docker-compose.production.yml restart frontend
```

### База не инициализируется:
```bash
docker compose -f docker-compose.production.yml down -v
docker compose -f docker-compose.production.yml up -d
```

## ✅ Чек-лист готовности

- [ ] Файлы перемещены в правильные места
- [ ] .env файл создан и заполнен
- [ ] Локальное тестирование пройдено
- [ ] GitHub репозиторий создан
- [ ] GitHub Secrets настроены
- [ ] Сервер подготовлен (Docker установлен)
- [ ] Firewall настроен
- [ ] SSH ключи настроены
- [ ] Первый деплой выполнен
- [ ] Health checks проходят
- [ ] Мониторинг настроен

## 🎯 Следующие шаги

1. ✅ Прочитайте [CICD/НАЧНИТЕ_ЗДЕСЬ.txt](CICD/НАЧНИТЕ_ЗДЕСЬ.txt)
2. ✅ Выберите свой путь (новичок/опытный)
3. ✅ Следуйте соответствующей документации
4. ✅ Тестируйте локально
5. ✅ Настройте GitHub Secrets
6. ✅ Выполните первый деплой
7. ✅ Настройте мониторинг
8. ✅ Обучите команду

## 📚 Полезные ресурсы

### Документация:
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Инструменты:
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [GitHub CLI](https://cli.github.com/)
- [Portainer](https://www.portainer.io/) - Docker UI
- [Watchtower](https://containrrr.dev/watchtower/) - Автообновление

## 🎉 Готово!

Ваша CI/CD система полностью настроена и готова к использованию!

**Начните с:** [CICD/НАЧНИТЕ_ЗДЕСЬ.txt](CICD/НАЧНИТЕ_ЗДЕСЬ.txt)

---

**Версия:** 1.0.0  
**Дата:** 28 января 2026  
**Проект:** Школьная столовая  
**Статус:** ✅ Production Ready

**Разработано для вашего проекта с ❤️**
