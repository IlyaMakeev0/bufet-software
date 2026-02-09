import express from 'express'
import { getQuery, allQuery, runQuery } from '../database.js'
import { v4 as uuidv4 } from 'uuid'

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
      totalUsers: usersCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue: parseFloat(revenue.total) || 0,
      todayMeals: todayMeals.count || 0
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

// Get all purchase requests
router.get('/purchase-requests', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const requests = await allQuery(`
      SELECT 
        pr.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM purchase_requests pr
      JOIN users u ON pr.created_by = u.id
      ORDER BY 
        CASE urgency
          WHEN 'срочная' THEN 1
          WHEN 'высокая' THEN 2
          ELSE 3
        END,
        pr.created_at DESC
    `)

    const formattedRequests = requests.map(req => ({
      id: req.id,
      item: req.item,
      quantity: parseFloat(req.quantity),
      unit: req.unit,
      urgency: req.urgency,
      status: req.status,
      createdByName: req.created_by_name,
      createdAt: req.created_at
    }))

    res.json(formattedRequests)
  } catch (error) {
    console.error('Get purchase requests error:', error)
    res.status(500).json({ error: 'Ошибка получения заявок' })
  }
})

// Update purchase request status
router.put('/purchase-requests/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' })
    }

    // Get purchase request details
    const purchaseRequest = await getQuery(`
      SELECT * FROM purchase_requests WHERE id = ?
    `, [id])

    if (!purchaseRequest) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }

    // Update status
    await runQuery(`
      UPDATE purchase_requests 
      SET status = ?
      WHERE id = ?
    `, [status, id])

    // If approved, create notification for chef
    if (status === 'одобрена') {
      const notificationId = uuidv4()
      await runQuery(`
        INSERT INTO notifications (id, user_id, type, title, message, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        notificationId,
        purchaseRequest.created_by,
        'purchase_approved',
        'Заявка на закупку одобрена',
        `Ваша заявка на закупку "${purchaseRequest.item}" (${purchaseRequest.quantity} ${purchaseRequest.unit}) одобрена. Пожалуйста, пополните склад.`
      ])
      
      console.log(`✅ Notification created for chef ${purchaseRequest.created_by} about approved purchase request`)
    }

    res.json({ message: 'Статус заявки обновлен' })
  } catch (error) {
    console.error('Update purchase request error:', error)
    res.status(500).json({ error: 'Ошибка обновления заявки' })
  }
})

// Get all menu requests
router.get('/menu-requests', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const requests = await allQuery(`
      SELECT 
        mr.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM menu_requests mr
      JOIN users u ON mr.created_by = u.id
      ORDER BY 
        CASE status
          WHEN 'ожидает' THEN 1
          WHEN 'одобрена' THEN 2
          ELSE 3
        END,
        mr.created_at DESC
    `)

    const formattedRequests = requests.map(req => ({
      id: req.id,
      name: req.name,
      description: req.description,
      price: parseFloat(req.price),
      mealType: req.meal_type,
      ingredients: req.ingredients,
      status: req.status,
      adminComment: req.admin_comment,
      createdByName: req.created_by_name,
      createdAt: req.created_at,
      reviewedAt: req.reviewed_at
    }))

    res.json(formattedRequests)
  } catch (error) {
    console.error('Get menu requests error:', error)
    res.status(500).json({ error: 'Ошибка получения заявок' })
  }
})

// Approve menu request
router.post('/menu-requests/:id/approve', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { adminComment, startDate, endDate } = req.body

    // Get request details
    const request = await getQuery(`
      SELECT * FROM menu_requests WHERE id = ?
    `, [id])

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }

    // Create menu items for date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const ingredients = request.ingredients // JSONB already parsed by PostgreSQL

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const menuId = uuidv4()

      // Add menu item
      await runQuery(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [menuId, dateStr, request.name, request.description, request.price, request.meal_type])

      // Add ingredients
      for (const ingredient of ingredients) {
        await runQuery(`
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
          VALUES (?, ?, ?, ?, ?)
        `, [uuidv4(), menuId, ingredient.name, ingredient.quantity, ingredient.unit])
      }
    }

    // Update request status
    await runQuery(`
      UPDATE menu_requests 
      SET status = 'одобрена', 
          admin_comment = ?,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminComment, req.session.user.id, id])

    res.json({ message: 'Заявка одобрена, блюдо добавлено в меню' })
  } catch (error) {
    console.error('Approve menu request error:', error)
    res.status(500).json({ error: 'Ошибка одобрения заявки' })
  }
})

