// Комплексная защита приложения
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Helmet для защиты заголовков
export function setupHelmet(app) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }))
}

// Rate limiting для разных эндпоинтов
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 запросов
  message: { error: 'Слишком много попыток. Попробуйте через 15 минут' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // 10 запросов
  message: { error: 'Слишком много запросов аутентификации' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // 100 запросов
  message: { error: 'Слишком много API запросов' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const paymentRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 5, // 5 платежей
  message: { error: 'Слишком много платежных операций. Подождите минуту' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Ограничение по пользователю, а не по IP
    return req.user?.id || req.ip
  }
})

// CSRF защита (для форм)
export function csrfProtection(req, res, next) {
  // Проверка CSRF токена для небезопасных методов
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf
    
    if (!token) {
      return res.status(403).json({ error: 'CSRF токен отсутствует' })
    }
    
    // В production использовать библиотеку csurf
    // Здесь упрощенная проверка
    if (!req.session?.csrfToken || token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Недействительный CSRF токен' })
    }
  }
  
  next()
}

// Генерация CSRF токена
export function generateCsrfToken(req) {
  const token = require('crypto').randomBytes(32).toString('hex')
  req.session.csrfToken = token
  return token
}
