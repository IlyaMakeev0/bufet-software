# 🎮 Docker Commands Cheat Sheet

## Быстрый справочник команд Docker

---

## 🚀 Основные команды

### Запуск проекта

#### Windows (bat-файлы)
```bash
# Проверка готовности
.\docker-test.bat

# Запуск
.\docker-start.bat

# Остановка
.\docker-stop.bat

# Пересборка
.\docker-rebuild.bat

# Логи
.\docker-logs.bat
```

#### Linux/Mac (docker-compose)
```bash
# Запуск
docker-compose up -d

# Запуск с пересборкой
docker-compose up --build -d

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Перезапуск
docker-compose restart

# Логи
docker-compose logs -f
```

---

## 📊 Мониторинг

### Статус контейнеров
```bash
# Список запущенных контейнеров
docker ps

# Список всех контейнеров (включая остановленные)
docker ps -a

# Статус через docker-compose
docker-compose ps
```

### Логи
```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs app
docker-compose logs db

# Следить за логами в реальном времени
docker-compose logs -f

# Последние 100 строк
docker-compose logs --tail=100

# Логи за последний час
docker-compose logs --since 1h

# Экспорт логов в файл
docker-compose logs > logs.txt
```

### Использование ресурсов
```bash
# Статистика в реальном времени
docker stats

# Статистика без обновления
docker stats --no-stream

# Дисковое пространство
docker system df

# Подробная информация о дисковом пространстве
docker system df -v
```

---

## 🔧 Управление контейнерами

### Запуск/остановка
```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск конкретного сервиса
docker-compose up -d app
docker-compose up -d db

# Остановка всех сервисов
docker-compose stop

# Остановка конкретного сервиса
docker-compose stop app
docker-compose stop db

# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart app
docker-compose restart db
```

### Удаление
```bash
# Остановка и удаление контейнеров
docker-compose down

# Остановка и удаление контейнеров + volumes
docker-compose down -v

# Остановка и удаление контейнеров + volumes + images
docker-compose down -v --rmi all
```

---

## 🏗️ Сборка образов

### Сборка
```bash
# Сборка всех образов
docker-compose build

# Сборка конкретного образа
docker-compose build app

# Сборка без кэша
docker-compose build --no-cache

# Сборка без кэша конкретного образа
docker-compose build --no-cache app
```

### Пересборка и запуск
```bash
# Пересборка и запуск
docker-compose up --build -d

# Пересборка без кэша и запуск
docker-compose build --no-cache && docker-compose up -d
```

---

## 🔍 Отладка

### Выполнение команд в контейнере
```bash
# Bash в контейнере приложения
docker exec -it school-canteen-app sh

# Bash в контейнере БД
docker exec -it school-canteen-db sh

# Выполнение команды без входа
docker exec school-canteen-app node --version
docker exec school-canteen-app ls -la /app
```

### Проверка конфигурации
```bash
# Валидация docker-compose.yml
docker-compose config

# Валидация с выводом результата
docker-compose config --services

# Проверка переменных окружения
docker-compose config | grep -A 10 environment
```

### Инспекция
```bash
# Информация о контейнере
docker inspect school-canteen-app
docker inspect school-canteen-db

# Информация о сети
docker network inspect bufet-software_canteen-network

# Информация о volume
docker volume inspect bufet-software_postgres_data
docker volume inspect bufet-software_app_data
```

---

## 🗄️ База данных

### Подключение к PostgreSQL
```bash
# Подключение к psql
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen

# Выполнение SQL команды
docker exec -it school-canteen-db psql -U canteen_user -d school_canteen -c "SELECT COUNT(*) FROM users;"
```

### Внутри psql
```sql
-- Список таблиц
\dt

-- Описание таблицы
\d users
\d menu

-- Список баз данных
\l

-- Список пользователей
\du

-- Выход
\q
```

### Backup и восстановление
```bash
# Создание backup
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup.sql

# Создание backup с timestamp
docker exec school-canteen-db pg_dump -U canteen_user school_canteen > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из backup
docker exec -i school-canteen-db psql -U canteen_user school_canteen < backup.sql

# Восстановление с удалением существующих данных
docker exec -i school-canteen-db psql -U canteen_user -d school_canteen -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i school-canteen-db psql -U canteen_user school_canteen < backup.sql
```

---

## 🌐 Сеть

### Управление сетями
```bash
# Список сетей
docker network ls

# Информация о сети
docker network inspect bufet-software_canteen-network

# Создание сети (если нужно)
docker network create canteen-network

# Удаление сети
docker network rm bufet-software_canteen-network
```

### Проверка связи
```bash
# Ping между контейнерами
docker exec school-canteen-app ping -c 3 db

# Проверка DNS
docker exec school-canteen-app nslookup db

# Проверка портов
docker exec school-canteen-app nc -zv db 5432
```

---

## 💾 Volumes

### Управление volumes
```bash
# Список volumes
docker volume ls

# Информация о volume
docker volume inspect bufet-software_postgres_data
docker volume inspect bufet-software_app_data

# Удаление volume
docker volume rm bufet-software_postgres_data
docker volume rm bufet-software_app_data

# Удаление всех неиспользуемых volumes
docker volume prune
```

