// Генерация и валидация числовых кодов для заказов
import crypto from 'crypto'
import { getQuery, runQuery } from '../database-adapter.js'

// Генерация уникального 6-значного кода для заказа
export async function generateOrderQRCode(orderId, userId) {
  try {
    // Генерируем уникальный 6-значный код
    let numericCode
    let isUnique = false
    
    // Проверяем уникальность кода
    while (!isUnique) {
      numericCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Проверяем, не используется ли уже этот код
      const existing = await getQuery(`
        SELECT id FROM orders 
        WHERE qr_token = ? AND qr_expires_at > CURRENT_TIMESTAMP
      `, [numericCode])
      
      if (!existing) {
        isUnique = true
      }
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
    
    // Сохраняем код в БД
    await runQuery(`
      UPDATE orders 
      SET qr_token = ?, qr_expires_at = ?
      WHERE id = ? AND user_id = ?
    `, [numericCode, expiresAt.toISOString(), orderId, userId])
    
    console.log(`✅ Numeric code generated for order ${orderId}: ${numericCode}`)
    
    return {
      success: true,
      qrCode: numericCode, // Теперь это числовой код, а не QR-изображение
      token: numericCode,
      expiresAt
    }
  } catch (error) {
    console.error('❌ Failed to generate numeric code:', error)
    return {
      success: false,
      error: 'Не удалось сгенерировать код'
    }
  }
}

// Валидация числового кода при вводе
export async function validateOrderQRCode(qrData) {
  try {
    // Проверяем, является ли это 6-значным числовым кодом
    const numericCode = qrData.trim()
    
    if (!/^\d{6}$/.test(numericCode)) {
      return {
        valid: false,
        error: 'Неверный формат кода. Введите 6-значный код'
      }
    }
    
    // Получаем заказ по коду
    const order = await getQuery(`
      SELECT 
        o.*,
        m.name as menu_name,
        m.meal_type,
        u.first_name,
        u.last_name,
        u.class_name
      FROM orders o
      JOIN menu m ON o.menu_id = m.id
      JOIN users u ON o.user_id = u.id
      WHERE o.qr_token = ?
    `, [numericCode])
    
    if (!order) {
      return {
        valid: false,
        error: 'Код не найден или недействителен'
      }
    }
    
    // Проверка срока действия
    const expiresAt = new Date(order.qr_expires_at)
    if (Date.now() > expiresAt.getTime()) {
      return {
        valid: false,
        error: 'Код истек. Сгенерируйте новый'
      }
    }
    
    // Проверка статуса заказа
    if (order.status === 'выдан') {
      return {
        valid: false,
        error: 'Заказ уже выдан',
        alreadyIssued: true
      }
    }
    
    if (order.status !== 'оплачен') {
      return {
        valid: false,
        error: `Заказ не оплачен. Статус: ${order.status}`
      }
    }
    
    return {
      valid: true,
      order: {
        id: order.id,
        menuName: order.menu_name,
        mealType: order.meal_type,
        studentName: `${order.first_name} ${order.last_name}`,
        className: order.class_name,
        status: order.status,
        createdAt: order.created_at
      }
    }
  } catch (error) {
    console.error('❌ Failed to validate numeric code:', error)
    return {
      valid: false,
      error: 'Ошибка валидации кода'
    }
  }
}

// Выдача заказа по числовому коду
export async function issueOrderByQRCode(orderId, chefId) {
  try {
    // Проверяем статус заказа
    const order = await getQuery(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId])
    
    if (!order) {
      return {
        success: false,
        error: 'Заказ не найден'
      }
    }
    
    if (order.status === 'выдан') {
      return {
        success: false,
        error: 'Заказ уже выдан'
      }
    }
    
    if (order.status !== 'оплачен') {
      return {
        success: false,
        error: 'Заказ не оплачен'
      }
    }
    
    // Обновляем статус заказа
    await runQuery(`
      UPDATE orders 
      SET status = 'выдан',
          issued_at = CURRENT_TIMESTAMP,
          issued_by = ?
      WHERE id = ?
    `, [chefId, orderId])
    
    // Инвалидируем код
    await runQuery(`
      UPDATE orders 
      SET qr_token = NULL
      WHERE id = ?
    `, [orderId])
    
    console.log(`✅ Order ${orderId} issued by chef ${chefId}`)
    
    return {
      success: true,
      message: 'Заказ успешно выдан'
    }
  } catch (error) {
    console.error('❌ Failed to issue order:', error)
    return {
      success: false,
      error: 'Ошибка выдачи заказа'
    }
  }
}

// Генерация числового кода для подписки
export async function generateSubscriptionQRCode(subscriptionId, userId) {
  try {
    // Генерируем уникальный 6-значный код
    let numericCode
    let isUnique = false
    
    while (!isUnique) {
      numericCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const existing = await getQuery(`
        SELECT id FROM subscriptions 
        WHERE qr_token = ? AND qr_expires_at > CURRENT_TIMESTAMP
      `, [numericCode])
      
      if (!existing) {
        isUnique = true
      }
    }
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    
    await runQuery(`
      UPDATE subscriptions 
      SET qr_token = ?, qr_expires_at = ?
      WHERE id = ? AND user_id = ?
    `, [numericCode, expiresAt.toISOString(), subscriptionId, userId])
    
    return {
      success: true,
      qrCode: numericCode,
      token: numericCode,
      expiresAt
    }
  } catch (error) {
    console.error('❌ Failed to generate subscription numeric code:', error)
    return {
      success: false,
      error: 'Не удалось сгенерировать код'
    }
  }
}
