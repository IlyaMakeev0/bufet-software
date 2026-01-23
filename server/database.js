import sqlite3 from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'

const db = new sqlite3.Database('./school_canteen.db')

export function getDb() {
  return db
}

export function initDatabase() {
  console.log('🔄 Initializing database...')

  db.serialize(() => {
    // Drop existing tables
    db.run('DROP TABLE IF EXISTS subscriptions')
    db.run('DROP TABLE IF EXISTS issued_meals')
    db.run('DROP TABLE IF EXISTS reviews')
    db.run('DROP TABLE IF EXISTS orders')
    db.run('DROP TABLE IF EXISTS menu')
    db.run('DROP TABLE IF EXISTS users')

    // Create users table
    db.run(`
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
        balance REAL DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create menu table
    db.run(`
      CREATE TABLE menu (
        id TEXT PRIMARY KEY,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        meal_type TEXT NOT NULL,
        available BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create orders table
    db.run(`
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
    db.run(`
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
    db.run(`
      CREATE TABLE subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        menu_id TEXT NOT NULL,
        selected_dates TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'активен',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_id) REFERENCES menu(id)
      )
    `)

    // Create issued_meals table
    db.run(`
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
    const stmt = db.prepare(`
      INSERT INTO menu (id, day, name, description, price, meal_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Breakfast
      stmt.run(uuidv4(), dateStr, 'Каша овсяная с ягодами', 'Полезный завтрак', 120, 'завтрак')
      stmt.run(uuidv4(), dateStr, 'Сырники со сметаной', 'Домашние сырники', 140, 'завтрак')
      stmt.run(uuidv4(), dateStr, 'Омлет с ветчиной', 'Сытный завтрак', 150, 'завтрак')

      // Lunch
      stmt.run(uuidv4(), dateStr, 'Суп куриный с лапшой', 'Ароматный суп', 150, 'обед')
      stmt.run(uuidv4(), dateStr, 'Гречка с котлетой', 'Сытный обед', 180, 'обед')
      stmt.run(uuidv4(), dateStr, 'Плов с говядиной', 'Традиционный плов', 200, 'обед')
      stmt.run(uuidv4(), dateStr, 'Салат овощной', 'Свежие овощи', 90, 'обед')

      // Snack
      stmt.run(uuidv4(), dateStr, 'Творожная запеканка', 'Нежный десерт', 130, 'полдник')
      stmt.run(uuidv4(), dateStr, 'Йогурт с фруктами', 'Легкий полдник', 100, 'полдник')
    }

    stmt.finalize()

    console.log('✅ Database initialized successfully!')
  })
}

export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}
