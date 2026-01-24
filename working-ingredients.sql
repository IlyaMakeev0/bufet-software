-- Рабочий скрипт добавления ингредиентов
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Очистка
DELETE FROM menu_ingredients;

-- Каша овсяная (для всех 30 блюд)
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Овсяные хлопья', 0.08, 'кг' FROM menu WHERE name = 'Каша овсяная с ягодами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Молоко', 0.2, 'л' FROM menu WHERE name = 'Каша овсяная с ягодами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Ягоды замороженные', 0.05, 'кг' FROM menu WHERE name = 'Каша овсяная с ягодами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Мёд', 0.02, 'кг' FROM menu WHERE name = 'Каша овсяная с ягодами';

-- Сырники
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Творог', 0.15, 'кг' FROM menu WHERE name = 'Сырники со сметаной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яйца', 2, 'шт' FROM menu WHERE name = 'Сырники со сметаной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Мука пшеничная', 0.05, 'кг' FROM menu WHERE name = 'Сырники со сметаной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Сахар', 0.03, 'кг' FROM menu WHERE name = 'Сырники со сметаной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Сметана', 0.05, 'кг' FROM menu WHERE name = 'Сырники со сметаной';

-- Омлет
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яйца', 3, 'шт' FROM menu WHERE name = 'Омлет с ветчиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Молоко', 0.1, 'л' FROM menu WHERE name = 'Омлет с ветчиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Ветчина', 0.08, 'кг' FROM menu WHERE name = 'Омлет с ветчиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Сыр', 0.04, 'кг' FROM menu WHERE name = 'Омлет с ветчиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Зелень', 0.01, 'кг' FROM menu WHERE name = 'Омлет с ветчиной';

-- Суп куриный
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Курица', 0.15, 'кг' FROM menu WHERE name = 'Суп куриный с лапшой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Лапша', 0.08, 'кг' FROM menu WHERE name = 'Суп куриный с лапшой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Морковь', 0.05, 'кг' FROM menu WHERE name = 'Суп куриный с лапшой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Лук', 0.03, 'кг' FROM menu WHERE name = 'Суп куриный с лапшой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Зелень', 0.01, 'кг' FROM menu WHERE name = 'Суп куриный с лапшой';

-- Гречка с котлетой
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Гречка', 0.12, 'кг' FROM menu WHERE name = 'Гречка с котлетой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Говядина', 0.08, 'кг' FROM menu WHERE name = 'Гречка с котлетой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Свинина', 0.05, 'кг' FROM menu WHERE name = 'Гречка с котлетой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Лук', 0.03, 'кг' FROM menu WHERE name = 'Гречка с котлетой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яйца', 1, 'шт' FROM menu WHERE name = 'Гречка с котлетой';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Хлеб', 0.5, 'шт' FROM menu WHERE name = 'Гречка с котлетой';

-- Плов
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Рис', 0.15, 'кг' FROM menu WHERE name = 'Плов с говядиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Говядина', 0.12, 'кг' FROM menu WHERE name = 'Плов с говядиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Морковь', 0.08, 'кг' FROM menu WHERE name = 'Плов с говядиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Лук', 0.05, 'кг' FROM menu WHERE name = 'Плов с говядиной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Масло растительное', 0.05, 'л' FROM menu WHERE name = 'Плов с говядиной';

-- Салат овощной
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Помидоры', 0.08, 'кг' FROM menu WHERE name = 'Салат овощной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Огурцы', 0.08, 'кг' FROM menu WHERE name = 'Салат овощной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Перец болгарский', 0.05, 'кг' FROM menu WHERE name = 'Салат овощной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Лук', 0.02, 'кг' FROM menu WHERE name = 'Салат овощной';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Масло растительное', 0.02, 'л' FROM menu WHERE name = 'Салат овощной';

-- Творожная запеканка
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Творог', 0.12, 'кг' FROM menu WHERE name = 'Творожная запеканка';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яйца', 2, 'шт' FROM menu WHERE name = 'Творожная запеканка';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Сахар', 0.04, 'кг' FROM menu WHERE name = 'Творожная запеканка';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Мука пшеничная', 0.03, 'кг' FROM menu WHERE name = 'Творожная запеканка';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Изюм', 0.02, 'кг' FROM menu WHERE name = 'Творожная запеканка';

-- Йогурт с фруктами
INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Йогурт', 0.2, 'л' FROM menu WHERE name = 'Йогурт с фруктами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Яблоки', 0.08, 'кг' FROM menu WHERE name = 'Йогурт с фруктами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Бананы', 0.06, 'кг' FROM menu WHERE name = 'Йогурт с фруктами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Киви', 0.04, 'кг' FROM menu WHERE name = 'Йогурт с фруктами';

INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit)
SELECT uuid_generate_v4()::text, id, 'Мёд', 0.02, 'кг' FROM menu WHERE name = 'Йогурт с фруктами';

-- Проверка
SELECT 'Всего ингредиентов: ' || COUNT(*) as result FROM menu_ingredients;
SELECT 'Блюд с ингредиентами: ' || COUNT(DISTINCT menu_id) as result FROM menu_ingredients;
SELECT 'Уникальных ингредиентов: ' || COUNT(DISTINCT ingredient_name) as result FROM menu_ingredients;