// Reject menu request
router.post('/menu-requests/:id/reject', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { adminComment } = req.body

    await runQuery(`
      UPDATE menu_requests 
      SET status = 'отклонена',
          admin_comment = ?,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminComment, req.session.user.id, id])

    res.json({ message: 'Заявка отклонена' })
  } catch (error) {
    console.error('Reject menu request error:', error)
    res.status(500).json({ error: 'Ошибка отклонения заявки' })
  }
})

// Get reports
router.get('/reports', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { startDate, endDate } = req.query

    // Revenue report
    const revenue = await getQuery(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(m.price) as total_revenue
      FROM orders o
      JOIN menu m ON o.menu_id = m.id
      WHERE o.status = 'оплачен'
      ${startDate ? 'AND DATE(o.created_at) >= ?' : ''}
      ${endDate ? 'AND DATE(o.created_at) <= ?' : ''}
    `, [startDate, endDate].filter(Boolean))

    // Meals by type
    const mealsByType = await allQuery(`
      SELECT 
        m.meal_type,
        COUNT(*) as count,
        SUM(m.price) as revenue
      FROM issued_meals im
      JOIN menu m ON im.menu_id = m.id
      WHERE im.status = 'выдан'
      ${startDate ? 'AND DATE(im.created_at) >= ?' : ''}
      ${endDate ? 'AND DATE(im.created_at) <= ?' : ''}
      GROUP BY m.meal_type
    `, [startDate, endDate].filter(Boolean))

    // Top dishes
    const topDishes = await allQuery(`
      SELECT 
        m.name,
        m.meal_type,
        COUNT(*) as orders_count,
        SUM(m.price) as revenue
      FROM orders o
      JOIN menu m ON o.menu_id = m.id
      WHERE o.status = 'оплачен'
      ${startDate ? 'AND DATE(o.created_at) >= ?' : ''}
      ${endDate ? 'AND DATE(o.created_at) <= ?' : ''}
      GROUP BY m.name, m.meal_type
      ORDER BY orders_count DESC
      LIMIT 10
    `, [startDate, endDate].filter(Boolean))

    res.json({
      revenue: {
        totalOrders: revenue.total_orders || 0,
        totalRevenue: parseFloat(revenue.total_revenue) || 0
      },
      mealsByType: mealsByType.map(m => ({
        mealType: m.meal_type,
        count: m.count || 0,
        revenue: parseFloat(m.revenue) || 0
      })),
      topDishes: topDishes.map(d => ({
        name: d.name,
        mealType: d.meal_type,
        ordersCount: d.orders_count || 0,
        revenue: parseFloat(d.revenue) || 0
      }))
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ error: 'Ошибка получения отчетов' })
  }
})

// Update user data (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { firstName, lastName, email, phone, className, balance, password } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Имя, фамилия и email обязательны' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Неверный формат email' })
    }

    // Check if user exists
    const existingUser = await getQuery('SELECT id, role FROM users WHERE id = ?', [id])
    if (!existingUser) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Check if email is already taken by another user
    const emailCheck = await getQuery('SELECT id FROM users WHERE email = ? AND id != ?', [email, id])
    if (emailCheck) {
      return res.status(400).json({ error: 'Email уже используется другим пользователем' })
    }

    // Build update query
    let updateQuery = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?
    `
    let params = [firstName.trim(), lastName.trim(), email.trim()]

    // Add phone if provided
    if (phone !== undefined && phone !== null) {
      updateQuery += ', phone = ?'
      params.push(phone.trim() || null)
    }

    // Add className if provided
    if (className !== undefined && className !== null) {
      updateQuery += ', class_name = ?'
      params.push(className.trim() || null)
    }

    // Add balance if provided and user is student
    if (balance !== undefined && balance !== null && existingUser.role === 'student') {
      const balanceNum = parseFloat(balance)
      if (isNaN(balanceNum) || balanceNum < 0) {
        return res.status(400).json({ error: 'Неверное значение баланса' })
      }
      updateQuery += ', balance = ?'
      params.push(balanceNum)
    }

    // Add password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' })
      }
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.default.hash(password, 10)
      updateQuery += ', password = ?'
      params.push(hashedPassword)
    }

    updateQuery += ' WHERE id = ?'
    params.push(id)

    await runQuery(updateQuery, params)

    console.log(`✅ Admin ${req.session.user.email} updated user ${id}`)
    res.json({ message: 'Данные пользователя обновлены' })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Ошибка обновления данных пользователя' })
  }
})

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    // Don't allow deleting yourself
    if (id === req.session.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт' })
    }

    // Check if user exists
    const user = await getQuery('SELECT id, email, role FROM users WHERE id = ?', [id])
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Delete user
    await runQuery('DELETE FROM users WHERE id = ?', [id])

    console.log(`✅ Admin ${req.session.user.email} deleted user ${user.email} (${user.role})`)
    res.json({ message: 'Пользователь удален' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Ошибка удаления пользователя' })
  }
})

export default router
