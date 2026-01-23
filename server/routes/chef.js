import express from 'express'
import { runQuery, allQuery } from '../database.js'

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

export default router
