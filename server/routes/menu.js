import express from 'express'
import database from '../database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Получить меню
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = database.prepare('SELECT * FROM menu_items WHERE available = 1').all()
    
    const menu = {
      breakfast: items.filter(item => item.type === 'breakfast'),
      lunch: items.filter(item => item.type === 'lunch')
    }
    
    res.json(menu)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Добавить блюдо (только админ)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, type, price, allergens } = req.body
    
    const result = database.prepare(
      'INSERT INTO menu_items (name, type, price, allergens) VALUES (?, ?, ?, ?)'
    ).run(name, type, price, allergens || '')
    
    res.status(201).json({ id: result.lastInsertRowid })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
