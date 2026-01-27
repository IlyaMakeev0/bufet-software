// Генерация хешей паролей для тестовых аккаунтов
import bcrypt from 'bcryptjs'

const password = 'test123'

async function generateHash() {
  const hash = await bcrypt.hash(password, 10)
  console.log('Пароль:', password)
  console.log('Хеш:', hash)
  console.log('\nИспользуйте этот хеш в SQL скрипте create-test-accounts.sql')
}

generateHash()
