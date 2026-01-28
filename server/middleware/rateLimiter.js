// Rate limiting для защиты от брутфорса и DDoS

const loginAttempts = new Map() // email -> { count, resetTime }
const requestCounts = new Map() // ip -> { count, resetTime }

// Ограничение попыток входа
export const loginLimiter = (req, res, next) => {
  const { email } = req.body
  
  if (!email) {
    return next()
  }
  
  const now = Date.now()
  const attempts = loginAttempts.get(email) || { count: 0, resetTime: now + 15 * 60 * 1000 }
  
  // Сброс счетчика если прошло 15 минут
  if (now > attempts.resetTime) {
    attempts.count = 0
    attempts.resetTime = now + 15 * 60 * 1000
  }
  
  // Проверка лимита
  if (attempts.count >= 5) {
    const minutesLeft = Math.ceil((attempts.resetTime - now) / 60000)
    return res.status(429).json({ 
      error: `Слишком много попыток входа. Попробуйте через ${minutesLeft} минут` 
    })
  }
  
  // Увеличиваем счетчик
  attempts.count++
  loginAttempts.set(email, attempts)
  
  // Сброс счетчика при успешном входе
  res.on('finish', () => {
    if (res.statusCode === 200) {
      loginAttempts.delete(email)
    }
  })
  
  next()
}

// Общее ограничение запросов по IP
export const apiLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const requests = requestCounts.get(ip) || { count: 0, resetTime: now + 60 * 1000 }
  
  // Сброс счетчика если прошла минута
  if (now > requests.resetTime) {
    requests.count = 0
    requests.resetTime = now + 60 * 1000
  }
  
  // Проверка лимита (100 запросов в минуту)
  if (requests.count >= 100) {
    return res.status(429).json({ 
      error: 'Слишком много запросов. Попробуйте позже' 
    })
  }
  
  requests.count++
  requestCounts.set(ip, requests)
  
  next()
}

// Ограничение для финансовых операций
export const paymentLimiter = (req, res, next) => {
  const userId = req.session.user?.id
  
  if (!userId) {
    return next()
  }
  
  const key = `payment_${userId}`
  const now = Date.now()
  const attempts = requestCounts.get(key) || { count: 0, resetTime: now + 60 * 1000 }
  
  // Сброс счетчика если прошла минута
  if (now > attempts.resetTime) {
    attempts.count = 0
    attempts.resetTime = now + 60 * 1000
  }
  
  // Проверка лимита (5 платежей в минуту)
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Слишком много платежных операций. Подождите минуту' 
    })
  }
  
  attempts.count++
  requestCounts.set(key, attempts)
  
  next()
}

// Очистка старых записей каждые 30 минут
setInterval(() => {
  const now = Date.now()
  
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetTime) {
      loginAttempts.delete(key)
    }
  }
  
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 30 * 60 * 1000)
