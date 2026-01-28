// Логирование всех финансовых транзакций
import { v4 as uuidv4 } from 'uuid'
import { runQuery } from '../database.js'

export async function logTransaction(data) {
  const {
    userId,
    type, // 'topup', 'payment', 'refund', 'subscription'
    amount,
    balanceBefore,
    balanceAfter,
    description,
    relatedId, // orderId, subscriptionId, etc.
    ipAddress
  } = data
  
  try {
    const logId = uuidv4()
    
    await runQuery(`
      INSERT INTO transaction_logs (
        id, user_id, type, amount, 
        balance_before, balance_after, 
        description, related_id, ip_address,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      logId,
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description || '',
      relatedId || null,
      ipAddress || null
    ])
    
    console.log(`💰 Transaction logged: ${type} ${amount}₽ for user ${userId}`)
    
    return logId
  } catch (error) {
    console.error('❌ Failed to log transaction:', error)
    // Не бросаем ошибку, чтобы не прерывать основную операцию
  }
}

export async function getTransactionHistory(userId, limit = 50) {
  try {
    const transactions = await allQuery(`
      SELECT * FROM transaction_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [userId, limit])
    
    return transactions
  } catch (error) {
    console.error('❌ Failed to get transaction history:', error)
    return []
  }
}

export async function validateTransaction(userId, amount, type) {
  // Проверка на подозрительную активность
  
  // 1. Проверка на слишком большую сумму
  if (amount > 10000) {
    console.warn(`⚠️ Large transaction detected: ${amount}₽ by user ${userId}`)
    return {
      valid: false,
      reason: 'Сумма превышает лимит. Обратитесь к администратору',
      requiresApproval: true
    }
  }
  
  // 2. Проверка на частые транзакции
  try {
    const recentTransactions = await allQuery(`
      SELECT COUNT(*) as count FROM transaction_logs
      WHERE user_id = ? 
      AND type = ?
      AND created_at > datetime('now', '-5 minutes')
    `, [userId, type])
    
    if (recentTransactions[0].count >= 5) {
      console.warn(`⚠️ Too many transactions: ${recentTransactions[0].count} in 5 min by user ${userId}`)
      return {
        valid: false,
        reason: 'Слишком много транзакций. Подождите несколько минут'
      }
    }
  } catch (error) {
    console.error('❌ Failed to validate transaction:', error)
  }
  
  return { valid: true }
}
