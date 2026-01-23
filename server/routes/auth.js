import express from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery } from '../database.js'
import { validatePhone, formatPhone, validateClassName, validatePosition } from '../utils/phone.js'

const router = express.Router()

// Секретный код для подтверждения администраторов и поваров
const ADMIN_SECRET_CODE = 'ADMIN2024'
const CHEF_SECRET_CODE = 'CHEF2024'

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
    const { email, password, firstName, lastName, phone, className, position, role, secretCode } = req.body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !role) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' })
    }

    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Введите корректный email адрес' })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' })
    }

    // Validate phone
    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Номер телефона должен содержать от 10 до 15 цифр' })
    }

    // Validate role-specific fields
    if (role === 'student') {
      if (!className) {
        return res.status(400).json({ error: 'Укажите класс' })
      }
      if (!validateClassName(className)) {
        return res.status(400).json({ error: 'Класс должен быть в формате: 10А, 11Б (1-5 символов)' })
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

    const formattedPhone = formatPhone(phone)

    // Check if email exists
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' })
    }

    // Check if phone exists
    const existingPhone = await getQuery('SELECT id FROM users WHERE phone = ?', [formattedPhone])
    if (existingPhone) {
      return res.status(400).json({ error: 'Пользователь с таким номером телефона уже зарегистрирован' })
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
      balance: user.balance
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

export default router
