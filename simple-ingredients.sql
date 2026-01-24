-- Простое добавление ингредиентов без циклов
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Получаем ID первого блюда каждого типа и вставляем ингредиенты

-- Каша (берем первые 5 блюд)
WITH kasha_ids AS (
  SELECT id FROM menu WHERE name = 'Каша овсяная с ягодами' LIMIT 5
)
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Овсяные хлопья', 0.08, 'кг' FROM kasha_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Молоко', 0.2, 'л' FROM kasha_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Ягоды замороженные', 0.05, 'кг' FROM kasha_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Мёд', 0.02, 'кг' FROM kasha_ids;

-- Сырники
WITH syrniki_ids AS (
  SELECT id FROM menu WHERE name = 'Сырники со сметаной' LIMIT 5
)
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Творог', 0.15, 'кг' FROM syrniki_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Яйца', 2, 'шт' FROM syrniki_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Мука пшеничная', 0.05, 'кг' FROM syrniki_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Сахар', 0.03, 'кг' FROM syrniki_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Сметана', 0.05, 'кг' FROM syrniki_ids;

-- Омлет
WITH omlet_ids AS (
  SELECT id FROM menu WHERE name = 'Омлет с ветчиной' LIMIT 5
)
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яйца', 3, 'шт' FROM omlet_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Молоко', 0.1, 'л' FROM omlet_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Ветчина', 0.08, 'кг' FROM omlet_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Сыр', 0.04, 'кг' FROM omlet_ids
UNION ALL
SELECT uuid_generate_v4()::text, id, 'Зелень', 0.01, 'кг' FROM omlet_ids;

SELECT 'Добавлено ингредиентов: ' || COUNT(*) as result FROM menu_ingredients;
