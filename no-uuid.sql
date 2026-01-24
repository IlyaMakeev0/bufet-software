-- Без uuid_generate_v4
WITH menu_item AS (
  SELECT id FROM menu WHERE name = 'Каша овсяная с ягодами' LIMIT 1
)
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT 'test-id-123', menu_item.id, 'Овсяные хлопья', 0.08, 'кг'
FROM menu_item;

SELECT 'Добавлено: ' || COUNT(*) FROM menu_ingredients;
