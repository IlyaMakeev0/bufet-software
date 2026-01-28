// Шифрование персональных данных
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'encryption-key-change-in-production-32-chars-minimum'

// Шифрование данных
export function encrypt(text) {
  if (!text) return null
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

// Расшифровка данных
export function decrypt(encryptedText) {
  if (!encryptedText) return null
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// Хеширование данных (необратимое)
export function hashData(text) {
  if (!text) return null
  
  try {
    const hashed = CryptoJS.SHA256(text).toString()
    return hashed
  } catch (error) {
    console.error('Hashing error:', error)
    return null
  }
}

// Маскирование телефона для отображения
export function maskPhone(phone) {
  if (!phone) return null
  
  // +7 (900) 123-45-67 -> +7 (900) ***-**-67
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ***-**-${cleaned.slice(9)}`
  }
  return phone
}

// Маскирование email для отображения
export function maskEmail(email) {
  if (!email) return null
  
  const [name, domain] = email.split('@')
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`
  }
  return `${name.slice(0, 2)}***@${domain}`
}
