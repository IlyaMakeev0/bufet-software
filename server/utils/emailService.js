import nodemailer from 'nodemailer'

// Настройки SMTP из переменных окружения
const SMTP_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
}

// Создание транспорта (только если credentials заполнены)
let transporter = null

if (SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
  transporter = nodemailer.createTransport(SMTP_CONFIG)
  console.log('📧 Email сервис настроен:')
  console.log(`   Host: ${SMTP_CONFIG.host}`)
  console.log(`   Port: ${SMTP_CONFIG.port}`)
  console.log(`   User: ${SMTP_CONFIG.auth.user}`)
  console.log(`   Password: ***`)
} else {
  console.log('📧 Email сервис:')
  console.log(`   ⚠️  Credentials не установлены`)
  console.log(`   💡 Используйте SKIP_EMAIL=true для режима разработки`)
  console.log(`   💡 Или заполните EMAIL_USER и EMAIL_PASSWORD в .env`)
}

// Функция отправки кода верификации
export async function sendVerificationCode(email, code) {
  // Проверка что transporter создан
  if (!transporter) {
    throw new Error('Email transporter not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env')
  }
  
  try {
    const mailOptions = {
      from: {
        name: 'Школьная столовая',
        address: SMTP_CONFIG.auth.user
      },
      to: email,
      subject: 'Код подтверждения регистрации',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #1565c0;
              margin-bottom: 30px;
            }
            .code-box {
              background: #ffffff;
              border: 3px solid #1565c0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #1565c0;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Школьная столовая</h1>
              <h2>Код подтверждения регистрации</h2>
            </div>
            
            <p>Здравствуйте!</p>
            <p>Вы получили это письмо, потому что кто-то пытается зарегистрироваться в системе школьной столовой, используя этот email адрес.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666;">Ваш код подтверждения:</p>
              <div class="code">${code}</div>
            </div>
            
            <div class="info">
              <strong>⚠️ Важно:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Код действителен в течение <strong>10 минут</strong></li>
                <li>Никому не сообщайте этот код</li>
                <li>Если вы не регистрировались, просто проигнорируйте это письмо</li>
              </ul>
            </div>
            
            <p>Введите этот код на странице регистрации, чтобы завершить создание аккаунта.</p>
            
            <div class="footer">
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
              <p>© 2026 Школьная столовая. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Школьная столовая - Код подтверждения регистрации

Здравствуйте!

Ваш код подтверждения: ${code}

Код действителен в течение 10 минут.
Никому не сообщайте этот код.

Если вы не регистрировались, просто проигнорируйте это письмо.

© 2026 Школьная столовая
      `.trim()
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Функция отправки кода сброса пароля
export async function sendPasswordResetCode(email, code) {
  // Проверка что transporter создан
  if (!transporter) {
    throw new Error('Email transporter not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env')
  }
  
  try {
    const mailOptions = {
      from: {
        name: 'Школьная столовая',
        address: SMTP_CONFIG.auth.user
      },
      to: email,
      subject: 'Сброс пароля',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #c62828;
              margin-bottom: 30px;
            }
            .code-box {
              background: #ffffff;
              border: 3px solid #c62828;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #c62828;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info {
              background: #ffebee;
              border-left: 4px solid #c62828;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Школьная столовая</h1>
              <h2>Сброс пароля</h2>
            </div>
            
            <p>Здравствуйте!</p>
            <p>Вы получили это письмо, потому что был запрошен сброс пароля для вашего аккаунта.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666;">Код для сброса пароля:</p>
              <div class="code">${code}</div>
            </div>
            
            <div class="info">
              <strong>⚠️ Важно:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Код действителен в течение <strong>15 минут</strong></li>
                <li>Никому не сообщайте этот код</li>
                <li>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо</li>
                <li>Ваш текущий пароль останется без изменений, пока вы не введёте этот код</li>
              </ul>
            </div>
            
            <p>Введите этот код на странице сброса пароля, чтобы установить новый пароль.</p>
            
            <div class="footer">
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
              <p>© 2026 Школьная столовая. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Школьная столовая - Сброс пароля

Здравствуйте!

Был запрошен сброс пароля для вашего аккаунта.

Код для сброса пароля: ${code}

Код действителен в течение 15 минут.
Никому не сообщайте этот код.

Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

© 2026 Школьная столовая
      `.trim()
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

// Проверка подключения к SMTP серверу
export async function verifyEmailConnection() {
  if (!transporter) {
    console.log('⚠️  Email transporter not configured')
    return false
  }
  
  try {
    await transporter.verify()
    console.log('✅ SMTP server connection verified')
    return true
  } catch (error) {
    console.error('❌ SMTP server connection failed:', error)
    return false
  }
}
