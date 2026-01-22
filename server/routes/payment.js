import express from 'express'
import database from '../database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Создать платеж
router.post('/', authenticateToken, (req, res) => {
  try {
    const { amount, type, meal_type } = req.body
    
    const result = database.prepare(
      'INSERT INTO payments (user_id, amount, type, meal_type) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, amount, type, meal_type)
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      message: 'Оплата прошла успешно' 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// История платежей
router.get('/history', authenticateToken, (req, res) => {
  try {
    const payments = database.prepare(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id)
    
    res.json(payments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
