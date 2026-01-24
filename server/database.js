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
    // Проверяем, существует ли таблица inventory (ключевая для новой системы)
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory'
      );
    `)
    
    const inventoryExists = tableCheck.rows[0].exists
    
    if (inventoryExists === true) {
      console.log('✅ Database already initialized, skipping...')
      
      // Проверим количество пользователей
      const userCount = await client.query('SELECT COUNT(*) FROM users')
      console.log(`📊 Current users count: ${userCount.rows[0].count}`)
      
      // Проверим количество продуктов на складе
      const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory')
      console.log(`📦 Inventory items: ${inventoryCount.rows[0].count}`)
      
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

    // Create inventory table
    await client.query(`
      CREATE TABLE inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        min_quantity DECIMAL(10, 2) DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create purchase_requests table
    await client.query(`
      CREATE TABLE purchase_requests (
        id TEXT PRIMARY KEY,
        item TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit TEXT NOT NULL,
        urgency TEXT DEFAULT 'обычная',
        status TEXT DEFAULT 'ожидает',
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Create menu_ingredients table (связь блюд с ингредиентами)
    await client.query(`
      CREATE TABLE menu_ingredients (
        id TEXT PRIMARY KEY,
        menu_id TEXT NOT NULL,
        ingredient_name TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
      )
    `)

    // Create inventory_log table (история изменений склада)
    await client.query(`
      CREATE TABLE inventory_log (
        id TEXT PRIMARY KEY,
        inventory_id TEXT NOT NULL,
        action TEXT NOT NULL,
        quantity_change DECIMAL(10, 2) NOT NULL,
        quantity_before DECIMAL(10, 2) NOT NULL,
        quantity_after DECIMAL(10, 2) NOT NULL,
        reason TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_id) REFERENCES inventory(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Add sample inventory items
    const inventoryItems = [
      { name: 'Овсяные хлопья', quantity: 50, unit: 'кг', min_quantity: 10 },
      { name: 'Молоко', quantity: 100, unit: 'л', min_quantity: 20 },
      { name: 'Ягоды замороженные', quantity: 30, unit: 'кг', min_quantity: 5 },
      { name: 'Мёд', quantity: 15, unit: 'кг', min_quantity: 3 },
      { name: 'Творог', quantity: 40, unit: 'кг', min_quantity: 10 },
      { name: 'Яйца', quantity: 500, unit: 'шт', min_quantity: 100 },
      { name: 'Мука пшеничная', quantity: 80, unit: 'кг', min_quantity: 15 },
      { name: 'Сахар', quantity: 60, unit: 'кг', min_quantity: 10 },
      { name: 'Сметана', quantity: 25, unit: 'кг', min_quantity: 5 },
      { name: 'Ветчина', quantity: 20, unit: 'кг', min_quantity: 5 },
      { name: 'Сыр', quantity: 15, unit: 'кг', min_quantity: 3 },
      { name: 'Зелень', quantity: 10, unit: 'кг', min_quantity: 2 },
      { name: 'Курица', quantity: 60, unit: 'кг', min_quantity: 15 },
      { name: 'Лапша', quantity: 25, unit: 'кг', min_quantity: 5 },
      { name: 'Морковь', quantity: 40, unit: 'кг', min_quantity: 10 },
      { name: 'Лук', quantity: 35, unit: 'кг', min_quantity: 8 },
      { name: 'Гречка', quantity: 45, unit: 'кг', min_quantity: 10 },
      { name: 'Говядина', quantity: 50, unit: 'кг', min_quantity: 12 },
      { name: 'Свинина', quantity: 40, unit: 'кг', min_quantity: 10 },
      { name: 'Хлеб', quantity: 100, unit: 'шт', min_quantity: 20 },
      { name: 'Рис', quantity: 55, unit: 'кг', min_quantity: 12 },
      { name: 'Масло растительное', quantity: 30, unit: 'л', min_quantity: 8 },
      { name: 'Помидоры', quantity: 25, unit: 'кг', min_quantity: 5 },
      { name: 'Огурцы', quantity: 20, unit: 'кг', min_quantity: 5 },
      { name: 'Перец болгарский', quantity: 15, unit: 'кг', min_quantity: 3 },
      { name: 'Изюм', quantity: 10, unit: 'кг', min_quantity: 2 },
      { name: 'Йогурт', quantity: 50, unit: 'л', min_quantity: 10 },
      { name: 'Яблоки', quantity: 30, unit: 'кг', min_quantity: 8 },
      { name: 'Бананы', quantity: 25, unit: 'кг', min_quantity: 5 },
      { name: 'Киви', quantity: 15, unit: 'кг', min_quantity: 3 }
    ]

    for (const item of inventoryItems) {
      await client.query(`
        INSERT INTO inventory (id, name, quantity, unit, min_quantity)
        VALUES ($1, $2, $3, $4, $5)
      `, [uuidv4(), item.name, item.quantity, item.unit, item.min_quantity])
    }

    // Add sample menu for 30 days
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Breakfast 1: Каша овсяная с ягодами
      const breakfast1Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [breakfast1Id, dateStr, 'Каша овсяная с ягодами', 'Полезный завтрак. Состав: овсяные хлопья, молоко, ягоды (клубника, черника), мёд', 120, 'завтрак'])
      
      // Ингредиенты для каши
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast1Id, 'Овсяные хлопья', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast1Id, 'Молоко', 0.2, 'л'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast1Id, 'Ягоды замороженные', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast1Id, 'Мёд', 0.02, 'кг'])
      
      // Breakfast 2: Сырники со сметаной
      const breakfast2Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [breakfast2Id, dateStr, 'Сырники со сметаной', 'Домашние сырники. Состав: творог, яйца, мука, сахар, сметана', 140, 'завтрак'])
      
      // Ингредиенты для сырников
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast2Id, 'Творог', 0.15, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast2Id, 'Яйца', 2, 'шт'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast2Id, 'Мука пшеничная', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast2Id, 'Сахар', 0.03, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast2Id, 'Сметана', 0.05, 'кг'])
      
      // Breakfast 3: Омлет с ветчиной
      const breakfast3Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [breakfast3Id, dateStr, 'Омлет с ветчиной', 'Сытный завтрак. Состав: яйца, молоко, ветчина, сыр, зелень', 150, 'завтрак'])
      
      // Ингредиенты для омлета
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast3Id, 'Яйца', 3, 'шт'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast3Id, 'Молоко', 0.1, 'л'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast3Id, 'Ветчина', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast3Id, 'Сыр', 0.04, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), breakfast3Id, 'Зелень', 0.01, 'кг'])

      // Lunch 1: Суп куриный с лапшой
      const lunch1Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [lunch1Id, dateStr, 'Суп куриный с лапшой', 'Ароматный суп. Состав: курица, лапша, морковь, лук, зелень', 150, 'обед'])
      
      // Ингредиенты для супа
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch1Id, 'Курица', 0.15, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch1Id, 'Лапша', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch1Id, 'Морковь', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch1Id, 'Лук', 0.03, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch1Id, 'Зелень', 0.01, 'кг'])
      
      // Lunch 2: Гречка с котлетой
      const lunch2Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [lunch2Id, dateStr, 'Гречка с котлетой', 'Сытный обед. Состав: гречка, котлета (говядина, свинина), лук, яйца, хлеб', 180, 'обед'])
      
      // Ингредиенты для гречки с котлетой
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Гречка', 0.12, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Говядина', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Свинина', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Лук', 0.03, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Яйца', 1, 'шт'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch2Id, 'Хлеб', 0.5, 'шт'])
      
      // Lunch 3: Плов с говядиной
      const lunch3Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [lunch3Id, dateStr, 'Плов с говядиной', 'Традиционный плов. Состав: рис, говядина, морковь, лук, масло растительное', 200, 'обед'])
      
      // Ингредиенты для плова
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch3Id, 'Рис', 0.15, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch3Id, 'Говядина', 0.12, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch3Id, 'Морковь', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch3Id, 'Лук', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch3Id, 'Масло растительное', 0.05, 'л'])
      
      // Lunch 4: Салат овощной
      const lunch4Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [lunch4Id, dateStr, 'Салат овощной', 'Свежие овощи. Состав: помидоры, огурцы, перец, лук, масло растительное', 90, 'обед'])
      
      // Ингредиенты для салата
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch4Id, 'Помидоры', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch4Id, 'Огурцы', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch4Id, 'Перец болгарский', 0.05, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch4Id, 'Лук', 0.02, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), lunch4Id, 'Масло растительное', 0.02, 'л'])

      // Snack 1: Творожная запеканка
      const snack1Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [snack1Id, dateStr, 'Творожная запеканка', 'Нежный десерт. Состав: творог, яйца, сахар, мука, изюм', 130, 'полдник'])
      
      // Ингредиенты для запеканки
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack1Id, 'Творог', 0.12, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack1Id, 'Яйца', 2, 'шт'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack1Id, 'Сахар', 0.04, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack1Id, 'Мука пшеничная', 0.03, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack1Id, 'Изюм', 0.02, 'кг'])
      
      // Snack 2: Йогурт с фруктами
      const snack2Id = uuidv4()
      await client.query(`
        INSERT INTO menu (id, day, name, description, price, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [snack2Id, dateStr, 'Йогурт с фруктами', 'Легкий полдник. Состав: йогурт, фрукты (яблоко, банан, киви), мёд', 100, 'полдник'])
      
      // Ингредиенты для йогурта
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack2Id, 'Йогурт', 0.2, 'л'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack2Id, 'Яблоки', 0.08, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack2Id, 'Бананы', 0.06, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack2Id, 'Киви', 0.04, 'кг'])
      await client.query(`INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), snack2Id, 'Мёд', 0.02, 'кг'])
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
