import express from 'express'
import session from 'express-session'
import cors from 'cors'
import os from 'os'
import path from 'path'
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
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'школа-столовая-2024-секрет-ключ',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'dist')
    app.use(express.static(distPath))
    
    // Handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on:`)
    console.log(`   - Local:   http://localhost:${PORT}`)
    console.log(`   - Network: http://127.0.0.1:${PORT}`)
    console.log(`   - Network: http://0.0.0.0:${PORT}`)
    console.log(`\n📱 Alternative URLs:`)
    console.log(`   - http://localhost:${PORT}`)
    console.log(`   - http://127.0.0.1:${PORT}`)
    
    // Получить локальный IP
    const networkInterfaces = os.networkInterfaces()
    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   - http://${iface.address}:${PORT}`)
        }
      })
    })
    
    console.log(`\n🗄️  Database: PostgreSQL`)
  })
}

startServer()
