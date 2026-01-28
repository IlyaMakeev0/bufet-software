import sgMail from '@sendgrid/mail'

// Настройка SendGrid API
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

console.log('📧 Email сервис настроен:')
console.log(`   Provider: SendGrid`)
console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? '***' : 'НЕ УСТАНОВЛЕН'}`)

// Функция отправки кода верификации
export async function sendVerificationCode(email, code) {
  try {
    console.log(`📧 Подготовка письма для ${email} через SendGrid`)
    
    const msg = {
      to: email,
      from: 'ppredprof@gmail.com', // Должен быть верифицирован в SendGrid
      subject: 'Код подтверждения регистрации',
      text: `
Школьная столовая - Код подтверждения регистрации

Здравствуйте!

Ваш код подтверждения: ${code}

Код действителен в течение 10 минут.
Никому не сообщайте этот код.

Если вы не регистрировались, просто проигнорируйте это письмо.

© 2026 Школьная столовая
      `.trim(),
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
      `
    }

    console.log(`📤 Отправка письма через SendGrid API`)
    const response = await sgMail.send(msg)
    console.log('✅ Email sent successfully via SendGrid')
    console.log('📬 Status:', response[0].statusCode)
    return { success: true, messageId: response[0].headers['x-message-id'] }
  } catch (error) {
    console.error('❌ Error sending email via SendGrid:')
    console.error('   Message:', error.message)
    console.error('   Code:', error.code)
    if (error.response) {
      console.error('   Response:', error.response.body)
    }
    throw error
  }
}

// Функция отправки кода сброса пароля
export async function sendPasswordResetCode(email, code) {
  try {
    console.log(`📧 Подготовка письма сброса пароля для ${email} через SendGrid`)
    
    const msg = {
      to: email,
      from: 'ppredprof@gmail.com',
      subject: 'Сброс пароля',
      text: `
Школьная столовая - Сброс пароля

Здравствуйте!

Был запрошен сброс пароля для вашего аккаунта.

Код для сброса пароля: ${code}

Код действителен в течение 15 минут.
Никому не сообщайте этот код.

Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

© 2026 Школьная столовая
      `.trim(),
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
      `
    }

    const response = await sgMail.send(msg)
    console.log('✅ Password reset email sent successfully via SendGrid')
    console.log('📬 Status:', response[0].statusCode)
    return { success: true, messageId: response[0].headers['x-message-id'] }
  } catch (error) {
    console.error('❌ Error sending password reset email via SendGrid:', error)
    throw error
  }
}

// Проверка подключения к SendGrid
export async function verifyEmailConnection() {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  SendGrid API key not configured')
    return false
  }
  
  console.log('✅ SendGrid API key configured')
  return true
}
