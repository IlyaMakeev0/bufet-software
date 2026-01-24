-- Удаляем старые записи
DELETE FROM menu_ingredients;

-- Добавляем ингредиенты для всех блюд
DO $$
DECLARE
  menu_rec RECORD;
BEGIN
  -- Каша овсяная
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Каша овсяная%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Овсяные хлопья', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Молоко', 0.2, 'л'),
      (gen_random_uuid()::text, menu_rec.id, 'Ягоды замороженные', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Мёд', 0.02, 'кг');
  END LOOP;

  -- Сырники
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Сырники%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Творог', 0.15, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Яйца', 2, 'шт'),
      (gen_random_uuid()::text, menu_rec.id, 'Мука пшеничная', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Сахар', 0.03, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Сметана', 0.05, 'кг');
  END LOOP;

  -- Омлет
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Омлет%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Яйца', 3, 'шт'),
      (gen_random_uuid()::text, menu_rec.id, 'Молоко', 0.1, 'л'),
      (gen_random_uuid()::text, menu_rec.id, 'Ветчина', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Сыр', 0.04, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Зелень', 0.01, 'кг');
  END LOOP;

  -- Суп куриный
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Суп куриный%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Курица', 0.15, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Лапша', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Морковь', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Лук', 0.03, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Зелень', 0.01, 'кг');
  END LOOP;

  -- Гречка
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Гречка%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Гречка', 0.12, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Говядина', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Свинина', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Лук', 0.03, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Яйца', 1, 'шт'),
      (gen_random_uuid()::text, menu_rec.id, 'Хлеб', 0.5, 'шт');
  END LOOP;

  -- Плов
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Плов%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Рис', 0.15, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Говядина', 0.12, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Морковь', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Лук', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Масло растительное', 0.05, 'л');
  END LOOP;

  -- Салат
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Салат%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Помидоры', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Огурцы', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Перец болгарский', 0.05, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Лук', 0.02, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Масло растительное', 0.02, 'л');
  END LOOP;

  -- Запеканка
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%запеканка%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Творог', 0.12, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Яйца', 2, 'шт'),
      (gen_random_uuid()::text, menu_rec.id, 'Сахар', 0.04, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Мука пшеничная', 0.03, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Изюм', 0.02, 'кг');
  END LOOP;

  -- Йогурт
  FOR menu_rec IN SELECT id FROM menu WHERE name LIKE '%Йогурт%' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (gen_random_uuid()::text, menu_rec.id, 'Йогурт', 0.2, 'л'),
      (gen_random_uuid()::text, menu_rec.id, 'Яблоки', 0.08, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Бананы', 0.06, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Киви', 0.04, 'кг'),
      (gen_random_uuid()::text, menu_rec.id, 'Мёд', 0.02, 'кг');
  END LOOP;

  RAISE NOTICE 'Добавлено ингредиентов: %', (SELECT COUNT(*) FROM menu_ingredients);
END $$;

-- Проверка
SELECT 'Всего ингредиентов: ' || COUNT(*) as result FROM menu_ingredients;
SELECT 'Блюд с ингредиентами: ' || COUNT(DISTINCT menu_id) as result FROM menu_ingredients;
