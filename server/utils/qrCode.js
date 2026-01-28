// Генерация и валидация QR-кодов для заказов
import QRCode from 'qrcode'
import crypto from 'crypto'
import { getQuery, runQuery } from '../database.js'

// Генерация уникального QR-кода для заказа
export async function generateOrderQRCode(orderId, userId) {
  try {
    // Создаем уникальный токен для QR-кода
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
    
    // Сохраняем токен в БД
    await runQuery(`
      UPDATE orders 
      SET qr_token = ?, qr_expires_at = ?
      WHERE id = ? AND user_id = ?
    `, [token, expiresAt.toISOString(), orderId, userId])
    
    // Данные для QR-кода
    const qrData = JSON.stringify({
      orderId,
      token,
      type: 'order',
      timestamp: Date.now()
    })
    
    // Генерируем QR-код как Data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    console.log(`✅ QR code generated for order ${orderId}`)
    
    return {
      success: true,
      qrCode: qrCodeDataURL,
      token,
      expiresAt
    }
  } catch (error) {
    console.error('❌ Failed to generate QR code:', error)
    return {
      success: false,
      error: 'Не удалось сгенерировать QR-код'
    }
  }
}

// Валидация QR-кода при сканировании
export async function validateOrderQRCode(qrData) {
  try {
    // Парсим данные из QR-кода
    let data
    try {
      data = JSON.parse(qrData)
    } catch (e) {
      return {
        valid: false,
        error: 'Неверный формат QR-кода'
      }
    }
    
    const { orderId, token, type } = data
    
    // Проверка типа
    if (type !== 'order') {
      return {
        valid: false,
        error: 'Неверный тип QR-кода'
      }
    }
    
    // Получаем заказ из БД
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
      WHERE o.id = ?
    `, [orderId])
    
    if (!order) {
      return {
        valid: false,
        error: 'Заказ не найден'
      }
    }
    
    // Проверка токена
    if (order.qr_token !== token) {
      return {
        valid: false,
        error: 'Недействительный QR-код'
      }
    }
    
    // Проверка срока действия
    const expiresAt = new Date(order.qr_expires_at)
    if (Date.now() > expiresAt.getTime()) {
      return {
        valid: false,
        error: 'QR-код истек. Сгенерируйте новый'
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
    console.error('❌ Failed to validate QR code:', error)
    return {
      valid: false,
      error: 'Ошибка валидации QR-кода'
    }
  }
}

// Выдача заказа по QR-коду
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
          issued_at = datetime('now'),
          issued_by = ?
      WHERE id = ?
    `, [chefId, orderId])
    
    // Инвалидируем QR-код (опционально)
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

// Генерация QR-кода для подписки
export async function generateSubscriptionQRCode(subscriptionId, userId) {
  try {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    
    await runQuery(`
      UPDATE subscriptions 
      SET qr_token = ?, qr_expires_at = ?
      WHERE id = ? AND user_id = ?
    `, [token, expiresAt.toISOString(), subscriptionId, userId])
    
    const qrData = JSON.stringify({
      subscriptionId,
      token,
      type: 'subscription',
      timestamp: Date.now()
    })
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    })
    
    return {
      success: true,
      qrCode: qrCodeDataURL,
      token,
      expiresAt
    }
  } catch (error) {
    console.error('❌ Failed to generate subscription QR code:', error)
    return {
      success: false,
      error: 'Не удалось сгенерировать QR-код'
    }
  }
}
