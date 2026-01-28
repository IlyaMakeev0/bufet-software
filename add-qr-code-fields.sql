-- Добавление полей для QR-кодов в таблицы orders и subscriptions

-- Добавляем поля для QR-кодов в таблицу orders
ALTER TABLE orders ADD COLUMN qr_token TEXT;
ALTER TABLE orders ADD COLUMN qr_expires_at TEXT;
ALTER TABLE orders ADD COLUMN issued_at TEXT;
ALTER TABLE orders ADD COLUMN issued_by INTEGER;

-- Добавляем поля для QR-кодов в таблицу subscriptions
ALTER TABLE subscriptions ADD COLUMN qr_token TEXT;
ALTER TABLE subscriptions ADD COLUMN qr_expires_at TEXT;

-- Создаем индексы для быстрого поиска по токенам
CREATE INDEX IF NOT EXISTS idx_orders_qr_token ON orders(qr_token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_qr_token ON subscriptions(qr_token);

-- Комментарии к полям:
-- qr_token: Уникальный токен для QR-кода (64 символа hex)
-- qr_expires_at: Дата истечения QR-кода (24 часа для заказов, 7 дней для абонементов)
-- issued_at: Дата и время выдачи заказа
-- issued_by: ID повара, который выдал заказ
