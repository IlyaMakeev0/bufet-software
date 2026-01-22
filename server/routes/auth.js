import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import database from '../database.js'

const router = express.Router()

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body

    const existingUser = database.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = database.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, role)

    res.status(201).json({ 
      message: 'Пользователь зарегистрирован',
      userId: result.lastInsertRowid 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Авторизация
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
