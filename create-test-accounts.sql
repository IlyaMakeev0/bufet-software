-- Создание тестовых аккаунтов с предварительной верификацией
-- Эти аккаунты можно использовать для входа без получения письма

-- Добавляем поле email_verified если его нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Тестовый студент
INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    phone, 
    class_name, 
    role, 
    balance, 
    allergies, 
    food_preferences,
    email_verified
) VALUES (
    'test-student-001',
    'student@test.com',
    '$2a$10$x4ikodd/7XWDK/VK5G4StOVMRYgCkPeNcNaAQDP9Qski.5TOuXEPG',  -- Пароль: test123
    'Тест',
    'Студентов',
    '+7 (900) 123-45-67',
    '10А',
    'student',
    5000.00,
    'Нет аллергий',
    'Без предпочтений',
    true
) ON CONFLICT (email) DO UPDATE SET
    email_verified = true,
    balance = 5000.00;

-- Тестовый повар
INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    phone, 
    role, 
    position,
    email_verified
) VALUES (
    'test-chef-001',
    'chef@test.com',
    '$2a$10$x4ikodd/7XWDK/VK5G4StOVMRYgCkPeNcNaAQDP9Qski.5TOuXEPG',  -- Пароль: test123
    'Тест',
    'Поваров',
    '+7 (900) 234-56-78',
    'chef',
    'Старший повар',
    true
) ON CONFLICT (email) DO UPDATE SET
    email_verified = true;

-- Тестовый администратор
INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    phone, 
    role, 
    position,
    email_verified
) VALUES (
    'test-admin-001',
    'admin@test.com',
    '$2a$10$x4ikodd/7XWDK/VK5G4StOVMRYgCkPeNcNaAQDP9Qski.5TOuXEPG',  -- Пароль: test123
    'Тест',
    'Администраторов',
    '+7 (900) 345-67-89',
    'admin',
    'Главный администратор',
    true
) ON CONFLICT (email) DO UPDATE SET
    email_verified = true;

-- Дополнительные тестовые студенты
INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    phone, 
    class_name, 
    role, 
    balance,
    email_verified
) VALUES 
(
    'test-student-002',
    'student2@test.com',
    '$2a$10$x4ikodd/7XWDK/VK5G4StOVMRYgCkPeNcNaAQDP9Qski.5TOuXEPG',
    'Мария',
    'Иванова',
    '+7 (900) 456-78-90',
    '9Б',
    'student',
    3000.00,
    true
),
(
    'test-student-003',
    'student3@test.com',
    '$2a$10$x4ikodd/7XWDK/VK5G4StOVMRYgCkPeNcNaAQDP9Qski.5TOuXEPG',
    'Петр',
    'Сидоров',
    '+7 (900) 567-89-01',
    '11В',
    'student',
    2500.00,
    true
)
ON CONFLICT (email) DO UPDATE SET
    email_verified = true;

-- Вывод информации о созданных аккаунтах
SELECT 
    'Тестовые аккаунты созданы!' as message,
    COUNT(*) as total_verified_users
FROM users 
WHERE email_verified = true;

-- Показать все тестовые аккаунты
SELECT 
    email,
    first_name,
    last_name,
    role,
    class_name,
    balance,
    email_verified
FROM users 
WHERE email LIKE '%@test.com'
ORDER BY role, email;
