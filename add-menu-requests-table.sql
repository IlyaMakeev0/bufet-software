-- Таблица для запросов на добавление блюд в меню
CREATE TABLE IF NOT EXISTS menu_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  meal_type TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'ожидает',
  admin_comment TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_menu_requests_status ON menu_requests(status);

SELECT 'Таблица menu_requests создана!' as result;
