import express from 'express'
import database from '../database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Статистика (только админ)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const totalPayments = database.prepare(
      "SELECT SUM(amount) as total FROM payments WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
    ).get()
    
    const todayVisits = database.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')"
    ).get()
    
    const weekVisits = database.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE created_at >= DATE('now', '-7 days')"
    ).get()
    
    const activeSubscriptions = database.prepare(
      "SELECT COUNT(*) as count FROM payments WHERE type = 'subscription' AND created_at >= DATE('now', '-30 days')"
    ).get()
    
    res.json({
      totalPayments: totalPayments.total || 0,
      todayVisits: todayVisits.count,
      weekVisits: weekVisits.count,
      activeSubscriptions: activeSubscriptions.count
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
