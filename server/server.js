import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import database from './database.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import paymentRoutes from './routes/payment.js'
import orderRoutes from './routes/orders.js'
import reviewRoutes from './routes/reviews.js'
import inventoryRoutes from './routes/inventory.js'
import requestRoutes from './routes/requests.js'
import statsRoutes from './routes/stats.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Инициализация БД
await database.init()

// Роуты
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Canteen Management API' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)
})
