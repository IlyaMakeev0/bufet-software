import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../database.js'

const router = express.Router()

// Get user subscriptions
router.get('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const subscriptions = await allQuery(`
      SELECT s.*, m.name as menu_name
      FROM subscriptions s
      JOIN menu m ON s.menu_id = m.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [req.session.user.id])

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      menuId: sub.menu_id,
      menuName: sub.menu_name,
      selectedDates: JSON.parse(sub.selected_dates),
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

    const { menuId, selectedDates, startDate, endDate } = req.body

    if (!menuId || !selectedDates || !startDate || !endDate) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    // Get menu item
    const menuItem = await getQuery('SELECT * FROM menu WHERE id = ?', [menuId])
    if (!menuItem) {
      return res.status(404).json({ error: 'Блюдо не найдено' })
    }

    // Calculate total price
    const totalPrice = menuItem.price * selectedDates.length

    // Get user balance
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [req.session.user.id])
    if (user.balance < totalPrice) {
      return res.status(400).json({ error: 'Недостаточно средств на балансе' })
    }

    // Create subscription
    const subscriptionId = uuidv4()
    await runQuery(`
      INSERT INTO subscriptions (id, user_id, menu_id, selected_dates, start_date, end_date, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [subscriptionId, req.session.user.id, menuId, JSON.stringify(selectedDates), startDate, endDate, totalPrice, 'активен'])

    // Update balance
    const newBalance = user.balance - totalPrice
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.session.user.id])

    // Update session
    req.session.user.balance = newBalance

    res.json({ 
      message: 'Абонемент создан успешно',
      subscriptionId,
      newBalance
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({ error: 'Ошибка создания абонемента' })
  }
})

export default router
