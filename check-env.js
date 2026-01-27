// Проверка переменных окружения для деплоя
console.log('🔍 Проверка переменных окружения...\n')

const required = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
]

const optional = [
  'NODE_ENV',
  'PORT',
  'SESSION_SECRET',
  'DATABASE_URL',
  'FRONTEND_URL'
]

let hasErrors = false

console.log('📋 Обязательные переменные:')
required.forEach(key => {
  const value = process.env[key]
  if (value) {
    console.log(`  ✅ ${key}: ${key.includes('PASSWORD') ? '***' : value}`)
  } else {
    console.log(`  ❌ ${key}: НЕ ЗАДАНА`)
    hasErrors = true
  }
})

console.log('\n📋 Опциональные переменные:')
optional.forEach(key => {
  const value = process.env[key]
  if (value) {
    console.log(`  ✅ ${key}: ${key.includes('SECRET') ? '***' : value}`)
  } else {
    console.log(`  ⚠️  ${key}: не задана (будет использовано значение по умолчанию)`)
  }
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('❌ ОШИБКА: Не все обязательные переменные заданы!')
  console.log('\nДобавьте их в Render Dashboard → Environment Variables')
  process.exit(1)
} else {
  console.log('✅ Все обязательные переменные заданы!')
  console.log('🚀 Готово к запуску!')
}
