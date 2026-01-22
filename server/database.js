import initSqlJs from 'sql.js'
import fs from 'fs'

let db

async function initDatabase() {
  const SQL = await initSqlJs()
  
  // Попытка загрузить существующую БД
  try {
    const buffer = fs.readFileSync('canteen.db')
    db = new SQL.Database(buffer)
    console.log('База данных загружена')
  } catch {
    // Создать новую БД
    db = new SQL.Database()
    console.log('Создана новая база данных')
    
    // Создание таблиц
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'cook', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS allergens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        allergen TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('breakfast', 'lunch')),
        price REAL NOT NULL,
        allergens TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('single', 'subscription')),
        meal_type TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        min_quantity REAL NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cook_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cook_id) REFERENCES users(id)
      );
    `)
    
    saveDatabase()
  }
  
  return db
}

function saveDatabase() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync('canteen.db', buffer)
}

// Обертки для совместимости с better-sqlite3 API
export const prepare = (sql) => ({
  run: (...params) => {
    db.run(sql, params)
    saveDatabase()
    return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] }
  },
  get: (...params) => {
    const result = db.exec(sql, params)
    if (!result[0]) return null
    const cols = result[0].columns
    const vals = result[0].values[0]
    if (!vals) return null
    const obj = {}
    cols.forEach((col, i) => obj[col] = vals[i])
    return obj
  },
  all: (...params) => {
    const result = db.exec(sql, params)
    if (!result[0]) return []
    const cols = result[0].columns
    return result[0].values.map(vals => {
      const obj = {}
      cols.forEach((col, i) => obj[col] = vals[i])
      return obj
    })
  }
})

export const exec = (sql) => {
  db.run(sql)
  saveDatabase()
}

export default { prepare, exec, init: initDatabase }
