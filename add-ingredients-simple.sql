-- Простое добавление ингредиентов

-- Каша овсяная
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Овсяные хлопья', 0.08, 'кг' FROM menu WHERE name LIKE '%Каша овсяная%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Молоко', 0.2, 'л' FROM menu WHERE name LIKE '%Каша овсяная%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Ягоды замороженные', 0.05, 'кг' FROM menu WHERE name LIKE '%Каша овсяная%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Мёд', 0.02, 'кг' FROM menu WHERE name LIKE '%Каша овсяная%';

-- Сырники
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Творог', 0.15, 'кг' FROM menu WHERE name LIKE '%Сырники%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Яйца', 2, 'шт' FROM menu WHERE name LIKE '%Сырники%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Мука пшеничная', 0.05, 'кг' FROM menu WHERE name LIKE '%Сырники%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Сахар', 0.03, 'кг' FROM menu WHERE name LIKE '%Сырники%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Сметана', 0.05, 'кг' FROM menu WHERE name LIKE '%Сырники%';

-- Омлет
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Яйца', 3, 'шт' FROM menu WHERE name LIKE '%Омлет%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Молоко', 0.1, 'л' FROM menu WHERE name LIKE '%Омлет%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Ветчина', 0.08, 'кг' FROM menu WHERE name LIKE '%Омлет%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Сыр', 0.04, 'кг' FROM menu WHERE name LIKE '%Омлет%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Зелень', 0.01, 'кг' FROM menu WHERE name LIKE '%Омлет%';

-- Суп куриный
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Курица', 0.15, 'кг' FROM menu WHERE name LIKE '%Суп куриный%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Лапша', 0.08, 'кг' FROM menu WHERE name LIKE '%Суп куриный%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Морковь', 0.05, 'кг' FROM menu WHERE name LIKE '%Суп куриный%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Лук', 0.03, 'кг' FROM menu WHERE name LIKE '%Суп куриный%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Зелень', 0.01, 'кг' FROM menu WHERE name LIKE '%Суп куриный%';

-- Гречка с котлетой
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Гречка', 0.12, 'кг' FROM menu WHERE name LIKE '%Гречка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Говядина', 0.08, 'кг' FROM menu WHERE name LIKE '%Гречка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Свинина', 0.05, 'кг' FROM menu WHERE name LIKE '%Гречка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Лук', 0.03, 'кг' FROM menu WHERE name LIKE '%Гречка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Яйца', 1, 'шт' FROM menu WHERE name LIKE '%Гречка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Хлеб', 0.5, 'шт' FROM menu WHERE name LIKE '%Гречка%';

-- Плов
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Рис', 0.15, 'кг' FROM menu WHERE name LIKE '%Плов%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Говядина', 0.12, 'кг' FROM menu WHERE name LIKE '%Плов%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Морковь', 0.08, 'кг' FROM menu WHERE name LIKE '%Плов%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Лук', 0.05, 'кг' FROM menu WHERE name LIKE '%Плов%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Масло растительное', 0.05, 'л' FROM menu WHERE name LIKE '%Плов%';

-- Салат
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Помидоры', 0.08, 'кг' FROM menu WHERE name LIKE '%Салат%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Огурцы', 0.08, 'кг' FROM menu WHERE name LIKE '%Салат%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Перец болгарский', 0.05, 'кг' FROM menu WHERE name LIKE '%Салат%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Лук', 0.02, 'кг' FROM menu WHERE name LIKE '%Салат%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Масло растительное', 0.02, 'л' FROM menu WHERE name LIKE '%Салат%';

-- Запеканка
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Творог', 0.12, 'кг' FROM menu WHERE name LIKE '%запеканка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Яйца', 2, 'шт' FROM menu WHERE name LIKE '%запеканка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Сахар', 0.04, 'кг' FROM menu WHERE name LIKE '%запеканка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Мука пшеничная', 0.03, 'кг' FROM menu WHERE name LIKE '%запеканка%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Изюм', 0.02, 'кг' FROM menu WHERE name LIKE '%запеканка%';

-- Йогурт
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Йогурт', 0.2, 'л' FROM menu WHERE name LIKE '%Йогурт%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Яблоки', 0.08, 'кг' FROM menu WHERE name LIKE '%Йогурт%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Бананы', 0.06, 'кг' FROM menu WHERE name LIKE '%Йогурт%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Киви', 0.04, 'кг' FROM menu WHERE name LIKE '%Йогурт%';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT gen_random_uuid()::text, id, 'Мёд', 0.02, 'кг' FROM menu WHERE name LIKE '%Йогурт%';

-- Проверка
SELECT 'Добавлено ингредиентов: ' || COUNT(*) as result FROM menu_ingredients;
