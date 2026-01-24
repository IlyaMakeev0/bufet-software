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
      price: parseFloat(order.price) || 0,
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
    console.log('=== Create Order Request ===')
    console.log('User:', req.session.user)
    console.log('Body:', req.body)

    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { menuId, hasActiveSubscription } = req.body

    if (!menuId) {
      return res.status(400).json({ error: 'Menu ID is required' })
    }

    console.log('Getting menu item:', menuId)
    // Get menu item
    const menuItem = await getQuery('SELECT * FROM menu WHERE id = ?', [menuId])
    console.log('Menu item:', menuItem)
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Блюдо не найдено' })
    }

    const today = new Date().toISOString().split('T')[0]
    console.log('Today:', today)

    // Проверяем, заказывал ли уже это блюдо по абонементу сегодня
    if (hasActiveSubscription) {
      console.log('Checking existing subscription order...')
      const existingOrder = await getQuery(`
        SELECT o.* FROM orders o
        JOIN menu m ON o.menu_id = m.id
        WHERE o.user_id = ? 
        AND m.meal_type = ? 
        AND DATE(o.created_at) = ?
        AND o.status = 'оплачен по абонементу'
      `, [req.session.user.id, menuItem.meal_type, today])

      if (existingOrder) {
        console.log('Already ordered by subscription')
        return res.status(400).json({ 
          error: `Вы уже заказали ${menuItem.meal_type} по абонементу сегодня. Дополнительные заказы будут платными.`,
          needsPayment: true
        })
      }
    }

    let newBalance = null

    // Если нет активного абонемента или уже заказывал по абонементу, списываем деньги
    if (!hasActiveSubscription) {
      console.log('Processing payment...')
      // Get user balance
      const user = await getQuery('SELECT balance FROM users WHERE id = ?', [req.session.user.id])
      const userBalance = parseFloat(user.balance) || 0
      const itemPrice = parseFloat(menuItem.price) || 0
      console.log('User balance:', userBalance)
      
      if (userBalance < itemPrice) {
        return res.status(400).json({ error: 'Недостаточно средств на балансе' })
      }

      // Update balance
      newBalance = userBalance - itemPrice
      console.log('New balance:', newBalance)
      await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.session.user.id])

      // Update session
      req.session.user.balance = newBalance
    }

    // Create order
    console.log('Creating order...')
    const orderId = uuidv4()
    const orderStatus = hasActiveSubscription ? 'оплачен по абонементу' : 'оплачен'
    await runQuery(`
      INSERT INTO orders (id, user_id, menu_id, status)
      VALUES (?, ?, ?, ?)
    `, [orderId, req.session.user.id, menuId, orderStatus])
    console.log('Order created:', orderId)

    // Create issued meal record
    console.log('Creating issued meal...')
    const issuedMealId = uuidv4()
    await runQuery(`
      INSERT INTO issued_meals (id, user_id, menu_id, issue_date, meal_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [issuedMealId, req.session.user.id, menuId, today, menuItem.meal_type, 'ожидает выдачи'])
    console.log('Issued meal created:', issuedMealId)

    console.log('=== Order Created Successfully ===')
    res.json({ 
      message: hasActiveSubscription ? 'Заказ создан по абонементу' : 'Заказ создан успешно',
      orderId,
      newBalance,
      paidBySubscription: hasActiveSubscription
    })
  } catch (error) {
    console.error('Create order error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Ошибка создания заказа: ' + error.message })
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
