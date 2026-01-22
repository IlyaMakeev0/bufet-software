import express from 'express'
import database from '../database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Получить остатки
router.get('/', authenticateToken, requireRole('cook', 'admin'), (req, res) => {
  try {
    const inventory = database.prepare('SELECT * FROM inventory').all()
    res.json(inventory)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Обновить количество
router.patch('/:id', authenticateToken, requireRole('cook'), (req, res) => {
  try {
    const { quantity } = req.body
    database.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(quantity, req.params.id)
    res.json({ message: 'Остатки обновлены' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
