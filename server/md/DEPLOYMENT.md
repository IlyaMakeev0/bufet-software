# 🚀 Развертывание проекта

## Локальная разработка

### Требования
- Node.js 16+ 
- npm или yarn
- Git

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd school-canteen

# Установить зависимости
npm install

# Запустить сервер (терминал 1)
npm run server

# Запустить клиент (терминал 2)
npm run dev
```

Приложение будет доступно на:
- http://localhost:3000
- http://127.0.0.1:3000  
- http://0.0.0.0:3000

**Не работает localhost?** Смотрите [ALTERNATIVE_PORTS.md](ALTERNATIVE_PORTS.md)

## Продакшен сборка

### Сборка клиента

```bash
npm run build
```

Результат будет в папке `dist/`

### Запуск в продакшене

```bash
# Предпросмотр сборки
npm run preview

# Или использовать serve
npx serve dist -p 3000
```

## Развертывание на сервере

### Вариант 1: VPS (Ubuntu/Debian)

#### 1. Установка Node.js

```bash
# Обновить систему
sudo apt update
sudo apt upgrade -y

# Установить Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверить версию
node --version
npm --version
```

#### 2. Установка PM2

```bash
# Установить PM2 глобально
sudo npm install -g pm2

# Проверить установку
pm2 --version
```

#### 3. Клонирование проекта

```bash
# Перейти в директорию
cd /var/www

# Клонировать проект
git clone <repository-url> school-canteen
cd school-canteen

# Установить зависимости
npm install

# Собрать клиент
npm run build
```

#### 4. Настройка PM2

Создать файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'school-canteen-server',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

Запустить:

```bash
# Запустить сервер
pm2 start ecosystem.config.js

# Сохранить конфигурацию
pm2 save

# Автозапуск при перезагрузке
pm2 startup
```

#### 5. Настройка Nginx

```bash
# Установить Nginx
sudo apt install -y nginx

# Создать конфигурацию
sudo nano /etc/nginx/sites-available/school-canteen
```

Содержимое файла:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Клиент
    location / {
        root /var/www/school-canteen/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активировать:

```bash
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/school-canteen /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

#### 6. SSL сертификат (Let's Encrypt)

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d your-domain.com

# Автообновление
sudo certbot renew --dry-run
```

### Вариант 2: Heroku

#### 1. Подготовка

Создать `Procfile`:

```
web: node server/index.js
```

Обновить `package.json`:

```json
{
  "scripts": {
    "start": "node server/index.js",
    "heroku-postbuild": "npm run build"
  }
}
```

#### 2. Развертывание

```bash
# Установить Heroku CLI
npm install -g heroku

# Войти
heroku login

# Создать приложение
heroku create school-canteen-app

# Деплой
git push heroku main

# Открыть
heroku open
```

### Вариант 3: Vercel (только клиент)

```bash
# Установить Vercel CLI
npm install -g vercel

# Деплой
vercel

# Продакшен
vercel --prod
```

Создать `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Вариант 4: Docker

#### Dockerfile для сервера

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server ./server

EXPOSE 5000

CMD ["node", "server/index.js"]
```

#### Dockerfile для клиента

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "5000:5000"
    volumes:
      - ./school_canteen.db:/app/school_canteen.db
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    ports:
      - "80:80"
    depends_on:
      - server
    restart: unless-stopped
```

Запуск:

```bash
# Собрать и запустить
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановить
docker-compose down
```

## Переменные окружения

### Разработка (.env.local)

```env
PORT=5000
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

### Продакшен

```env
PORT=5000
SESSION_SECRET=super-secret-production-key
NODE_ENV=production
DATABASE_PATH=/var/data/school_canteen.db
```

## Резервное копирование

### База данных

```bash
# Создать бэкап
cp school_canteen.db school_canteen_backup_$(date +%Y%m%d).db

# Автоматический бэкап (cron)
0 2 * * * cp /var/www/school-canteen/school_canteen.db /var/backups/school_canteen_$(date +\%Y\%m\%d).db
```

### Полный проект

```bash
# Создать архив
tar -czf school-canteen-backup.tar.gz /var/www/school-canteen

# Восстановить
tar -xzf school-canteen-backup.tar.gz -C /var/www/
```

## Мониторинг

### PM2 мониторинг

```bash
# Статус
pm2 status

# Логи
pm2 logs

# Мониторинг
pm2 monit

# Веб-интерфейс
pm2 plus
```

### Логирование

Добавить в `server/index.js`:

```javascript
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'

// Создать поток для логов
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
)

// Использовать morgan
app.use(morgan('combined', { stream: accessLogStream }))
```

## Обновление

```bash
# На сервере
cd /var/www/school-canteen

# Получить изменения
git pull origin main

# Установить зависимости
npm install

# Собрать клиент
npm run build

# Перезапустить сервер
pm2 restart school-canteen-server
```

## Безопасность

### 1. Firewall

```bash
# Установить UFW
sudo apt install ufw

# Разрешить SSH
sudo ufw allow 22

# Разрешить HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Включить
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Установить
sudo apt install fail2ban

# Настроить
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
```

### 3. Обновления

```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Производительность

### 1. Кэширование Nginx

```nginx
# В конфигурации Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Сжатие

```nginx
# Включить gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### 3. База данных

```javascript
// Индексы для частых запросов
db.run('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)')
db.run('CREATE INDEX IF NOT EXISTS idx_menu_day ON menu(day)')
```

## Проблемы и решения

### Порт занят

```bash
# Найти процесс
sudo lsof -i :5000

# Убить процесс
sudo kill -9 <PID>
```

### База данных заблокирована

```bash
# Проверить процессы
ps aux | grep node

# Перезапустить сервер
pm2 restart school-canteen-server
```

### Недостаточно памяти

```bash
# Увеличить лимит PM2
pm2 start ecosystem.config.js --max-memory-restart 2G
```

## Чеклист развертывания

- [ ] Node.js установлен
- [ ] Проект клонирован
- [ ] Зависимости установлены
- [ ] Клиент собран
- [ ] PM2 настроен
- [ ] Nginx настроен
- [ ] SSL сертификат установлен
- [ ] Firewall настроен
- [ ] Резервное копирование настроено
- [ ] Мониторинг настроен
- [ ] Домен настроен
- [ ] Тестирование пройдено

## Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs`
2. Проверьте статус: `pm2 status`
3. Проверьте Nginx: `sudo nginx -t`
4. Проверьте порты: `sudo netstat -tulpn`

Удачного развертывания! 🚀
