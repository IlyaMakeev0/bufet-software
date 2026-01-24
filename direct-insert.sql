CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Прямая вставка с конкретным ID
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) 
VALUES (uuid_generate_v4()::text, '30618443-18dd-4283-90e5-3413a405a92c', 'Овсяные хлопья', 0.08, 'кг');

SELECT 'Добавлено: ' || COUNT(*) FROM menu_ingredients;