### Backup volumes
```bash
# Backup volume в tar архив
docker run --rm -v bufet-software_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz -C /data .

# Восстановление volume из tar архива
docker run --rm -v bufet-software_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_backup.tar.gz -C /data
```

---

## 🧹 Очистка

### Удаление контейнеров
```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить все контейнеры (осторожно!)
docker rm -f $(docker ps -aq)
```

### Удаление образов
```bash
# Удалить неиспользуемые образы
docker image prune

# Удалить все образы (осторожно!)
docker rmi -f $(docker images -q)
```

### Удаление volumes
```bash
# Удалить неиспользуемые volumes
docker volume prune

# Удалить все volumes (осторожно!)
docker volume rm $(docker volume ls -q)
```

### Полная очистка
```bash
# Удалить все неиспользуемые ресурсы
docker system prune

# Удалить все неиспользуемые ресурсы + volumes
docker system prune -a --volumes

# Удалить все (осторожно!)
docker-compose down -v --rmi all
docker system prune -a --volumes -f
```

---

## 🔐 Безопасность

### Проверка уязвимостей
```bash
# Сканирование образа (если установлен Docker Scout)
docker scout cves school-canteen-app

# Проверка образа на уязвимости (если установлен Trivy)
trivy image school-canteen-app
```

### Управление секретами
```bash
# Просмотр переменных окружения
docker exec school-canteen-app env

# Просмотр конкретной переменной
docker exec school-canteen-app env | grep DB_PASSWORD
```

---

## 📈 Производительность

### Ограничение ресурсов
```bash
# Запуск с ограничением памяти
docker-compose up -d --scale app=1 --memory="512m"

# Обновление ограничений для запущенного контейнера
docker update --memory="512m" --cpus="1" school-canteen-app
```

### Мониторинг производительности
```bash
# Топ процессов в контейнере
docker top school-canteen-app
docker top school-canteen-db

# Статистика в реальном времени
docker stats school-canteen-app school-canteen-db
```

---

## 🧪 Тестирование

### Health checks
```bash
# Проверка health status
docker inspect --format='{{.State.Health.Status}}' school-canteen-app
docker inspect --format='{{.State.Health.Status}}' school-canteen-db

# Проверка через API
curl http://localhost:5000/health

# Проверка PostgreSQL
docker exec school-canteen-db pg_isready -U canteen_user -d school_canteen
```

### Тестовые запросы
```bash
# Health check
curl http://localhost:5000/health

# Главная страница
curl -I http://localhost:5000

# API endpoint (пример)
curl http://localhost:5000/api/menu
```

---

## 🔄 CI/CD

### Сборка для CI/CD
```bash
# Сборка с тегом
docker build -t school-canteen-app:latest .
docker build -t school-canteen-app:1.0.0 .

# Сборка с аргументами
docker build --build-arg NODE_ENV=production -t school-canteen-app:latest .

# Сборка без кэша
docker build --no-cache -t school-canteen-app:latest .
```

### Push в registry
```bash
# Tag для registry
docker tag school-canteen-app:latest registry.example.com/school-canteen-app:latest

# Push в registry
docker push registry.example.com/school-canteen-app:latest

# Pull из registry
docker pull registry.example.com/school-canteen-app:latest
```

---

## 📝 Полезные алиасы

### Для .bashrc или .zshrc (Linux/Mac)
```bash
# Добавьте в ~/.bashrc или ~/.zshrc

# Docker Compose shortcuts
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose restart'
alias dcl='docker-compose logs -f'
alias dcp='docker-compose ps'

# Docker shortcuts
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlogs='docker logs -f'

# Cleanup shortcuts
alias dprune='docker system prune -a --volumes'
alias dclean='docker-compose down -v && docker system prune -a --volumes -f'
```

### Для PowerShell (Windows)
```powershell
# Добавьте в $PROFILE

# Docker Compose shortcuts
function dcu { docker-compose up -d }
function dcd { docker-compose down }
function dcr { docker-compose restart }
function dcl { docker-compose logs -f }
function dcp { docker-compose ps }

# Docker shortcuts
function dps { docker ps }
function dpsa { docker ps -a }
function di { docker images }
```

---

## 🆘 Troubleshooting Commands

### Диагностика проблем
```bash
# Проверка Docker
docker version
docker info

# Проверка docker-compose
docker-compose version

# Проверка конфигурации
docker-compose config

# Проверка логов
docker-compose logs --tail=100

# Проверка статуса
docker-compose ps

# Проверка сети
docker network ls
docker network inspect bufet-software_canteen-network

# Проверка volumes
docker volume ls
docker volume inspect bufet-software_postgres_data
```

### Перезапуск с чистого листа
```bash
# Полная очистка и перезапуск
docker-compose down -v
docker system prune -a --volumes -f
docker-compose up --build -d
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

### Локальная документация
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - полное руководство
- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - быстрый старт
- [DOCKER_TESTING.md](./DOCKER_TESTING.md) - тестирование

---

## ✅ Быстрый чеклист

```bash
# 1. Проверка готовности
docker --version
docker-compose --version
docker ps

# 2. Запуск
docker-compose up --build -d

# 3. Проверка статуса
docker ps
docker-compose logs -f

# 4. Проверка работы
curl http://localhost:5000/health

# 5. Остановка
docker-compose down
```

---

**Сохраните этот файл для быстрого доступа к командам! 📌**
