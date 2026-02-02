import express from 'express'
import { runQuery, allQuery, getQuery } from '../database.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Get pending meals
router.get('/pending-meals', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const today = new Date().toISOString().split('T')[0]

    const meals = await allQuery(`
      SELECT 
        im.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.class_name,
        u.allergies,
        u.food_preferences,
        m.name as menu_name,
        m.meal_type
      FROM issued_meals im
      JOIN users u ON im.user_id = u.id
      JOIN menu m ON im.menu_id = m.id
      WHERE im.status = 'ожидает выдачи'
      AND im.issue_date = ?
      ORDER BY im.created_at
    `, [today])

    const formattedMeals = meals.map(meal => ({
      id: meal.id,
      studentName: meal.student_name,
      className: meal.class_name,
      allergies: meal.allergies,
      foodPreferences: meal.food_preferences,
      menuName: meal.menu_name,
      mealType: meal.meal_type,
      issueDate: meal.issue_date,
      status: meal.status
    }))

    res.json(formattedMeals)
  } catch (error) {
    console.error('Get pending meals error:', error)
    res.status(500).json({ error: 'Ошибка получения списка блюд' })
  }
})

// Get issued today
router.get('/issued-today', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const today = new Date().toISOString().split('T')[0]

    const meals = await allQuery(`
      SELECT 
        im.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.class_name,
        m.name as menu_name,
        m.meal_type
      FROM issued_meals im
      JOIN users u ON im.user_id = u.id
      JOIN menu m ON im.menu_id = m.id
      WHERE im.status = 'выдан'
      AND im.issue_date = ?
      ORDER BY im.created_at DESC
    `, [today])

    const formattedMeals = meals.map(meal => ({
      id: meal.id,
      studentName: meal.student_name,
      className: meal.class_name,
      menuName: meal.menu_name,
      mealType: meal.meal_type,
      issueDate: meal.issue_date,
      issuedAt: meal.created_at
    }))

    res.json(formattedMeals)
  } catch (error) {
    console.error('Get issued meals error:', error)
    res.status(500).json({ error: 'Ошибка получения списка выданных блюд' })
  }
})

// Issue meal
router.post('/issue-meal', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { mealId } = req.body

    if (!mealId) {
      return res.status(400).json({ error: 'Meal ID is required' })
    }

    // Get meal info
    const meal = await getQuery(`
      SELECT menu_id FROM issued_meals WHERE id = ?
    `, [mealId])

    if (!meal) {
      return res.status(404).json({ error: 'Блюдо не найдено' })
    }

    // Get ingredients for this menu item
    const ingredients = await allQuery(`
      SELECT ingredient_name, quantity, unit
      FROM menu_ingredients
      WHERE menu_id = ?
    `, [meal.menu_id])

    // Check if we have enough ingredients
    const insufficientIngredients = []
    for (const ingredient of ingredients) {
      const inventoryItem = await getQuery(`
        SELECT id, name, quantity, unit
        FROM inventory
        WHERE LOWER(name) = LOWER(?)
      `, [ingredient.ingredient_name])

      if (!inventoryItem) {
        insufficientIngredients.push(`${ingredient.ingredient_name} (не найден на складе)`)
      } else if (inventoryItem.quantity < ingredient.quantity) {
        insufficientIngredients.push(`${ingredient.ingredient_name} (нужно ${ingredient.quantity} ${ingredient.unit}, есть ${inventoryItem.quantity} ${inventoryItem.unit})`)
      }
    }

    if (insufficientIngredients.length > 0) {
      return res.status(400).json({ 
        error: 'Недостаточно ингредиентов на складе',
        details: insufficientIngredients
      })
    }

    // Deduct ingredients from inventory
    for (const ingredient of ingredients) {
      const inventoryItem = await getQuery(`
        SELECT id, quantity
        FROM inventory
        WHERE LOWER(name) = LOWER(?)
      `, [ingredient.ingredient_name])

      const newQuantity = inventoryItem.quantity - ingredient.quantity

      // Update inventory
      await runQuery(`
        UPDATE inventory 
        SET quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newQuantity, inventoryItem.id])

      // Log the change
      await runQuery(`
        INSERT INTO inventory_log (id, inventory_id, action, quantity_change, quantity_before, quantity_after, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        inventoryItem.id,
        'списание',
        -ingredient.quantity,
        inventoryItem.quantity,
        newQuantity,
        `Выдача блюда (issued_meal: ${mealId})`,
        req.session.user.id
      ])
    }

    // Update meal status
    await runQuery(`
      UPDATE issued_meals 
      SET status = 'выдан', issued_by = ?
      WHERE id = ?
    `, [req.session.user.id, mealId])

    res.json({ message: 'Блюдо выдано успешно, ингредиенты списаны' })
  } catch (error) {
    console.error('Issue meal error:', error)
    res.status(500).json({ error: 'Ошибка выдачи блюда' })
  }
})

