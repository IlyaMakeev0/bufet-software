import express from 'express'
import database from '../database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Получить заказы (для повара)
router.get('/', authenticateToken, requireRole('cook', 'admin'), (req, res) => {
  try {
    const orders = database.prepare(`
      SELECT o.*, u.name as student_name, m.name as meal_name, m.type as meal_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN menu_items m ON o.menu_item_id = m.id
      ORDER BY o.created_at DESC
    `).all()
    
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Отметить заказ как выданный
router.patch('/:id/complete', authenticateToken, requireRole('cook'), (req, res) => {
  try {
    database.prepare('UPDATE orders SET status = ? WHERE id = ?').run('completed', req.params.id)
    res.json({ message: 'Заказ выдан' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
