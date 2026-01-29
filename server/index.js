import express from 'express'
import session from 'express-session'
import cors from 'cors'
import os from 'os'
import path from 'path'
import https from 'https'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { initDatabase, getDb } from './database.js'
import waitForDatabase from './wait-for-db.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import subscriptionRoutes from './routes/subscriptions.js'
import chefRoutes from './routes/chef.js'
import adminRoutes from './routes/admin.js'
import profileRoutes from './routes/profile.js'
import reviewRoutes from './routes/reviews.js'
import qrcodeRoutes from './routes/qrcode.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const HTTP_PORT = process.env.HTTP_PORT || 80
const HTTPS_PORT = process.env.HTTPS_PORT || 443

// SSL сертификаты
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'cert', 'key.txt')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'cert', 'www_autogreatfood_ru_2026_08_30.crt'))
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.autogreatfood.ru',
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'школа-столовая-2024-секрет-ключ',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Всегда true для HTTPS
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize database
async function startServer() {
  try {
    // Ждем готовности PostgreSQL
    if (process.env.DB_HOST) {
      console.log('⏳ Waiting for PostgreSQL...')
      await waitForDatabase()
    }
    
    await initDatabase()
    console.log('✅ Database initialized')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/menu', menuRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/subscriptions', subscriptionRoutes)
  app.use('/api/chef', chefRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/reviews', reviewRoutes)
  app.use('/api/qrcode', qrcodeRoutes)

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'dist')
    app.use(express.static(distPath))
    
    // Handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  // Запуск HTTPS сервера
  https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server running on:`)
    console.log(`   - https://www.autogreatfood.ru:${HTTPS_PORT}`)
    console.log(`   - https://autogreatfood.ru:${HTTPS_PORT}`)
    console.log(`   - https://localhost:${HTTPS_PORT}`)
    
    // Получить локальный IP
    const networkInterfaces = os.networkInterfaces()
    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   - https://${iface.address}:${HTTPS_PORT}`)
        }
      })
    })
    
    console.log(`\n🗄️  Database: PostgreSQL`)
    console.log(`\n✅ SSL Certificate: www.autogreatfood.ru (valid until 2026-08-30)`)
  })

  // Опционально: HTTP сервер для редиректа на HTTPS
  if (process.env.ENABLE_HTTP_REDIRECT === 'true') {
    const httpApp = express()
    httpApp.use('*', (req, res) => {
      res.redirect(301, `https://${req.headers.host}${req.url}`)
    })
    httpApp.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`\n🔄 HTTP Redirect Server running on port ${HTTP_PORT}`)
      console.log(`   Redirecting all traffic to HTTPS`)
    })
  }
}

startServer()
