import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../database.js'

const router = express.Router()

// Get reviews for a menu item
router.get('/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params

    const reviews = await allQuery(`
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.menu_id = ?
      ORDER BY r.created_at DESC
    `, [menuId])

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.user_id,
      userName: `${review.first_name} ${review.last_name}`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at
    }))

    res.json(formattedReviews)
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ error: 'Ошибка получения отзывов' })
  }
})

// Get user's reviews
router.get('/user/my-reviews', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const reviews = await allQuery(`
      SELECT r.*, m.name as menu_name
      FROM reviews r
      JOIN menu m ON r.menu_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.session.user.id])

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      menuId: review.menu_id,
      menuName: review.menu_name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at
    }))

    res.json(formattedReviews)
  } catch (error) {
    console.error('Get user reviews error:', error)
    res.status(500).json({ error: 'Ошибка получения отзывов' })
  }
})

// Create review
router.post('/', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Только студенты могут оставлять отзывы' })
    }

    const { menuId, rating, comment } = req.body

    if (!menuId || !rating) {
      return res.status(400).json({ error: 'Укажите блюдо и оценку' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' })
    }

    // Check if menu item exists
    const menuItem = await getQuery('SELECT * FROM menu WHERE id = ?', [menuId])
    if (!menuItem) {
      return res.status(404).json({ error: 'Блюдо не найдено' })
    }

    // Check if user already reviewed this item
    const existingReview = await getQuery(
      'SELECT id FROM reviews WHERE user_id = ? AND menu_id = ?',
      [req.session.user.id, menuId]
    )

    if (existingReview) {
      return res.status(400).json({ error: 'Вы уже оставили отзыв на это блюдо' })
    }

    // Create review
    const reviewId = uuidv4()
    await runQuery(`
      INSERT INTO reviews (id, user_id, menu_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [reviewId, req.session.user.id, menuId, rating, comment || ''])

    res.json({ 
      message: 'Отзыв добавлен успешно',
      reviewId
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ error: 'Ошибка создания отзыва' })
  }
})

// Update review
router.put('/:reviewId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (!rating) {
      return res.status(400).json({ error: 'Укажите оценку' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' })
    }

    // Check if review exists and belongs to user
    const review = await getQuery(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, req.session.user.id]
    )

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' })
    }

    // Update review
    await runQuery(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment || '', reviewId]
    )

    res.json({ message: 'Отзыв обновлен успешно' })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ error: 'Ошибка обновления отзыва' })
  }
})

// Delete review
router.delete('/:reviewId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { reviewId } = req.params

    // Check if review exists and belongs to user
    const review = await getQuery(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, req.session.user.id]
    )

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' })
    }

    // Delete review
    await runQuery('DELETE FROM reviews WHERE id = ?', [reviewId])

    res.json({ message: 'Отзыв удален успешно' })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({ error: 'Ошибка удаления отзыва' })
  }
})

export default router
