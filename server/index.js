import express from 'express'
import session from 'express-session'
import cors from 'cors'
import os from 'os'
import { initDatabase, getDb } from './database.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import subscriptionRoutes from './routes/subscriptions.js'
import chefRoutes from './routes/chef.js'
import adminRoutes from './routes/admin.js'
import profileRoutes from './routes/profile.js'
import reviewRoutes from './routes/reviews.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: 'школа-столовая-2024-секрет-ключ',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize database
initDatabase()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/chef', chefRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/reviews', reviewRoutes)

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
})
