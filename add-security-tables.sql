-- Добавление таблиц для полной безопасности

-- 1. Таблица логов транзакций (если еще не создана)
CREATE TABLE IF NOT EXISTS transaction_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'payment', 'refund', 'subscription')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  related_id TEXT,
  ip_address TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_id ON transaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_type ON transaction_logs(type);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_idempotency ON transaction_logs(idempotency_key);

-- 2. Таблица попыток входа (для отслеживания брутфорса)
CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);

-- 3. Таблица сессий (для JWT refresh tokens в БД)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- 4. Таблица кодов 2FA (для хранения в БД вместо памяти)
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires_at ON two_factor_codes(expires_at);

-- 5. Таблица аудита действий (для критичных операций)
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- 6. Добавление полей для шифрования в users (если нужно)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_encrypted TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_hash TEXT;

-- Комментарии
COMMENT ON TABLE transaction_logs IS 'Логи всех финансовых транзакций';
COMMENT ON TABLE login_attempts IS 'История попыток входа для защиты от брутфорса';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh токены для безопасной аутентификации';
COMMENT ON TABLE two_factor_codes IS 'Коды двухфакторной аутентификации';
COMMENT ON TABLE audit_log IS 'Аудит критичных действий пользователей';

-- Очистка старых записей (можно запускать периодически)
-- DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days';
-- DELETE FROM two_factor_codes WHERE expires_at < NOW();
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE;
