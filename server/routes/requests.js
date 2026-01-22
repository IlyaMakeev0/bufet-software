import express from 'express'
import database from '../database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Создать заявку (повар)
router.post('/', authenticateToken, requireRole('cook'), (req, res) => {
  try {
    const { product_name, quantity, unit } = req.body
    
    const result = database.prepare(
      'INSERT INTO purchase_requests (cook_id, product_name, quantity, unit) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, product_name, quantity, unit)
    
    res.status(201).json({ id: result.lastInsertRowid })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Получить заявки
router.get('/', authenticateToken, (req, res) => {
  try {
    let requests
    if (req.user.role === 'cook') {
      requests = database.prepare('SELECT * FROM purchase_requests WHERE cook_id = ?').all(req.user.id)
    } else {
      requests = database.prepare(`
        SELECT pr.*, u.name as cook_name
        FROM purchase_requests pr
        JOIN users u ON pr.cook_id = u.id
        ORDER BY pr.created_at DESC
      `).all()
    }
    res.json(requests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Одобрить/отклонить заявку (админ)
router.patch('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { status } = req.body
    database.prepare('UPDATE purchase_requests SET status = ? WHERE id = ?').run(status, req.params.id)
    res.json({ message: 'Статус заявки обновлен' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
