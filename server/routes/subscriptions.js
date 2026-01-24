import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../database.js'

const router = express.Router()

// Цены на абонементы
const SUBSCRIPTION_PRICES = {
  'breakfast': {
    7: 700,    // 7 дней - 700₽ (100₽/день)
    14: 1300,  // 14 дней - 1300₽ (93₽/день)
    30: 2500   // 30 дней - 2500₽ (83₽/день)
  },
  'full': {
    7: 2800,   // 7 дней - 2800₽ (400₽/день)
    14: 5200,  // 14 дней - 5200₽ (371₽/день)
    30: 10000  // 30 дней - 10000₽ (333₽/день)
  }
}

// Get user subscriptions
router.get('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const subscriptions = await allQuery(`
      SELECT * FROM subscriptions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.session.user.id])

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      subscriptionType: sub.subscription_type,
      durationDays: sub.duration_days,
      startDate: sub.start_date,
      endDate: sub.end_date,
      totalPrice: sub.total_price,
      status: sub.status,
      createdAt: sub.created_at
    }))

    res.json(formattedSubs)
  } catch (error) {
    console.error('Get subscriptions error:', error)
    res.status(500).json({ error: 'Ошибка получения абонементов' })
  }
})

// Create subscription
router.post('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { subscriptionType, durationDays } = req.body

    if (!subscriptionType || !durationDays) {
      return res.status(400).json({ error: 'Укажите тип и длительность абонемента' })
    }

    // Validate subscription type
    if (!['breakfast', 'full'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Неверный тип абонемента' })
    }

    // Validate duration
    if (![7, 14, 30].includes(durationDays)) {
      return res.status(400).json({ error: 'Неверная длительность абонемента' })
    }

    // Get price
    const totalPrice = SUBSCRIPTION_PRICES[subscriptionType][durationDays]

    // Get user balance
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [req.session.user.id])
    if (user.balance < totalPrice) {
      return res.status(400).json({ error: 'Недостаточно средств на балансе' })
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Create subscription
    const subscriptionId = uuidv4()
    await runQuery(`
      INSERT INTO subscriptions (id, user_id, subscription_type, duration_days, start_date, end_date, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [subscriptionId, req.session.user.id, subscriptionType, durationDays, startDateStr, endDateStr, totalPrice, 'активен'])

    // Update balance (списываем деньги сразу)
    const newBalance = user.balance - totalPrice
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.session.user.id])

    // Update session
    req.session.user.balance = newBalance

    res.json({ 
      message: 'Абонемент создан успешно',
      subscriptionId,
      newBalance,
      subscriptionType,
      durationDays,
      totalPrice,
      startDate: startDateStr,
      endDate: endDateStr
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({ error: 'Ошибка создания абонемента' })
  }
})

export default router