// Get inventory
router.get('/inventory', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const inventory = await allQuery(`
      SELECT * FROM inventory
      ORDER BY name
    `)

    res.json(inventory)
  } catch (error) {
    console.error('Get inventory error:', error)
    res.status(500).json({ error: 'Ошибка получения инвентаря' })
  }
})

// Add inventory item
router.post('/inventory', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { name, quantity, unit, minQuantity } = req.body

    if (!name || !quantity || !unit) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    const id = uuidv4()
    await runQuery(`
      INSERT INTO inventory (id, name, quantity, unit, min_quantity)
      VALUES (?, ?, ?, ?, ?)
    `, [id, name, parseFloat(quantity), unit, parseFloat(minQuantity || 10)])

    // Log the addition
    await runQuery(`
      INSERT INTO inventory_log (id, inventory_id, action, quantity_change, quantity_before, quantity_after, reason, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      id,
      'пополнение',
      parseFloat(quantity),
      0,
      parseFloat(quantity),
      'Добавление нового продукта',
      req.session.user.id
    ])

    res.json({ message: 'Продукт добавлен', id })
  } catch (error) {
    console.error('Add inventory error:', error)
    res.status(500).json({ error: 'Ошибка добавления продукта' })
  }
})

// Update inventory quantity
router.put('/inventory/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { quantity } = req.body

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Количество обязательно' })
    }

    // Get current quantity
    const current = await getQuery(`
      SELECT quantity FROM inventory WHERE id = ?
    `, [id])

    if (!current) {
      return res.status(404).json({ error: 'Продукт не найден' })
    }

    const newQuantity = parseFloat(quantity)
    const change = newQuantity - current.quantity

    await runQuery(`
      UPDATE inventory 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newQuantity, id])

    // Log the change
    await runQuery(`
      INSERT INTO inventory_log (id, inventory_id, action, quantity_change, quantity_before, quantity_after, reason, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      id,
      change > 0 ? 'пополнение' : 'списание',
      change,
      current.quantity,
      newQuantity,
      'Ручное изменение количества',
      req.session.user.id
    ])

    res.json({ message: 'Количество обновлено' })
  } catch (error) {
    console.error('Update inventory error:', error)
    res.status(500).json({ error: 'Ошибка обновления' })
  }
})

// Delete inventory item
router.delete('/inventory/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    await runQuery(`
      DELETE FROM inventory WHERE id = ?
    `, [id])

    res.json({ message: 'Продукт удален' })
  } catch (error) {
    console.error('Delete inventory error:', error)
    res.status(500).json({ error: 'Ошибка удаления' })
  }
})

// Get purchase requests
router.get('/purchase-requests', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const requests = await allQuery(`
      SELECT * FROM purchase_requests
      ORDER BY 
        CASE urgency
          WHEN 'срочная' THEN 1
          WHEN 'высокая' THEN 2
          ELSE 3
        END,
        created_at DESC
    `)

    res.json(requests)
  } catch (error) {
    console.error('Get purchase requests error:', error)
    res.status(500).json({ error: 'Ошибка получения заявок' })
  }
})

// Create purchase request
router.post('/purchase-requests', async (req, res) => {
  try {
    console.log('=== Create Purchase Request ===')
    console.log('User:', req.session.user)
    console.log('Body:', req.body)

    if (!req.session.user || req.session.user.role !== 'chef') {
      console.log('Unauthorized: not a chef')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { item, quantity, unit, urgency } = req.body

    if (!item || !quantity || !unit || !urgency) {
      console.log('Missing fields')
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    console.log('Creating purchase request...')
    const id = uuidv4()
    await runQuery(`
      INSERT INTO purchase_requests (id, item, quantity, unit, urgency, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, item, parseFloat(quantity), unit, urgency, req.session.user.id])

    console.log('Purchase request created:', id)
    res.json({ message: 'Заявка создана', id })
  } catch (error) {
    console.error('Create purchase request error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Ошибка создания заявки: ' + error.message })
  }
})

