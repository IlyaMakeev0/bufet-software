import pg from 'pg'

const { Client } = pg

const maxRetries = 30
const retryDelay = 2000

async function waitForDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'school_canteen',
    user: process.env.DB_USER || 'canteen_user',
    password: process.env.DB_PASSWORD || 'canteen_password_2024',
  }

  console.log(`⏳ Waiting for PostgreSQL at ${config.host}:${config.port}...`)

  for (let i = 1; i <= maxRetries; i++) {
    try {
      const client = new Client(config)
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      console.log(`✅ PostgreSQL is ready!`)
      return true
    } catch (error) {
      console.log(`⏳ Attempt ${i}/${maxRetries}: PostgreSQL not ready yet...`)
      if (i === maxRetries) {
        console.error(`❌ Failed to connect to PostgreSQL after ${maxRetries} attempts`)
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}

// Запускаем только если это главный модуль
if (import.meta.url === `file://${process.argv[1]}`) {
  waitForDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default waitForDatabase
