import express from 'express'
import database from '../database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Создать отзыв
router.post('/', authenticateToken, (req, res) => {
  try {
    const { menu_item_id, rating, comment } = req.body
    
    const result = database.prepare(
      'INSERT INTO reviews (user_id, menu_item_id, rating, comment) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, menu_item_id, rating, comment)
    
    res.status(201).json({ id: result.lastInsertRowid })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Получить отзывы пользователя
router.get('/my', authenticateToken, (req, res) => {
  try {
    const reviews = database.prepare(`
      SELECT r.*, m.name as dish_name
      FROM reviews r
      JOIN menu_items m ON r.menu_item_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(req.user.id)
    
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
