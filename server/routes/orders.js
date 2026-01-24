import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../database.js'

const router = express.Router()

// Get user orders
router.get('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const orders = await allQuery(`
      SELECT o.*, m.name as menu_name, m.price, m.meal_type
      FROM orders o
      JOIN menu m ON o.menu_id = m.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.session.user.id])

    const formattedOrders = orders.map(order => ({
      id: order.id,
      menuId: order.menu_id,
      menuName: order.menu_name,
      price: order.price,
      mealType: order.meal_type,
      status: order.status,
      createdAt: order.created_at
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Ошибка получения заказов' })
  }
})

// Create order
router.post('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { menuId } = req.body

    if (!menuId) {
      return res.status(400).json({ error: 'Menu ID is required' })
    }

    // Get menu item
    const menuItem = await getQuery('SELECT * FROM menu WHERE id = ?', [menuId])
    if (!menuItem) {
      return res.status(404).json({ error: 'Блюдо не найдено' })
    }

    // Get user balance
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [req.session.user.id])
    if (user.balance < menuItem.price) {
      return res.status(400).json({ error: 'Недостаточно средств на балансе' })
    }

    // Create order
    const orderId = uuidv4()
    await runQuery(`
      INSERT INTO orders (id, user_id, menu_id, status)
      VALUES (?, ?, ?, ?)
    `, [orderId, req.session.user.id, menuId, 'оплачен'])

    // Update balance
    const newBalance = user.balance - menuItem.price
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.session.user.id])

    // Update session
    req.session.user.balance = newBalance

    // Create issued meal record
    const issuedMealId = uuidv4()
    const today = new Date().toISOString().split('T')[0]
    await runQuery(`
      INSERT INTO issued_meals (id, user_id, menu_id, issue_date, meal_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [issuedMealId, req.session.user.id, menuId, today, menuItem.meal_type, 'ожидает выдачи'])

    res.json({ 
      message: 'Заказ создан успешно',
      orderId,
      newBalance
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Ошибка создания заказа' })
  }
})

// Get issued meals (for pickup)
router.get('/issued-meals', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const issuedMeals = await allQuery(`
      SELECT im.*, m.name as menu_name, m.meal_type
      FROM issued_meals im
      JOIN menu m ON im.menu_id = m.id
      WHERE im.user_id = ?
      ORDER BY im.created_at DESC
    `, [req.session.user.id])

    const formattedMeals = issuedMeals.map(meal => ({
      id: meal.id,
      menuId: meal.menu_id,
      menuName: meal.menu_name,
      mealType: meal.meal_type,
      issueDate: meal.issue_date,
      status: meal.status,
      issuedBy: meal.issued_by,
      createdAt: meal.created_at
    }))

    res.json(formattedMeals)
  } catch (error) {
    console.error('Get issued meals error:', error)
    res.status(500).json({ error: 'Ошибка получения выданных блюд' })
  }
})

// Mark meal as received
router.put('/issued-meals/:mealId/receive', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { mealId } = req.params

    // Check if meal exists and belongs to user
    const meal = await getQuery(
      'SELECT * FROM issued_meals WHERE id = ? AND user_id = ?',
      [mealId, req.session.user.id]
    )

    if (!meal) {
      return res.status(404).json({ error: 'Заказ не найден' })
    }

    if (meal.status === 'получен') {
      return res.status(400).json({ error: 'Заказ уже отмечен как полученный' })
    }

    // Update status
    await runQuery(
      'UPDATE issued_meals SET status = ? WHERE id = ?',
      ['получен', mealId]
    )

    res.json({ message: 'Заказ отмечен как полученный' })
  } catch (error) {
    console.error('Mark meal received error:', error)
    res.status(500).json({ error: 'Ошибка отметки получения' })
  }
})

export default router
