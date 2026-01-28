// JWT токены с ограниченным временем жизни
import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key-change-in-production'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key-change-in-production'

const ACCESS_TOKEN_EXPIRY = '15m' // 15 минут
const REFRESH_TOKEN_EXPIRY = '7d' // 7 дней

// Хранилище refresh токенов (в production использовать Redis)
const refreshTokens = new Set()

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )
}

export function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )
  
  refreshTokens.add(token)
  return token
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token) {
  try {
    if (!refreshTokens.has(token)) {
      return null
    }
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

export function revokeRefreshToken(token) {
  refreshTokens.delete(token)
}

export function revokeAllUserTokens(userId) {
  // В production с Redis можно удалить все токены пользователя
  // Здесь просто помечаем для примера
  console.log(`Revoked all tokens for user ${userId}`)
}

// Middleware для проверки JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' })
  }
  
  const user = verifyAccessToken(token)
  
  if (!user) {
    return res.status(403).json({ error: 'Токен недействителен или истек' })
  }
  
  req.user = user
  next()
}

// Middleware для проверки ролей с JWT
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        required: roles,
        current: req.user.role
      })
    }
    
    next()
  }
}
