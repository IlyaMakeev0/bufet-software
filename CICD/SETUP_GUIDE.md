# Инструкция по настройке CI/CD для React.js проекта

## 📋 Содержание
1. [Структура файлов](#структура-файлов)
2. [Настройка GitHub Secrets](#настройка-github-secrets)
3. [Настройка package.json](#настройка-packagejson)
4. [Локальное тестирование Docker](#локальное-тестирование-docker)
5. [Деплой](#деплой)

## 📁 Структура файлов

Разместите файлы в вашем проекте следующим образом:

```
your-react-project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions workflow
├── src/
├── public/
├── Dockerfile                  # Docker конфигурация
├── nginx.conf                  # Nginx конфигурация
├── .dockerignore              # Исключения для Docker
├── package.json
└── README.md
```

## 🔐 Настройка GitHub Secrets

1. Перейдите в ваш GitHub репозиторий
2. Settings → Secrets and variables → Actions
3. Добавьте следующие secrets:

- `DOCKER_USERNAME` - ваш логин на Docker Hub
- `DOCKER_PASSWORD` - ваш пароль или токен Docker Hub

### Как создать Docker Hub токен:
1. Зайдите на https://hub.docker.com
2. Account Settings → Security → New Access Token
3. Скопируйте токен и добавьте как `DOCKER_PASSWORD`

## 📦 Настройка package.json

Убедитесь, что в вашем `package.json` есть следующие скрипты:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint src/**/*.{js,jsx}",
    "eject": "react-scripts eject"
  }
}
```

Если у вас нет ESLint, установите его:

```bash
npm install --save-dev eslint eslint-config-react-app
```

Создайте `.eslintrc.json`:

```json
{
  "extends": "react-app"
}
```

## 🐳 Локальное тестирование Docker

### Сборка образа:
```bash
docker build -t react-app:latest .
```

### Запуск контейнера:
```bash
docker run -p 8080:80 react-app:latest
```

Откройте http://localhost:8080

### Тестирование с docker-compose:
Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
```

Запустите:
```bash
docker-compose up
```

## 🚀 Как работает CI/CD Pipeline

### При Push в main/develop:
1. ✅ Запускаются тесты
2. 🔨 Собирается приложение
3. 🐳 Создаётся Docker образ
4. 📤 Образ публикуется в Docker Hub

### При Pull Request:
1. ✅ Запускаются тесты
2. 🔨 Проверяется сборка

### Теги Docker образов:
- `latest` - последний коммит в main
- `develop` - последний коммит в develop
- `v1.0.0` - версионные теги (если создать release)
- `main-abc1234` - коммит SHA

## 🌐 Деплой

### Вариант 1: VPS с Docker

Подключитесь к серверу и выполните:

```bash
# Скачайте образ
docker pull your-dockerhub-username/react-app:latest

# Остановите старый контейнер
docker stop react-app || true
docker rm react-app || true

# Запустите новый
docker run -d \
  --name react-app \
  --restart unless-stopped \
  -p 80:80 \
  your-dockerhub-username/react-app:latest
```

### Вариант 2: Автоматический деплой через SSH

Добавьте в GitHub Secrets:
- `SSH_PRIVATE_KEY` - приватный SSH ключ
- `SSH_HOST` - IP адрес сервера
- `SSH_USER` - пользователь для SSH

Раскомментируйте секцию `deploy` в `ci-cd.yml` и добавьте:

```yaml
deploy:
  needs: docker
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
  - name: Deploy to server
    uses: appleboy/ssh-action@master
    with:
      host: ${{ secrets.SSH_HOST }}
      username: ${{ secrets.SSH_USER }}
      key: ${{ secrets.SSH_PRIVATE_KEY }}
      script: |
        docker pull ${{ env.DOCKER_IMAGE_NAME }}:latest
        docker stop react-app || true
        docker rm react-app || true
        docker run -d --name react-app -p 80:80 ${{ env.DOCKER_IMAGE_NAME }}:latest
```

### Вариант 3: Kubernetes

Создайте `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
      - name: react-app
        image: your-dockerhub-username/react-app:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: react-app-service
spec:
  selector:
    app: react-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## 🔧 Настройка переменных окружения

Если ваше приложение использует переменные окружения:

1. Для GitHub Actions добавьте в `ci-cd.yml`:
```yaml
- name: Build application
  run: npm run build
  env:
    REACT_APP_API_URL: ${{ secrets.API_URL }}
```

2. Для Docker передайте при запуске:
```bash
docker run -e REACT_APP_API_URL=https://api.example.com -p 80:80 react-app
```

## 📊 Мониторинг сборок

1. Откройте вкладку "Actions" в вашем GitHub репозитории
2. Здесь вы увидите все запуски pipeline
3. Кликните на любой запуск для просмотра логов

## 🐛 Troubleshooting

### Тесты падают в CI
- Убедитесь, что `package.json` содержит скрипт `test`
- Проверьте, что тесты проходят локально: `npm test`

### Docker образ не публикуется
- Проверьте, что добавили `DOCKER_USERNAME` и `DOCKER_PASSWORD` в Secrets
- Измените `DOCKER_IMAGE_NAME` в `ci-cd.yml` на ваше имя пользователя

### Большой размер Docker образа
- Используется многоэтапная сборка (уже настроена)
- Проверьте `.dockerignore` - должен исключать `node_modules`

## 📝 Дополнительные улучшения

### Добавить проверку типов TypeScript:
```yaml
- name: Type check
  run: npm run type-check
```

### Добавить E2E тесты с Cypress:
```yaml
- name: Run E2E tests
  run: npm run cypress:run
```

### Добавить анализ безопасности:
```yaml
- name: Security audit
  run: npm audit --audit-level=moderate
```

## 🎯 Следующие шаги

1. ✅ Создайте все файлы в вашем проекте
2. ✅ Настройте GitHub Secrets
3. ✅ Измените `DOCKER_IMAGE_NAME` на ваше
4. ✅ Сделайте commit и push
5. ✅ Проверьте результат во вкладке Actions

Удачи с вашим CI/CD! 🚀