// Get all students
router.get('/students', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const students = await allQuery(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        class_name,
        allergies,
        food_preferences
      FROM users
      WHERE role = 'student'
      ORDER BY class_name, last_name, first_name
    `)

    const formattedStudents = students.map(student => ({
      id: student.id,
      email: student.email,
      firstName: student.first_name,
      lastName: student.last_name,
      phone: student.phone,
      className: student.class_name,
      allergies: student.allergies,
      foodPreferences: student.food_preferences
    }))

    res.json(formattedStudents)
  } catch (error) {
    console.error('Get students error:', error)
    res.status(500).json({ error: 'Ошибка получения списка учеников' })
  }
})

// Get menu ingredients
router.get('/menu/:menuId/ingredients', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { menuId } = req.params

    const ingredients = await allQuery(`
      SELECT * FROM menu_ingredients
      WHERE menu_id = ?
      ORDER BY ingredient_name
    `, [menuId])

    res.json(ingredients)
  } catch (error) {
    console.error('Get menu ingredients error:', error)
    res.status(500).json({ error: 'Ошибка получения ингредиентов' })
  }
})

// Get inventory log
router.get('/inventory-log', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { inventoryId, limit = 50 } = req.query

    let sql = `
      SELECT 
        il.*,
        i.name as inventory_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM inventory_log il
      JOIN inventory i ON il.inventory_id = i.id
      LEFT JOIN users u ON il.created_by = u.id
    `
    const params = []

    if (inventoryId) {
      sql += ' WHERE il.inventory_id = ?'
      params.push(inventoryId)
    }

    sql += ' ORDER BY il.created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    const logs = await allQuery(sql, params)

    const formattedLogs = logs.map(log => ({
      id: log.id,
      inventoryId: log.inventory_id,
      inventoryName: log.inventory_name,
      action: log.action,
      quantityChange: parseFloat(log.quantity_change),
      quantityBefore: parseFloat(log.quantity_before),
      quantityAfter: parseFloat(log.quantity_after),
      reason: log.reason,
      createdBy: log.created_by_name,
      createdAt: log.created_at
    }))

    res.json(formattedLogs)
  } catch (error) {
    console.error('Get inventory log error:', error)
    res.status(500).json({ error: 'Ошибка получения истории склада' })
  }
})

// Get low stock items
router.get('/inventory/low-stock', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const lowStock = await allQuery(`
      SELECT * FROM inventory
      WHERE quantity <= min_quantity
      ORDER BY (quantity / min_quantity), name
    `)

    res.json(lowStock)
  } catch (error) {
    console.error('Get low stock error:', error)
    res.status(500).json({ error: 'Ошибка получения списка' })
  }
})

// Get menu requests
router.get('/menu-requests', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const requests = await allQuery(`
      SELECT 
        mr.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM menu_requests mr
      JOIN users u ON mr.created_by = u.id
      WHERE mr.created_by = ?
      ORDER BY mr.created_at DESC
    `, [req.session.user.id])

    const formattedRequests = requests.map(req => {
      // Parse ingredients JSON
      let ingredients = []
      try {
        ingredients = typeof req.ingredients === 'string' ? JSON.parse(req.ingredients) : req.ingredients
      } catch (e) {
        console.error('Failed to parse ingredients:', e)
        ingredients = []
      }
      
      return {
        id: req.id,
        name: req.name,
        description: req.description,
        price: parseFloat(req.price),
        mealType: req.meal_type,
        ingredients: ingredients,
        status: req.status,
        adminComment: req.admin_comment,
        createdByName: req.created_by_name,
        createdAt: req.created_at,
        reviewedAt: req.reviewed_at
      }
    })

    res.json(formattedRequests)
  } catch (error) {
    console.error('Get menu requests error:', error)
    res.status(500).json({ error: 'Ошибка получения заявок' })
  }
})

// Create menu request
router.post('/menu-requests', async (req, res) => {
  try {
    console.log('=== Create Menu Request ===')
    console.log('User:', req.session.user)
    console.log('Body:', req.body)

    if (!req.session.user || req.session.user.role !== 'chef') {
      console.log('Unauthorized: not a chef')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { name, description, price, mealType, ingredients } = req.body

    if (!name || !price || !mealType || !ingredients || ingredients.length === 0) {
      console.log('Missing fields')
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    console.log('Creating menu request...')
    const id = uuidv4()
    
    // Convert ingredients array to JSON string
    const ingredientsJson = JSON.stringify(ingredients)
    
    await runQuery(`
      INSERT INTO menu_requests (id, name, description, price, meal_type, ingredients, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name, description || '', parseFloat(price), mealType, ingredientsJson, req.session.user.id])

    console.log('Menu request created:', id)
    res.json({ message: 'Заявка на добавление блюда создана', id })
  } catch (error) {
    console.error('Create menu request error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Ошибка создания заявки: ' + error.message })
  }
})

// Get notifications for chef
router.get('/notifications', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const notifications = await allQuery(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.session.user.id])

    res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Ошибка получения уведомлений' })
  }
})

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    await runQuery(`
      UPDATE notifications 
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `, [id, req.session.user.id])

    res.json({ message: 'Уведомление отмечено как прочитанное' })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({ error: 'Ошибка обновления уведомления' })
  }
})

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'chef') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await runQuery(`
      UPDATE notifications 
      SET is_read = 1
      WHERE user_id = ?
    `, [req.session.user.id])

    res.json({ message: 'Все уведомления отмечены как прочитанные' })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({ error: 'Ошибка обновления уведомлений' })
  }
})

export default router
