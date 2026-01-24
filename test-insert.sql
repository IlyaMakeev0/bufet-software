CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) 
SELECT uuid_generate_v4()::text, id, 'Овсяные хлопья', 0.08, 'кг' 
FROM menu 
WHERE name = 'Каша овсяная с ягодами' 
LIMIT 1;

SELECT 'Добавлено: ' || COUNT(*) FROM menu_ingredients;
