-- Создание недостающих таблиц для системы склада

-- 1. Таблица inventory (склад)
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity DECIMAL(10, 2) DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица purchase_requests (заявки на закупку)
CREATE TABLE IF NOT EXISTS purchase_requests (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  urgency TEXT DEFAULT 'обычная',
  status TEXT DEFAULT 'ожидает',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Таблица menu_ingredients (ингредиенты блюд)
CREATE TABLE IF NOT EXISTS menu_ingredients (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
);

-- 4. Таблица inventory_log (история изменений склада)
CREATE TABLE IF NOT EXISTS inventory_log (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  action TEXT NOT NULL,
  quantity_change DECIMAL(10, 2) NOT NULL,
  quantity_before DECIMAL(10, 2) NOT NULL,
  quantity_after DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Вывод результата
SELECT 'Таблицы успешно созданы!' as result;
