# 📚 ПОЛНАЯ ИНСТРУКЦИЯ ПО НАСТРОЙКЕ CI/CD

## Содержание
1. [Подготовка](#подготовка)
2. [Настройка SSH](#настройка-ssh)
3. [Настройка GitHub](#настройка-github)
4. [Настройка сервера](#настройка-сервера)
5. [Первый деплой](#первый-деплой)
6. [Проверка работы](#проверка-работы)
7. [Использование](#использование)
8. [Troubleshooting](#troubleshooting)

---

## Подготовка

### Что вам понадобится:
- ✅ Аккаунт на GitHub
- ✅ Доступ к серверу по SSH (root@autogreatfood.ru)
- ✅ Git установлен локально
- ✅ SSH клиент (OpenSSH, PuTTY)

### Проверка доступа к серверу:
```bash
ssh root@autogreatfood.ru
```

Если подключение успешно - переходите к следующему шагу.

---

## Настройка SSH

### Шаг 1: Проверка существующего SSH ключа

**Windows (PowerShell):**
```powershell
ls ~/.ssh/id_rsa
```

**Linux/Mac:**
```bash
ls ~/.ssh/id_rsa
```

Если файл существует - переходите к Шагу 3.

### Шаг 2: Создание нового SSH ключа

**Windows (PowerShell):**
```powershell
ssh-keygen -t rsa -b 4096 -C "github-actions"
```

**Linux/Mac:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
```

**Важно:**
- Нажмите `Enter` на вопрос "Enter file in which to save the key" (использовать путь по умолчанию)
- Нажмите `Enter` на вопрос "Enter passphrase" (БЕЗ пароля!)
- Нажмите `Enter` еще раз для подтверждения

Вы увидите:
```
Your identification has been saved in /home/user/.ssh/id_rsa
Your public key has been saved in /home/user/.ssh/id_rsa.pub
```

### Шаг 3: Копирование публичного ключа на сервер

**Автоматический способ (рекомендуется):**
```bash
ssh-copy-id root@autogreatfood.ru
```

Введите пароль от сервера, когда попросит.

**Ручной способ (если ssh-copy-id не работает):**

1. Скопируйте публичный ключ:
```bash
# Windows (PowerShell)
Get-Content ~/.ssh/id_rsa.pub | clip

# Linux/Mac
cat ~/.ssh/id_rsa.pub | pbcopy  # Mac
cat ~/.ssh/id_rsa.pub | xclip   # Linux
```

2. Подключитесь к серверу:
```bash
ssh root@autogreatfood.ru
```

3. Добавьте ключ в authorized_keys:
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ВСТАВЬТЕ_СКОПИРОВАННЫЙ_КЛЮЧ" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### Шаг 4: Проверка SSH подключения без пароля

```bash
ssh root@autogreatfood.ru
```

Если подключение прошло БЕЗ запроса пароля - отлично! ✅

### Шаг 5: Получение приватного ключа для GitHub

**Windows (PowerShell):**
```powershell
Get-Content ~/.ssh/id_rsa
```

**Linux/Mac:**
```bash
cat ~/.ssh/id_rsa
```

**Скопируйте ВЕСЬ вывод**, включая строки:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **ВАЖНО:** Это приватный ключ! Никому не показывайте его, кроме GitHub Secrets.

---

## Настройка GitHub

### Шаг 1: Создание репозитория (если еще не создан)

1. Откройте https://github.com
2. Нажмите **New repository** (зеленая кнопка)
3. Заполните:
   - **Repository name:** `school-canteen` (или любое другое имя)
   - **Description:** `School Canteen Management System`
   - **Public** или **Private** (на ваш выбор)
4. Нажмите **Create repository**

### Шаг 2: Добавление GitHub Secrets

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** (вкладка вверху)
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

Добавьте 4 секрета:

#### Секрет 1: SSH_PRIVATE_KEY

**Name:** `SSH_PRIVATE_KEY`

**Secret:** Вставьте приватный ключ, который скопировали в Шаге 5 предыдущего раздела

Должно выглядеть так:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...много строк...
-----END OPENSSH PRIVATE KEY-----
```

Нажмите **Add secret**

#### Секрет 2: SERVER_HOST

**Name:** `SERVER_HOST`

**Secret:** `autogreatfood.ru`

Нажмите **Add secret**

#### Секрет 3: SERVER_USER

**Name:** `SERVER_USER`

**Secret:** `root`

Нажмите **Add secret**

#### Секрет 4: SERVER_PATH

**Name:** `SERVER_PATH`

**Secret:** `/root/bufet-software`

Нажмите **Add secret**

### Шаг 3: Проверка секретов

Вы должны увидеть 4 секрета в списке:
- ✅ SSH_PRIVATE_KEY
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SERVER_PATH

---

## Настройка сервера

### Шаг 1: Подключение к серверу

```bash
ssh root@autogreatfood.ru
```

### Шаг 2: Проверка установленных инструментов

```bash
# Проверка Git
git --version

# Проверка Docker
docker --version

# Проверка Docker Compose
docker-compose --version
```

Если что-то не установлено:

**Установка Git:**
```bash
apt update
apt install -y git
```

**Установка Docker:**
```bash
apt update
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### Шаг 3: Переход в папку проекта

```bash
cd /root/bufet-software
```

Если папки нет:
```bash
mkdir -p /root/bufet-software
cd /root/bufet-software
```

### Шаг 4: Инициализация Git репозитория

```bash
# Инициализация Git (если еще не сделано)
git init

# Проверка существующих remote
git remote -v
```

Если remote уже есть - пропустите следующий шаг.

### Шаг 5: Добавление remote репозитория

⚠️ **ВАЖНО:** Замените `YOUR_USERNAME` и `YOUR_REPO` на ваши данные!

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Например:
```bash
git remote add origin https://github.com/ivanov/school-canteen.git
```

### Шаг 6: Настройка основной ветки

```bash
git branch -M main
```

### Шаг 7: Проверка настроек

```bash
git remote -v
```

Должно показать:
```
origin  https://github.com/YOUR_USERNAME/YOUR_REPO.git (fetch)
origin  https://github.com/YOUR_USERNAME/YOUR_REPO.git (push)
```

### Шаг 8: Выход с сервера

```bash
exit
```

---

## Первый деплой

### Шаг 1: Подготовка локального репозитория

На вашем локальном компьютере, в папке проекта:

```bash
# Проверка текущего статуса
git status

# Проверка remote
git remote -v
```

Если remote не настроен:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Шаг 2: Добавление всех файлов

```bash
git add .
```

### Шаг 3: Создание commit

```bash
git commit -m "Setup CI/CD with GitHub Actions"
```

### Шаг 4: Push в GitHub

```bash
git push -u origin main
```

Если просит логин/пароль:
- **Username:** ваш GitHub username
- **Password:** используйте Personal Access Token (не обычный пароль!)

**Как создать Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Выберите scopes: `repo` (все галочки)
4. Generate token
5. Скопируйте токен и используйте вместо пароля

### Шаг 5: Наблюдение за деплоем

1. Откройте ваш репозиторий на GitHub
2. Перейдите во вкладку **Actions**
3. Вы увидите запущенный workflow "Deploy to Production"
4. Нажмите на него для просмотра логов

**Что происходит:**
- ⏳ Подключение к серверу
- ⏳ Скачивание изменений
- ⏳ Остановка контейнеров
- ⏳ Сборка контейнеров
- ⏳ Запуск контейнеров
- ⏳ Проверка здоровья

**Время выполнения:** ~2-3 минуты

---

## Проверка работы

### Шаг 1: Проверка статуса workflow

В GitHub Actions вы должны увидеть:
- ✅ Зеленая галочка - деплой успешен
- ❌ Красный крестик - ошибка (см. Troubleshooting)

### Шаг 2: Проверка сайта

Откройте в браузере:
```
https://autogreatfood.ru
```

Сайт должен быть доступен и работать.

### Шаг 3: Проверка контейнеров на сервере

```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
docker-compose -f docker-compose.production.yml ps
```

Должно показать:
```
NAME                     STATUS
school-canteen-backend   Up
school-canteen-db        Up
```

### Шаг 4: Проверка логов

```bash
docker-compose -f docker-compose.production.yml logs -f backend
```

Должно показать:
```
✅ PostgreSQL database adapter
✅ Database already initialized
🚀 HTTPS Server running on: https://localhost:443
```

Нажмите `Ctrl+C` для выхода из логов.

---

## Использование

### Автоматический деплой

Просто делайте изменения и push:

```bash
# 1. Внесите изменения в код
# 2. Добавьте изменения
git add .

# 3. Создайте commit
git commit -m "Add new feature"

# 4. Push в GitHub
git push origin main
```

GitHub Actions автоматически задеплоит изменения на сервер!

### Ручной деплой

1. Откройте GitHub → Actions
2. Выберите **Deploy to Production**
3. Нажмите **Run workflow**
4. Выберите ветку `main`
5. Нажмите **Run workflow**

### Проверка перед push

Используйте скрипт для проверки кода:

```bash
test-before-push.bat
```

Он проверит:
- ✅ Синтаксис JavaScript
- ✅ Docker конфигурацию
- ✅ Наличие необходимых файлов
- ✅ Git статус

### Просмотр логов деплоя

1. GitHub → Actions
2. Выберите последний workflow run
3. Нажмите на job "Deploy to Server"
4. Просмотрите логи каждого шага

### Ручной backup базы данных

1. GitHub → Actions
2. Выберите **Database Backup**
3. Нажмите **Run workflow**
4. Нажмите **Run workflow** еще раз

Или на сервере:
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup_manual.sql
gzip backup_manual.sql
```

---

## Troubleshooting

### Ошибка: "Permission denied (publickey)"

**Причина:** SSH ключ не добавлен правильно

**Решение:**
1. Проверьте, что приватный ключ скопирован полностью (включая BEGIN и END)
2. Проверьте, что публичный ключ добавлен на сервер:
```bash
ssh root@autogreatfood.ru
cat ~/.ssh/authorized_keys
```

### Ошибка: "git pull failed"

**Причина:** Конфликт изменений на сервере

**Решение:**
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software
git status
git reset --hard origin/main
git pull origin main
```

### Ошибка: "Docker command not found"

**Причина:** Docker не установлен на сервере

**Решение:**
```bash
ssh root@autogreatfood.ru
apt update
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### Ошибка: "Container is unhealthy"

**Причина:** Контейнер не может запуститься

**Решение:**
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software

# Посмотреть логи
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs postgres

# Полная перезагрузка
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d --build
```

### Ошибка: "Health check failed"

**Причина:** Сайт не отвечает на health check

**Решение:**
1. Проверьте, что сайт доступен: https://autogreatfood.ru
2. Проверьте логи backend
3. Проверьте, что порты 80 и 443 открыты:
```bash
ssh root@autogreatfood.ru
netstat -tulpn | grep -E ':(80|443)'
```

### Workflow застрял на "Waiting"

**Причина:** GitHub Actions ждет подтверждения

**Решение:**
1. Проверьте, что все секреты добавлены
2. Проверьте, что workflow файлы корректны
3. Попробуйте отменить и запустить заново

### Сайт не открывается после деплоя

**Решение:**
```bash
ssh root@autogreatfood.ru
cd /root/bufet-software

# Проверить статус
docker-compose -f docker-compose.production.yml ps

# Проверить логи
docker-compose -f docker-compose.production.yml logs -f backend

# Перезапустить
docker-compose -f docker-compose.production.yml restart backend
```

---

## Дополнительные возможности

### Добавление уведомлений в Telegram

Создайте файл `.github/workflows/notify.yml`:

```yaml
name: Telegram Notification

on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types:
      - completed

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Telegram notification
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            🚀 Deployment ${{ github.workflow }} 
            Status: ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
```

Добавьте секреты:
- `TELEGRAM_BOT_TOKEN` - токен бота
- `TELEGRAM_CHAT_ID` - ID чата

### Добавление тестов

Создайте файл `test/example.test.js`:

```javascript
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

Обновите `package.json`:
```json
{
  "scripts": {
    "test": "jest"
  }
}
```

### Добавление линтера

```bash
npm install --save-dev eslint
npx eslint --init
```

Обновите `package.json`:
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

---

## Полезные команды

### Локально

```bash
# Проверка статуса Git
git status

# Просмотр истории
git log --oneline

# Откат последнего commit (локально)
git reset --soft HEAD~1

# Проверка перед push
test-before-push.bat

# Просмотр изменений
git diff
```

### На сервере

```bash
# Подключение
ssh root@autogreatfood.ru

# Переход в проект
cd /root/bufet-software

# Статус контейнеров
docker-compose -f docker-compose.production.yml ps

# Логи
docker-compose -f docker-compose.production.yml logs -f backend

# Перезапуск
docker-compose -f docker-compose.production.yml restart backend

# Полная перезагрузка
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

# Просмотр backups
ls -lh backup_*.sql.gz

# Очистка старых образов
docker system prune -a
```

---

## Checklist

Используйте этот checklist для проверки настройки:

- [ ] SSH ключ создан
- [ ] SSH ключ скопирован на сервер
- [ ] SSH подключение работает без пароля
- [ ] Репозиторий создан на GitHub
- [ ] 4 секрета добавлены в GitHub
- [ ] Git настроен на сервере
- [ ] Remote добавлен локально
- [ ] Первый push выполнен
- [ ] Workflow запустился в GitHub Actions
- [ ] Workflow завершился успешно (зеленая галочка)
- [ ] Сайт открывается: https://autogreatfood.ru
- [ ] Контейнеры запущены на сервере
- [ ] Логи показывают успешный запуск

---

## Заключение

Теперь у вас настроен полноценный CI/CD pipeline! 🎉

**Что дальше:**
- Делайте изменения в коде
- Push в GitHub
- Наблюдайте автоматический деплой
- Наслаждайтесь автоматизацией!

**Полезные ссылки:**
- GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- Ваш сайт: https://autogreatfood.ru
- Документация GitHub Actions: https://docs.github.com/en/actions

**Поддержка:**
- Проверьте раздел Troubleshooting
- Посмотрите логи в GitHub Actions
- Проверьте логи на сервере

---

**✨ Успешной работы с CI/CD!**
