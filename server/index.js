import express from 'express'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import session from 'express-session'
import cors from 'cors'
import os from 'os'
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
const HTTP_PORT = process.env.HTTP_PORT || 8080
const HTTPS_PORT = process.env.HTTPS_PORT || 8443

// SSL Certificate paths
const certPath = path.join(__dirname, '..', 'cert')
const keyPath = path.join(certPath, 'key.txt')
const certFilePath = path.join(certPath, 'www_autogreatfood_ru_2026_08_30.crt')

// Check if SSL certificates exist
let sslOptions = null
try {
  if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certFilePath)
    }
    console.log('✅ SSL certificates loaded successfully')
  } else {
    console.warn('⚠️  SSL certificates not found, will run HTTP only')
    console.warn(`   Key: ${keyPath}`)
    console.warn(`   Cert: ${certFilePath}`)
  }
} catch (error) {
  console.error('❌ Error loading SSL certificates:', error.message)
  console.warn('⚠️  Will run HTTP only')
}

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
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      ssl: !!sslOptions,
      ports: {
        http: HTTP_PORT,
        https: sslOptions ? HTTPS_PORT : null
      }
    })
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

  // Start servers based on SSL availability
  if (sslOptions) {
    // Start HTTP server (redirect to HTTPS)
    const httpServer = http.createServer((req, res) => {
      res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
      res.end()
    })

    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`🔓 HTTP Server (redirect) running on port ${HTTP_PORT}`)
    })

    // Start HTTPS server
    const httpsServer = https.createServer(sslOptions, app)

    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`\n🚀 HTTPS Server running on:`)
      console.log(`   - Local:   https://localhost:${HTTPS_PORT}`)
      console.log(`   - Network: https://127.0.0.1:${HTTPS_PORT}`)
      console.log(`   - Network: https://0.0.0.0:${HTTPS_PORT}`)
      console.log(`\n📱 Alternative URLs:`)
      console.log(`   - https://localhost:${HTTPS_PORT}`)
      console.log(`   - https://127.0.0.1:${HTTPS_PORT}`)
      console.log(`   - https://autogreatfood.ru`)
      
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
      console.log(`🔒 SSL: Enabled`)
      console.log(`📜 Certificate: www_autogreatfood_ru_2026_08_30.crt`)
      console.log(`🔑 Private Key: key.txt`)
    })
  } else {
    // Start HTTP server only
    const httpServer = http.createServer(app)

    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`\n🚀 HTTP Server running on:`)
      console.log(`   - Local:   http://localhost:${HTTP_PORT}`)
      console.log(`   - Network: http://127.0.0.1:${HTTP_PORT}`)
      console.log(`   - Network: http://0.0.0.0:${HTTP_PORT}`)
      console.log(`\n📱 Alternative URLs:`)
      console.log(`   - http://localhost:${HTTP_PORT}`)
      console.log(`   - http://127.0.0.1:${HTTP_PORT}`)
      
      // Получить локальный IP
      const networkInterfaces = os.networkInterfaces()
      Object.keys(networkInterfaces).forEach(interfaceName => {
        networkInterfaces[interfaceName].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`   - http://${iface.address}:${HTTP_PORT}`)
          }
        })
      })
      
      console.log(`\n🗄️  Database: PostgreSQL`)
      console.log(`⚠️  SSL: Disabled (certificates not found)`)
    })
  }
}

startServer()
