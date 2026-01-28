-- Таблица для логирования всех финансовых транзакций

CREATE TABLE IF NOT EXISTS transaction_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'payment', 'refund', 'subscription')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  related_id TEXT, -- ID связанного заказа/подписки
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_id ON transaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_type ON transaction_logs(type);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);

-- Комментарии
COMMENT ON TABLE transaction_logs IS 'Логи всех финансовых транзакций для аудита';
COMMENT ON COLUMN transaction_logs.type IS 'Тип транзакции: topup (пополнение), payment (оплата), refund (возврат), subscription (подписка)';
COMMENT ON COLUMN transaction_logs.balance_before IS 'Баланс до транзакции';
COMMENT ON COLUMN transaction_logs.balance_after IS 'Баланс после транзакции';
COMMENT ON COLUMN transaction_logs.related_id IS 'ID связанного объекта (заказ, подписка)';
