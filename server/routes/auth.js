import express from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery } from '../database.js'
import { validatePhone, formatPhone, validateClassName, validatePosition } from '../utils/phone.js'
import { sendVerificationCode, sendPasswordResetCode } from '../utils/emailService.js'

const router = express.Router()

// Секретные коды для подтверждения
const ADMIN_SECRET_CODE = '0000' // Заглушка для регистрации администратора
const CHEF_SECRET_CODE = '2222' // Заглушка для регистрации повара
const STUDENT_VERIFICATION_CODE = '1111' // Заглушка для подтверждения студентов

// Check authentication
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user })
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, className, position, role, secretCode, verificationCode } = req.body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' })
    }

    // Check verification code for students
    if (role === 'student') {
      if (!verificationCode) {
        return res.status(400).json({ error: 'Введите код подтверждения' })
      }
      
      // Проверяем код из временного хранилища
      const storedData = verificationCodes.get(email)
      
      if (!storedData) {
        return res.status(403).json({ error: 'Код не найден. Запросите новый код подтверждения' })
      }
      
      if (Date.now() > storedData.expiresAt) {
        verificationCodes.delete(email)
        return res.status(403).json({ error: 'Код истёк. Запросите новый код подтверждения' })
      }
      
      if (storedData.code !== verificationCode) {
        return res.status(403).json({ error: 'Неверный код подтверждения' })
      }
      
      // Код верный - удаляем его
      verificationCodes.delete(email)
    }

    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Введите корректный email адрес' })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' })
    }

    // Validate role-specific fields
    if (role === 'student') {
      if (!className) {
        return res.status(400).json({ error: 'Укажите класс' })
      }
      // Validate class format (1-11 grade with Russian letter)
      const classRegex = /^([1-9]|1[0-1])[А-Яа-я]$/
      if (!validateClassName(className) || !classRegex.test(className)) {
        return res.status(400).json({ error: 'Класс должен быть в формате: 1А, 5Б, 11В (от 1 до 11 класса)' })
      }
    }

    if (role === 'chef' || role === 'admin') {
      if (!position) {
        return res.status(400).json({ error: 'Укажите должность' })
      }
      if (!validatePosition(position)) {
        return res.status(400).json({ error: 'Должность должна содержать от 2 до 50 символов' })
      }
      
      // Check secret code for admin and chef
      if (role === 'admin' && secretCode !== ADMIN_SECRET_CODE) {
        return res.status(403).json({ error: 'Неверный код подтверждения администратора' })
      }
      if (role === 'chef' && secretCode !== CHEF_SECRET_CODE) {
        return res.status(403).json({ error: 'Неверный код подтверждения повара' })
      }
    }

    const formattedPhone = phone || null

    // Check if email exists
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = uuidv4()
    await runQuery(`
      INSERT INTO users (id, email, password, first_name, last_name, phone, class_name, position, role, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, email, hashedPassword, firstName, lastName, formattedPhone, className || null, position || null, role, role === 'student' ? 1000 : 0])

    // Set session
    req.session.user = {
      id: userId,
      email,
      firstName,
      lastName,
      phone: formattedPhone,
      className,
      position,
      role,
      balance: role === 'student' ? 1000 : 0
    }

    res.json({ user: req.session.user })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Ошибка регистрации' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' })
    }

    // Find user
    const user = await getQuery('SELECT * FROM users WHERE email = ? AND role = ?', [email, role])
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      className: user.class_name,
      position: user.position,
      role: user.role,
      balance: parseFloat(user.balance) || 0
    }

    res.json({ user: req.session.user })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка входа' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка выхода' })
    }
    res.json({ message: 'Logged out successfully' })
  })
})

// Top up balance
router.post('/topup', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Только студенты могут пополнять баланс' })
    }

    const { amount } = req.body
    const amountNum = parseFloat(amount)

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть больше 0' })
    }

    if (amountNum > 10000) {
      return res.status(400).json({ error: 'Максимальная сумма пополнения: 10000 ₽' })
    }

    // Get current balance
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [req.session.user.id])
    const newBalance = parseFloat(user.balance || 0) + amountNum

    // Update balance
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.session.user.id])

    // Update session
    req.session.user.balance = newBalance

    res.json({ 
      message: 'Баланс успешно пополнен',
      newBalance
    })
  } catch (error) {
    console.error('Top up error:', error)
    res.status(500).json({ error: 'Ошибка пополнения баланса' })
  }
})

// Временное хранилище кодов подтверждения (в продакшене использовать Redis или БД)
const verificationCodes = new Map()

// Временное хранилище кодов сброса пароля
const passwordResetCodes = new Map()

// Генерация кода подтверждения
router.post('/send-verification-code', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' })
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Введите корректный email адрес' })
    }

    // Проверяем, не зарегистрирован ли уже этот email
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ error: 'Этот email уже зарегистрирован' })
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Сохраняем код с временем истечения (10 минут)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 минут
    })

    console.log(`📧 Попытка отправки кода на ${email}`)
    console.log(`🔑 Код: ${code}`)

    // Отправляем код на email
    try {
      await sendVerificationCode(email, code)
      console.log(`✅ Verification code sent to ${email}`)
      
      res.json({ 
        success: true, 
        message: 'Код подтверждения отправлен на ваш email'
      })
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message)
      console.error('Полная ошибка:', emailError)
      
      // Удаляем код если не удалось отправить
      verificationCodes.delete(email)
      
      res.status(500).json({ 
        error: 'Не удалось отправить код на email. Попробуйте позже или используйте тестовый аккаунт (student@test.com / test123).',
        details: emailError.message
      })
    }

  } catch (error) {
    console.error('❌ Error sending verification code:', error)
    res.status(500).json({ error: 'Ошибка отправки кода подтверждения' })
  }
})

// Проверка кода подтверждения
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email и код обязательны' })
    }

    const storedData = verificationCodes.get(email)

    if (!storedData) {
      return res.status(400).json({ error: 'Код не найден. Запросите новый код' })
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email)
      return res.status(400).json({ error: 'Код истёк. Запросите новый код' })
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Неверный код подтверждения' })
    }

    // Код верный - удаляем его
    verificationCodes.delete(email)

    res.json({ 
      success: true, 
      message: 'Код подтверждён успешно' 
    })

  } catch (error) {
    console.error('Error verifying code:', error)
    res.status(500).json({ error: 'Ошибка проверки кода' })
  }
})

// Запрос на сброс пароля (отправка кода на email)
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email, role } = req.body

    if (!email || !role) {
      return res.status(400).json({ error: 'Email и роль обязательны' })
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Введите корректный email адрес' })
    }

    // Проверяем, существует ли пользователь
    const user = await getQuery('SELECT id, first_name FROM users WHERE email = ? AND role = ?', [email, role])
    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' })
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Сохраняем код с временем истечения (15 минут)
    passwordResetCodes.set(email, {
      code,
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 минут
    })

    // Отправляем код на email
    try {
      await sendPasswordResetCode(email, code)
      console.log(`✅ Password reset code sent to ${email}`)
      
      res.json({ 
        success: true, 
        message: 'Код для сброса пароля отправлен на ваш email'
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Удаляем код, если не удалось отправить email
      passwordResetCodes.delete(email)
      res.status(500).json({ 
        error: 'Не удалось отправить код на email. Проверьте адрес и попробуйте снова.' 
      })
    }

  } catch (error) {
    console.error('Error requesting password reset:', error)
    res.status(500).json({ error: 'Ошибка запроса сброса пароля' })
  }
})

// Сброс пароля с кодом
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' })
    }

    const storedData = passwordResetCodes.get(email)

    if (!storedData) {
      return res.status(400).json({ error: 'Код не найден. Запросите новый код сброса пароля' })
    }

    if (Date.now() > storedData.expiresAt) {
      passwordResetCodes.delete(email)
      return res.status(400).json({ error: 'Код истёк. Запросите новый код сброса пароля' })
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Неверный код сброса пароля' })
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Обновляем пароль в базе данных
    await runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, storedData.userId])

    // Удаляем код
    passwordResetCodes.delete(email)

    res.json({ 
      success: true, 
      message: 'Пароль успешно изменён' 
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'Ошибка сброса пароля' })
  }
})

// Создание запроса на сброс пароля через администрацию
router.post('/request-admin-password-reset', async (req, res) => {
  try {
    const { email, role, reason } = req.body

    if (!email || !role || !reason) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    // Проверяем, существует ли пользователь
    const user = await getQuery('SELECT id, first_name, last_name FROM users WHERE email = ? AND role = ?', [email, role])
    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' })
    }

    // Создаём запрос на сброс пароля
    const requestId = uuidv4()
    await runQuery(`
      INSERT INTO password_reset_requests (id, user_id, email, role, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `, [requestId, user.id, email, role, reason])

    res.json({ 
      success: true, 
      message: 'Запрос на сброс пароля отправлен администрации. Ожидайте ответа.',
      requestId
    })

  } catch (error) {
    console.error('Error creating admin password reset request:', error)
    res.status(500).json({ error: 'Ошибка создания запроса' })
  }
})

export default router
