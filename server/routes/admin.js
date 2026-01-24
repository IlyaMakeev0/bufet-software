import express from 'express'
import { getQuery, allQuery } from '../database.js'

const router = express.Router()

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const today = new Date().toISOString().split('T')[0]

    // Total users
    const usersCount = await getQuery('SELECT COUNT(*) as count FROM users')
    
    // Total orders
    const ordersCount = await getQuery('SELECT COUNT(*) as count FROM orders')
    
    // Total revenue
    const revenue = await getQuery(`
      SELECT SUM(m.price) as total
      FROM orders o
      JOIN menu m ON o.menu_id = m.id
      WHERE o.status = 'оплачен'
    `)
    
    // Today's meals
    const todayMeals = await getQuery(`
      SELECT COUNT(*) as count
      FROM issued_meals
      WHERE issue_date = ? AND status = 'выдан'
    `, [today])

    res.json({
      totalUsers: usersCount.count,
      totalOrders: ordersCount.count,
      totalRevenue: revenue.total || 0,
      todayMeals: todayMeals.count
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Ошибка получения статистики' })
  }
})

// Get all users
router.get('/users', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const users = await allQuery(`
      SELECT id, email, first_name, last_name, phone, class_name, position, role, balance, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      className: user.class_name,
      position: user.position,
      role: user.role,
      balance: parseFloat(user.balance) || 0,
      createdAt: user.created_at
    }))

    res.json(formattedUsers)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Ошибка получения пользователей' })
  }
})

// Get recent orders
router.get('/recent-orders', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const orders = await allQuery(`
      SELECT 
        o.*,
        u.first_name || ' ' || u.last_name as student_name,
        m.name as menu_name,
        m.price
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN menu m ON o.menu_id = m.id
      ORDER BY o.created_at DESC
      LIMIT 50
    `)

    const formattedOrders = orders.map(order => ({
      id: order.id,
      studentName: order.student_name,
      menuName: order.menu_name,
      price: parseFloat(order.price) || 0,
      status: order.status,
      createdAt: order.created_at
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error('Get recent orders error:', error)
    res.status(500).json({ error: 'Ошибка получения заказов' })
  }
})

export default router
