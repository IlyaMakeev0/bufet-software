import express from 'express'
import { allQuery } from '../database.js'

const router = express.Router()

// Get menu
router.get('/', async (req, res) => {
  try {
    const { date } = req.query
    
    let sql = 'SELECT * FROM menu WHERE available = 1'
    const params = []
    
    if (date) {
      sql += ' AND day = ?'
      params.push(date)
    }
    
    sql += ' ORDER BY day, meal_type'
    
    const menu = await allQuery(sql, params)
    
    const formattedMenu = menu.map(item => ({
      id: item.id,
      day: item.day,
      name: item.name,
      description: item.description,
      price: item.price,
      mealType: item.meal_type,
      available: item.available,
      createdAt: item.created_at
    }))
    
    res.json(formattedMenu)
  } catch (error) {
    console.error('Get menu error:', error)
    res.status(500).json({ error: 'Ошибка получения меню' })
  }
})

export default router
