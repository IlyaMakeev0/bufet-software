// API для работы с QR-кодами
import express from 'express'
import { generateOrderQRCode, validateOrderQRCode, issueOrderByQRCode, generateSubscriptionQRCode } from '../utils/qrCode.js'
import { getQuery } from '../database.js'

const router = express.Router()

// Генерация QR-кода для заказа (студент)
router.post('/generate/order/:orderId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(403).json({ error: 'Доступ запрещен' })
    }
    
    const { orderId } = req.params
    const userId = req.session.user.id
    
    // Проверяем что заказ принадлежит пользователю
    const order = await getQuery(`
      SELECT * FROM orders 
      WHERE id = ? AND user_id = ?
    `, [orderId, userId])
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' })
    }
    
    if (order.status !== 'оплачен') {
      return res.status(400).json({ error: 'Заказ должен быть оплачен для генерации QR-кода' })
    }
    
    const result = await generateOrderQRCode(orderId, userId)
    
    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }
    
    res.json({
      qrCode: result.qrCode,
      expiresAt: result.expiresAt,
      message: 'QR-код успешно сгенерирован'
    })
  } catch (error) {
    console.error('Generate QR code error:', error)
    res.status(500).json({ error: 'Ошибка генерации QR-кода' })
  }
})

// Валидация QR-кода (повар)
router.post('/validate', async (req, res) => {
  try {
    if (!req.session.user || !['chef', 'admin'].includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещен' })
    }
    
    const { qrData } = req.body
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR-код не предоставлен' })
    }
    
    const result = await validateOrderQRCode(qrData)
    
    if (!result.valid) {
      return res.status(400).json({ 
        error: result.error,
        alreadyIssued: result.alreadyIssued 
      })
    }
    
    res.json({
      valid: true,
      order: result.order,
      message: 'QR-код действителен'
    })
  } catch (error) {
    console.error('Validate QR code error:', error)
    res.status(500).json({ error: 'Ошибка валидации QR-кода' })
  }
})

// Выдача заказа по QR-коду (повар)
router.post('/issue/:orderId', async (req, res) => {
  try {
    if (!req.session.user || !['chef', 'admin'].includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещен' })
    }
    
    const { orderId } = req.params
    const chefId = req.session.user.id
    
    const result = await issueOrderByQRCode(orderId, chefId)
    
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    
    res.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Issue order error:', error)
    res.status(500).json({ error: 'Ошибка выдачи заказа' })
  }
})

// Генерация QR-кода для подписки (студент)
router.post('/generate/subscription/:subscriptionId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student') {
      return res.status(403).json({ error: 'Доступ запрещен' })
    }
    
    const { subscriptionId } = req.params
    const userId = req.session.user.id
    
    // Проверяем что подписка принадлежит пользователю
    const subscription = await getQuery(`
      SELECT * FROM subscriptions 
      WHERE id = ? AND user_id = ?
    `, [subscriptionId, userId])
    
    if (!subscription) {
      return res.status(404).json({ error: 'Подписка не найдена' })
    }
    
    if (subscription.status !== 'активен') {
      return res.status(400).json({ error: 'Подписка неактивна' })
    }
    
    const result = await generateSubscriptionQRCode(subscriptionId, userId)
    
    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }
    
    res.json({
      qrCode: result.qrCode,
      expiresAt: result.expiresAt,
      message: 'QR-код подписки успешно сгенерирован'
    })
  } catch (error) {
    console.error('Generate subscription QR code error:', error)
    res.status(500).json({ error: 'Ошибка генерации QR-кода' })
  }
})

export default router
