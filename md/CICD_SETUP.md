# 🚀 CI/CD Setup Guide

## Обзор

Настроен полный CI/CD pipeline с использованием GitHub Actions для автоматического деплоя на production сервер.

## 📋 Workflows

### 1. Deploy to Production (`deploy.yml`)
**Триггеры:**
- Push в ветку `main` или `master`
- Ручной запуск через GitHub UI

**Что делает:**
1. ✅ Подключается к серверу по SSH
2. 📦 Скачивает последние изменения из Git
3. 🛑 Останавливает Docker контейнеры
4. 🔨 Пересобирает контейнеры
5. 🚀 Запускает обновленные контейнеры
6. 🏥 Проверяет здоровье приложения
7. 📢 Уведомляет о результате

### 2. Run Tests (`test.yml`)
**Триггеры:**
- Push в любую ветку
- Pull Request в `main`/`master`

**Что делает:**
1. ✅ Запускает PostgreSQL для тестов
2. 📦 Устанавливает зависимости
3. 🧪 Запускает тесты
4. 🔍 Проверяет код линтером
5. 🔒 Проверяет безопасность (npm audit)
6. 📝 Проверяет форматирование кода

### 3. Database Backup (`backup.yml`)
**Триггеры:**
- Каждый день в 3:00 UTC (автоматически)
- Ручной запуск через GitHub UI

**Что делает:**
1. 💾 Создает backup PostgreSQL базы данных
2. 📦 Сжимает backup (gzip)
3. 🗂️ Удаляет старые backups (старше 7 дней)
4. 📢 Уведомляет о результате

---

## ⚙️ Настройка GitHub Secrets

Для работы CI/CD нужно добавить следующие секреты в GitHub:

### Как добавить секреты:
1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте каждый секрет из списка ниже

### Необходимые секреты:

#### `SSH_PRIVATE_KEY`
SSH ключ для подключения к серверу.

**Как получить:**
```bash
# На вашем локальном компьютере
cat ~/.ssh/id_rsa
```

Скопируйте весь вывод (включая `-----BEGIN` и `-----END`)

**Если ключа нет, создайте:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
# Нажмите Enter 3 раза (без пароля)

# Скопируйте публичный ключ на сервер
ssh-copy-id root@autogreatfood.ru

# Скопируйте приватный ключ для GitHub
cat ~/.ssh/id_rsa
```

#### `SERVER_HOST`
IP адрес или домен вашего сервера.

**Значение:**
```
autogreatfood.ru
```
или IP адрес сервера

#### `SERVER_USER`
Пользователь для SSH подключения.

**Значение:**
```
root
```
или другой пользователь с правами sudo

#### `SERVER_PATH`
Путь к проекту на сервере.

**Значение:**
```
/root/bufet-software
```
или путь где находится ваш проект

---

## 🔐 Настройка SSH на сервере

### 1. Проверьте SSH доступ:
```bash
ssh root@autogreatfood.ru
```

### 2. Убедитесь, что Git установлен:
```bash
git --version
```

Если нет:
```bash
apt update && apt install -y git
```

### 3. Настройте Git в папке проекта:
```bash
cd /root/bufet-software

# Если репозиторий еще не инициализирован
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Или если уже есть
git remote -v
```

### 4. Настройте права доступа:
```bash
# Убедитесь, что пользователь может запускать Docker
usermod -aG docker $USER

# Перезайдите в SSH для применения изменений
exit
ssh root@autogreatfood.ru
```

---

## 📝 Использование

### Автоматический деплой
Просто сделайте commit и push в ветку `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions автоматически:
1. Запустит тесты
2. Задеплоит на сервер
3. Покажет результат в разделе **Actions**

### Ручной деплой
1. Откройте GitHub → **Actions**
2. Выберите **Deploy to Production**
3. Нажмите **Run workflow**
4. Выберите ветку и нажмите **Run workflow**

### Ручной backup
1. Откройте GitHub → **Actions**
2. Выберите **Database Backup**
3. Нажмите **Run workflow**

---

## 🔍 Мониторинг

### Просмотр логов деплоя:
1. Откройте GitHub → **Actions**
2. Выберите последний workflow run
3. Нажмите на job для просмотра логов

### Проверка статуса на сервере:
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software

# Статус контейнеров
docker-compose -f docker-compose.production.yml ps

# Логи backend
docker-compose -f docker-compose.production.yml logs -f backend

# Логи PostgreSQL
docker-compose -f docker-compose.production.yml logs postgres
```

---

## 🛠️ Troubleshooting

### Ошибка: "Permission denied (publickey)"
**Решение:**
1. Проверьте, что SSH ключ добавлен в GitHub Secrets
2. Проверьте, что публичный ключ добавлен на сервер:
```bash
cat ~/.ssh/authorized_keys
```

### Ошибка: "git pull failed"
**Решение:**
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
git status
git reset --hard origin/main
```

### Ошибка: "Docker command not found"
**Решение:**
```bash
ssh root@autogreatfood.ru
apt update && apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### Контейнеры не запускаются
**Решение:**
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software

# Полная перезагрузка
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d --build

# Проверить логи
docker-compose -f docker-compose.production.yml logs
```

---

## 📊 Статус Badges

Добавьте в README.md для отображения статуса:

```markdown
![Deploy Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
![Tests Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)
```

---

## 🎯 Best Practices

### 1. Используйте ветки для разработки
```bash
git checkout -b feature/new-feature
# Делайте изменения
git push origin feature/new-feature
# Создайте Pull Request на GitHub
```

### 2. Проверяйте тесты локально
```bash
npm test
npm run lint
```

### 3. Проверяйте Docker локально
```bash
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up
```

### 4. Делайте осмысленные commit messages
```bash
git commit -m "feat: add numeric codes instead of QR"
git commit -m "fix: resolve menu_requests table error"
git commit -m "docs: update CI/CD documentation"
```

### 5. Регулярно проверяйте backups
```bash
ssh root@autogreatfood.ru
ls -lh /root/bufet-software/backup_*.sql.gz
```

---

## 🔄 Rollback (откат изменений)

Если что-то пошло не так:

```bash
ssh root@autogreatfood.ru
cd /root/bufet-software

# Откатиться на предыдущий commit
git log --oneline  # Найдите нужный commit
git reset --hard COMMIT_HASH

# Перезапустить контейнеры
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

Или восстановить из backup:

```bash
# Найти backup
ls -lh backup_*.sql.gz

# Восстановить
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen < backup_YYYYMMDD_HHMMSS.sql
```

---

## ✅ Checklist для первого запуска

- [ ] Добавлены все GitHub Secrets
- [ ] SSH доступ к серверу работает
- [ ] Git настроен на сервере
- [ ] Docker установлен и запущен
- [ ] Проект находится в правильной папке
- [ ] Сделан первый push в main
- [ ] Workflow запустился успешно
- [ ] Сайт доступен по https://autogreatfood.ru

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в GitHub Actions
2. Проверьте логи на сервере
3. Проверьте статус контейнеров
4. Обратитесь к разделу Troubleshooting

---

**🎉 CI/CD настроен и готов к использованию!**
