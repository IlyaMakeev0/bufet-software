# Multi-stage build для оптимизации размера образа

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app

# Установка зависимостей для production
COPY package*.json ./
RUN npm ci --only=production

# Копирование backend кода
COPY server ./server

# Копирование собранного frontend из предыдущего stage
COPY --from=frontend-builder /app/dist ./dist

# Создание директории для данных
RUN mkdir -p /app/data

# Переменные окружения
ENV NODE_ENV=production
ENV HTTP_PORT=8080
ENV HTTPS_PORT=8443

# Открытие портов
EXPOSE 8080 8443

# Запуск приложения
CMD ["node", "server/index-docker.js"]
