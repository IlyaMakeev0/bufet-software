// Универсальный адаптер базы данных
// Автоматически выбирает PostgreSQL или SQLite в зависимости от окружения

let dbModule;

// Проверяем, используется ли PostgreSQL (Docker окружение)
if (process.env.DB_HOST) {
  console.log('📊 Using PostgreSQL database adapter')
  dbModule = await import('./database-postgres.js')
} else {
  console.log('📊 Using SQLite database adapter')
  dbModule = await import('./database.js')
}

// Экспортируем все функции из выбранного модуля
export const { getDb, initDatabase, runQuery, getQuery, allQuery } = dbModule
