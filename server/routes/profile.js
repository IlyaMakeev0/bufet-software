import express from 'express'
import { runQuery, getQuery } from '../database.js'

const router = express.Router()

// Get user profile
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.session.user.id])
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      className: user.class_name,
      position: user.position,
      role: user.role,
      balance: parseFloat(user.balance) || 0,
      allergies: user.allergies || '',
      foodPreferences: user.food_preferences || ''
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Ошибка получения профиля' })
  }
})

// Update allergies and preferences
router.put('/preferences', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Только студенты могут обновлять предпочтения' })
    }

    const { allergies, foodPreferences } = req.body

    await runQuery(
      'UPDATE users SET allergies = ?, food_preferences = ? WHERE id = ?',
      [allergies || '', foodPreferences || '', req.session.user.id]
    )

    res.json({ 
      message: 'Предпочтения обновлены успешно',
      allergies: allergies || '',
      foodPreferences: foodPreferences || ''
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ error: 'Ошибка обновления предпочтений' })
  }
})

export default router
