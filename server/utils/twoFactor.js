// Двухфакторная аутентификация для крупных платежей
import { sendVerificationCode } from './emailService.js'

// Хранилище кодов 2FA (в production использовать Redis)
const twoFactorCodes = new Map()

const REQUIRE_2FA_AMOUNT = parseFloat(process.env.REQUIRE_2FA_AMOUNT) || 5000

export function requiresTwoFactor(amount) {
  return amount >= REQUIRE_2FA_AMOUNT
}

export async function sendTwoFactorCode(userId, email, amount) {
  // Генерируем 6-значный код
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Сохраняем код с временем истечения (5 минут)
  twoFactorCodes.set(userId, {
    code,
    amount,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  })
  
  try {
    await sendVerificationCode(email, code)
    console.log(`✅ 2FA code sent to ${email} for amount ${amount}₽`)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send 2FA code:', error)
    twoFactorCodes.delete(userId)
    return { success: false, error: 'Не удалось отправить код' }
  }
}

export function verifyTwoFactorCode(userId, code, amount) {
  const stored = twoFactorCodes.get(userId)
  
  if (!stored) {
    return {
      valid: false,
      error: 'Код не найден. Запросите новый код'
    }
  }
  
  // Проверка истечения
  if (Date.now() > stored.expiresAt) {
    twoFactorCodes.delete(userId)
    return {
      valid: false,
      error: 'Код истек. Запросите новый код'
    }
  }
  
  // Проверка попыток
  if (stored.attempts >= 3) {
    twoFactorCodes.delete(userId)
    return {
      valid: false,
      error: 'Превышено количество попыток. Запросите новый код'
    }
  }
  
  // Проверка суммы
  if (Math.abs(stored.amount - amount) > 0.01) {
    return {
      valid: false,
      error: 'Сумма не совпадает с запрошенной'
    }
  }
  
  // Проверка кода
  if (stored.code !== code) {
    stored.attempts++
    return {
      valid: false,
      error: `Неверный код. Осталось попыток: ${3 - stored.attempts}`
    }
  }
  
  // Код верный - удаляем
  twoFactorCodes.delete(userId)
  
  return {
    valid: true
  }
}

export function cancelTwoFactor(userId) {
  twoFactorCodes.delete(userId)
}

// Очистка старых кодов каждые 10 минут
setInterval(() => {
  const now = Date.now()
  for (const [userId, data] of twoFactorCodes.entries()) {
    if (now > data.expiresAt) {
      twoFactorCodes.delete(userId)
    }
  }
}, 10 * 60 * 1000)
