import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Настройки
smtp_server = "smtp.gmail.com"
port = 587
sender_email = "ppredprof@gmail.com"
receiver_email = "recipient_email@gmail.com"
password = "xvzr khqt hckc wabb"  # Используйте "Пароль приложения"

# Создание сообщения
message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = "Тема письма"
body = "Привет, это тестовое письмо из Python!"
message.attach(MIMEText(body, "plain"))

# Отправка
try:
    server = smtplib.SMTP(smtp_server, port)
    server.starttls()  # Защита соединения [6]
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, message.as_string())
    server.quit()
    print("Письмо успешно отправлено!")
except Exception as e:
    print(f"Ошибка: {e}")