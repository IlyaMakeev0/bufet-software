import database from './database.js'
import bcrypt from 'bcryptjs'

await database.init()

// Очистка данных
database.exec(`
  DELETE FROM users;
  DELETE FROM menu_items;
  DELETE FROM inventory;
`)

// Создание тестовых пользователей
const password = await bcrypt.hash('123456', 10)

database.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
  'Иван Иванов', 'student@test.ru', password, 'student'
)

database.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
  'Мария Петрова', 'cook@test.ru', password, 'cook'
)

database.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
  'Администратор', 'admin@test.ru', password, 'admin'
)

// Добавление меню
const menuItems = [
  ['Каша овсяная', 'breakfast', 50, 'глютен'],
  ['Омлет', 'breakfast', 60, 'яйца'],
  ['Блины', 'breakfast', 55, 'глютен,яйца,молоко'],
  ['Борщ', 'lunch', 80, ''],
  ['Котлета с пюре', 'lunch', 120, 'глютен'],
  ['Рыба с рисом', 'lunch', 130, 'рыба'],
  ['Салат овощной', 'lunch', 45, '']
]

menuItems.forEach(item => {
  database.prepare('INSERT INTO menu_items (name, type, price, allergens) VALUES (?, ?, ?, ?)').run(...item)
})

// Добавление остатков
const inventory = [
  ['Мука', 10, 'кг', 5],
  ['Молоко', 3, 'л', 5],
  ['Яйца', 50, 'шт', 30],
  ['Картофель', 25, 'кг', 10],
  ['Мясо', 8, 'кг', 5],
  ['Рыба', 6, 'кг', 3]
]

inventory.forEach(item => {
  database.prepare('INSERT INTO inventory (product_name, quantity, unit, min_quantity) VALUES (?, ?, ?, ?)').run(...item)
})

console.log('Тестовые данные добавлены!')
console.log('\nТестовые аккаунты:')
console.log('Ученик: student@test.ru / 123456')
console.log('Повар: cook@test.ru / 123456')
console.log('Админ: admin@test.ru / 123456')

process.exit(0)
