import express from 'express'
import session from 'express-session'
import cors from 'cors'
import path from 'path'
import https from 'https'
import http from 'http'
import fs from 'fs'
import { fileURLToPath } from 'url'
import os from 'os'

// Выбор базы данных в зависимости от окружения
const dbModule = process.env.DB_HOST 
  ? await import('./database-postgres.js')
  : await import('./database.js')

const { initDatabase, getDb } = dbModule

import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import subscriptionRoutes from './routes/subscriptions.js'
import chefRoutes from './routes/chef.js'
import adminRoutes from './routes/admin.js'
import profileRoutes from './routes/profile.js'
import reviewRoutes from './routes/reviews.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const HTTP_PORT = process.env.HTTP_PORT || 8080
const HTTPS_PORT = process.env.HTTPS_PORT || 8443
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:8443'

// SSL сертификаты (если существуют)
let sslOptions = null
const keyPath = path.join(__dirname, '..', 'cert', 'key.txt')
const certPath = path.join(__dirname, '..', 'cert', 'www_autogreatfood_ru_2026_08_30.crt')

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
  console.log('✅ SSL certificates loaded')
} else {
  console.log('⚠️  SSL certificates not found, running HTTP only')
}

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'школа-столовая-2024-секрет-ключ',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: sslOptions !== null, // true если есть SSL
    httpOnly: true,
    sameSite: sslOptions !== null ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')))

// Initialize database
try {
  // Если используется PostgreSQL, ждем пока БД будет готова
  if (process.env.DB_HOST) {
    const waitForDatabase = (await import('./wait-for-db.js')).default
    await waitForDatabase()
  }
  
  await initDatabase()
  console.log('✅ Database initialized')
} catch (error) {
  console.error('❌ Database initialization failed:', error)
  process.exit(1)
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/chef', chefRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/reviews', reviewRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Запуск серверов
if (sslOptions) {
  // HTTPS сервер
  https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server running on:`)
    console.log(`   - https://localhost:${HTTPS_PORT}`)
    console.log(`   - https://www.autogreatfood.ru:${HTTPS_PORT}`)
    
    const networkInterfaces = os.networkInterfaces()
    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   - https://${iface.address}:${HTTPS_PORT}`)
        }
      })
    })
    
    console.log(`\n🗄️  Database: ${process.env.DB_HOST ? 'PostgreSQL' : 'SQLite'}`)
    console.log(`✅ SSL Certificate: www.autogreatfood.ru (valid until 2026-08-30)`)
  })

  // HTTP редирект сервер (опционально)
  if (process.env.ENABLE_HTTP_REDIRECT === 'true') {
    const httpApp = express()
    httpApp.use('*', (req, res) => {
      res.redirect(301, `https://${req.headers.host.replace(HTTP_PORT, HTTPS_PORT)}${req.url}`)
    })
    httpApp.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`\n🔄 HTTP Redirect Server running on port ${HTTP_PORT}`)
      console.log(`   Redirecting all traffic to HTTPS`)
    })
  }
} else {
  // Только HTTP (если нет сертификатов)
  app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🚀 HTTP Server running on:`)
    console.log(`   - http://localhost:${HTTP_PORT}`)
    console.log(`   - http://127.0.0.1:${HTTP_PORT}`)
    
    const networkInterfaces = os.networkInterfaces()
    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   - http://${iface.address}:${HTTP_PORT}`)
        }
      })
    })
    
    console.log(`\n🗄️  Database: ${process.env.DB_HOST ? 'PostgreSQL' : 'SQLite'}`)
  })
}
