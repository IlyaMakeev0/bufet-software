@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         🚀 НАСТРОЙКА CI/CD - ШАГ ЗА ШАГОМ                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo Этот скрипт поможет настроить CI/CD для вашего проекта.
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo ШАГ 1: Проверка SSH ключа
echo ═══════════════════════════════════════════════════════════════
echo.

if exist "%USERPROFILE%\.ssh\id_rsa" (
    echo ✅ SSH ключ найден: %USERPROFILE%\.ssh\id_rsa
    echo.
    echo Ваш ПРИВАТНЫЙ ключ для GitHub Secrets:
    echo ───────────────────────────────────────────────────────────
    type "%USERPROFILE%\.ssh\id_rsa"
    echo ───────────────────────────────────────────────────────────
    echo.
    echo ⚠️  СКОПИРУЙТЕ ВЕСЬ ТЕКСТ ВЫШЕ (включая BEGIN и END)
    echo    Это нужно для GitHub Secret: SSH_PRIVATE_KEY
    echo.
) else (
    echo ❌ SSH ключ не найден
    echo.
    echo Создайте SSH ключ командой:
    echo    ssh-keygen -t rsa -b 4096 -C "github-actions"
    echo.
    echo Затем скопируйте его на сервер:
    echo    ssh-copy-id root@autogreatfood.ru
    echo.
    pause
    exit /b 1
)

pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo ШАГ 2: Информация для GitHub Secrets
echo ═══════════════════════════════════════════════════════════════
echo.

echo Добавьте эти 4 секрета в GitHub:
echo GitHub → Settings → Secrets and variables → Actions → New secret
echo.

echo ┌─────────────────────────────────────────────────────────────┐
echo │ 1. SSH_PRIVATE_KEY                                          │
echo │    Значение: (текст выше, который вы скопировали)          │
echo └─────────────────────────────────────────────────────────────┘
echo.

echo ┌─────────────────────────────────────────────────────────────┐
echo │ 2. SERVER_HOST                                              │
echo │    Значение: autogreatfood.ru                              │
echo └─────────────────────────────────────────────────────────────┘
echo.

echo ┌─────────────────────────────────────────────────────────────┐
echo │ 3. SERVER_USER                                              │
echo │    Значение: root                                           │
echo └─────────────────────────────────────────────────────────────┘
echo.

echo ┌─────────────────────────────────────────────────────────────┐
echo │ 4. SERVER_PATH                                              │
echo │    Значение: /root/bufet-software                          │
echo └─────────────────────────────────────────────────────────────┘
echo.

pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo ШАГ 3: Команды для настройки Git на сервере
echo ═══════════════════════════════════════════════════════════════
echo.

echo Выполните эти команды на сервере:
echo.
echo ssh root@autogreatfood.ru
echo cd /root/bufet-software
echo git init
echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo git branch -M main
echo exit
echo.

echo ⚠️  Замените YOUR_USERNAME и YOUR_REPO на ваши данные!
echo.

pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo ШАГ 4: Первый push
echo ═══════════════════════════════════════════════════════════════
echo.

echo После настройки секретов и Git на сервере, выполните:
echo.
echo git add .
echo git commit -m "Setup CI/CD"
echo git push origin main
echo.

echo GitHub Actions автоматически запустит деплой!
echo.

pause

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         ✅ ИНСТРУКЦИИ ПОКАЗАНЫ                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Следующие шаги:
echo   1. Добавьте секреты в GitHub
echo   2. Настройте Git на сервере
echo   3. Сделайте первый push
echo   4. Проверьте GitHub Actions
echo.
echo Подробная документация: НАСТРОЙКА_CICD.txt
echo.
pause
