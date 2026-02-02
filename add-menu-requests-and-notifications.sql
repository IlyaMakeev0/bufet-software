-- Create menu_requests table for PostgreSQL
CREATE TABLE IF NOT EXISTS menu_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  meal_type TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  status TEXT DEFAULT 'ожидает',
  admin_comment TEXT,
  created_by TEXT NOT NULL,
  reviewed_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create notifications table for PostgreSQL
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_requests_created_by ON menu_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_menu_requests_status ON menu_requests(status);
CREATE INDEX IF NOT EXISTS idx_menu_requests_created_at ON menu_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Add menu_ingredients table if not exists
CREATE TABLE IF NOT EXISTS menu_ingredients (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_ingredients_menu_id ON menu_ingredients(menu_id);

-- Add inventory table if not exists
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  min_quantity DECIMAL(10, 2) DEFAULT 10,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);

-- Add inventory_log table if not exists
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
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_log_inventory_id ON inventory_log(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON inventory_log(created_at);

-- Add purchase_requests table if not exists
CREATE TABLE IF NOT EXISTS purchase_requests (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  urgency TEXT DEFAULT 'обычная',
  status TEXT DEFAULT 'ожидает',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_by ON purchase_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at);

-- Add QR code fields to orders table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='qr_token') THEN
    ALTER TABLE orders ADD COLUMN qr_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='qr_expires_at') THEN
    ALTER TABLE orders ADD COLUMN qr_expires_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='issued_at') THEN
    ALTER TABLE orders ADD COLUMN issued_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='issued_by') THEN
    ALTER TABLE orders ADD COLUMN issued_by TEXT;
  END IF;
END $$;

-- Add QR code fields to subscriptions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscriptions' AND column_name='qr_token') THEN
    ALTER TABLE subscriptions ADD COLUMN qr_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscriptions' AND column_name='qr_expires_at') THEN
    ALTER TABLE subscriptions ADD COLUMN qr_expires_at TIMESTAMP;
  END IF;
END $$;

-- Add verification fields to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='is_verified') THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='verification_token') THEN
    ALTER TABLE users ADD COLUMN verification_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='verification_expires') THEN
    ALTER TABLE users ADD COLUMN verification_expires TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='reset_token') THEN
    ALTER TABLE users ADD COLUMN reset_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='reset_expires') THEN
    ALTER TABLE users ADD COLUMN reset_expires TIMESTAMP;
  END IF;
END $$;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ All tables and columns created successfully!';
END $$;
