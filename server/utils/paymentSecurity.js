// Защита от повторных списаний и мошенничества
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery } from '../database.js'

// Idempotency keys для предотвращения повторных списаний
const processedPayments = new Map()

export function generateIdempotencyKey() {
  return uuidv4()
}

export function checkIdempotencyKey(key) {
  if (processedPayments.has(key)) {
    return {
      duplicate: true,
      result: processedPayments.get(key)
    }
  }
  return { duplicate: false }
}

export function saveIdempotencyKey(key, result) {
  processedPayments.set(key, {
    ...result,
    timestamp: Date.now()
  })
  
  // Автоматически удаляем через 24 часа
  setTimeout(() => {
    processedPayments.delete(key)
  }, 24 * 60 * 60 * 1000)
}

// Проверка статуса заказа перед оплатой
export async function validateOrderPayment(orderId, userId) {
  const order = await getQuery(`
    SELECT o.*, m.price 
    FROM orders o
    JOIN menu m ON o.menu_id = m.id
    WHERE o.id = ? AND o.user_id = ?
  `, [orderId, userId])
  
  if (!order) {
    return {
      valid: false,
      error: 'Заказ не найден'
    }
  }
  
  if (order.status !== 'ожидает оплаты') {
    return {
      valid: false,
      error: `Заказ уже ${order.status}`,
      currentStatus: order.status
    }
  }
  
  return {
    valid: true,
    order
  }
}

// Проверка статуса подписки перед оплатой
export async function validateSubscriptionPayment(userId, subscriptionData) {
  // Проверка активных подписок
  const activeSubscription = await getQuery(`
    SELECT * FROM subscriptions
    WHERE user_id = ? 
    AND status = 'активен'
    AND end_date > date('now')
  `, [userId])
  
  if (activeSubscription) {
    return {
      valid: false,
      error: 'У вас уже есть активная подписка',
      activeUntil: activeSubscription.end_date
    }
  }
  
  return {
    valid: true
  }
}

// Транзакция с блокировкой для предотвращения race conditions
export async function executePaymentTransaction(client, operations) {
  try {
    await client.query('BEGIN')
    
    // Блокировка строки пользователя
    await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [operations.userId])
    
    // Выполнение операций
    for (const operation of operations.steps) {
      await client.query(operation.sql, operation.params)
    }
    
    await client.query('COMMIT')
    return { success: true }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Payment transaction failed:', error)
    return {
      success: false,
      error: 'Ошибка обработки платежа'
    }
  }
}

// Проверка баланса с блокировкой
export async function checkAndLockBalance(client, userId, requiredAmount) {
  const result = await client.query(
    'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
    [userId]
  )
  
  if (!result.rows[0]) {
    throw new Error('Пользователь не найден')
  }
  
  const balance = parseFloat(result.rows[0].balance)
  
  if (balance < requiredAmount) {
    throw new Error(`Недостаточно средств. Баланс: ${balance}₽, требуется: ${requiredAmount}₽`)
  }
  
  return balance
}

// Валидация суммы платежа
export function validatePaymentAmount(amount) {
  const numAmount = parseFloat(amount)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      error: 'Неверная сумма платежа'
    }
  }
  
  if (numAmount > 50000) {
    return {
      valid: false,
      error: 'Сумма превышает максимальный лимит (50000₽)'
    }
  }
  
  // Проверка на подозрительные суммы (например, 0.01₽)
  if (numAmount < 1) {
    return {
      valid: false,
      error: 'Минимальная сумма платежа: 1₽'
    }
  }
  
  return {
    valid: true,
    amount: numAmount
  }
}

// Очистка старых idempotency keys каждый час
setInterval(() => {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  
  for (const [key, value] of processedPayments.entries()) {
    if (now - value.timestamp > oneDay) {
      processedPayments.delete(key)
    }
  }
}, 60 * 60 * 1000)
