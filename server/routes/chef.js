import express from 'express'
import { runQuery, allQuery } from '../database.js'
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

    // Update meal status
    await runQuery(`
      UPDATE issued_meals 
      SET status = 'выдан', issued_by = ?
      WHERE id = ?
    `, [req.session.user.id, mealId])

    res.json({ message: 'Блюдо выдано успешно' })
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

    const { name, quantity, unit } = req.body

    if (!name || !quantity || !unit) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }

    const id = uuidv4()
    await runQuery(`
      INSERT INTO inventory (id, name, quantity, unit)
      VALUES (?, ?, ?, ?)
    `, [id, name, parseFloat(quantity), unit])

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

    await runQuery(`
      UPDATE inventory 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [parseFloat(quantity), id])

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

export default router
