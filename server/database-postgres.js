import pg from 'pg'
import { v4 as uuidv4 } from 'uuid'

const { Pool } = pg

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'school_canteen',
  user: process.env.DB_USER || 'canteen_user',
  password: process.env.DB_PASSWORD || 'canteen_password_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export function getDb() {
  return pool
}

export async function initDatabase() {
  console.log('🔄 Checking PostgreSQL database...')

  const client = await pool.connect()
  
  try {
    // Проверяем, существует ли таблица users
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `)
    
    const tablesExist = tableCheck.rows[0].exists
    
    if (tablesExist === true) {
      console.log('✅ Database already initialized, skipping...')
      
      // Проверим количество пользователей
      const userCount = await client.query('SELECT COUNT(*) FROM users')
      console.log(`📊 Current users count: ${userCount.rows[0].count}`)
      
      return
    }
    
    console.log('📊 Initializing database for the first time...')
    
    await client.query('BEGIN')

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        class_name TEXT,
        role TEXT NOT NULL DEFAULT 'student',
        position TEXT,
        balance DECIMAL(10, 2) DEFAULT 1000,
        allergies TEXT,
        food_preferences TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create menu table
    await client.query(`
      CREATE TABLE menu (
        id TEXT PRIMARY KEY,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        meal_type TEXT NOT NULL,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create orders table
    await client.query(`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        menu_id TEXT NOT NULL,
        status TEXT DEFAULT 'ожидает оплаты',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_id) REFERENCES menu(id)
      )
    `)

    // Create reviews table
    await client.query(`
      CREATE TABLE reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        menu_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_id) REFERENCES menu(id)
      )
    `)

    // Create subscriptions table
    await client.query(`
      CREATE TABLE subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subscription_type TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'активен',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Create issued_meals table
    await client.query(`
      CREATE TABLE issued_meals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        menu_id TEXT NOT NULL,
        subscription_id TEXT,
        issue_date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        issued_by TEXT,
        status TEXT DEFAULT 'ожидает выдачи',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_id) REFERENCES menu(id),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
      )
    `)

    // Add sample menu for 30 days
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Breakfast
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Каша овсяная с ягодами', 'Полезный завтрак. Состав: овсяные хлопья, молоко, ягоды (клубника, черника), мёд', 120, 'завтрак'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Сырники со сметаной', 'Домашние сырники. Состав: творог, яйца, мука, сахар, сметана', 140, 'завтрак'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Омлет с ветчиной', 'Сытный завтрак. Состав: яйца, молоко, ветчина, сыр, зелень', 150, 'завтрак'])

      // Lunch
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Суп куриный с лапшой', 'Ароматный суп. Состав: курица, лапша, морковь, лук, зелень', 150, 'обед'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Гречка с котлетой', 'Сытный обед. Состав: гречка, котлета (говядина, свинина), лук, яйца, хлеб', 180, 'обед'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Плов с говядиной', 'Традиционный плов. Состав: рис, говядина, морковь, лук, масло растительное', 200, 'обед'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Салат овощной', 'Свежие овощи. Состав: помидоры, огурцы, перец, лук, масло растительное', 90, 'обед'])

      // Snack
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Творожная запеканка', 'Нежный десерт. Состав: творог, яйца, сахар, мука, изюм', 130, 'полдник'])
      
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), dateStr, 'Йогурт с фруктами', 'Легкий полдник. Состав: йогурт, фрукты (яблоко, банан, киви), мёд', 100, 'полдник'])
    }

    await client.query('COMMIT')
    console.log('✅ PostgreSQL database initialized successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

export async function runQuery(sql, params = []) {
  // Конвертируем ? в $1, $2, $3 для PostgreSQL
  let paramIndex = 1
  const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)
  
  const client = await pool.connect()
  try {
    const result = await client.query(pgSql, params)
    return { changes: result.rowCount, lastID: result.rows[0]?.id }
  } finally {
    client.release()
  }
}

export async function getQuery(sql, params = []) {
  // Конвертируем ? в $1, $2, $3 для PostgreSQL
  let paramIndex = 1
  const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)
  
  const client = await pool.connect()
  try {
    const result = await client.query(pgSql, params)
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function allQuery(sql, params = []) {
  // Конвертируем ? в $1, $2, $3 для PostgreSQL
  let paramIndex = 1
  const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)
  
  const client = await pool.connect()
  try {
    const result = await client.query(pgSql, params)
    return result.rows
  } finally {
    client.release()
  }
}
