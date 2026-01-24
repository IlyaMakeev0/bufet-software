-- Удаляем старые записи
DELETE FROM menu_ingredients;

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Добавляем ингредиенты
DO $$
DECLARE
  menu_rec RECORD;
BEGIN
  -- Каша овсяная
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Каша овсяная с ягодами' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Овсяные хлопья', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Молоко', 0.2, 'л'),
      (uuid_generate_v4()::text, menu_rec.id, 'Ягоды замороженные', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Мёд', 0.02, 'кг');
  END LOOP;

  -- Сырники
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Сырники со сметаной' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Творог', 0.15, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Яйца', 2, 'шт'),
      (uuid_generate_v4()::text, menu_rec.id, 'Мука пшеничная', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Сахар', 0.03, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Сметана', 0.05, 'кг');
  END LOOP;

  -- Омлет
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Омлет с ветчиной' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Яйца', 3, 'шт'),
      (uuid_generate_v4()::text, menu_rec.id, 'Молоко', 0.1, 'л'),
      (uuid_generate_v4()::text, menu_rec.id, 'Ветчина', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Сыр', 0.04, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Зелень', 0.01, 'кг');
  END LOOP;

  -- Суп куриный
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Суп куриный с лапшой' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Курица', 0.15, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Лапша', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Морковь', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Лук', 0.03, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Зелень', 0.01, 'кг');
  END LOOP;

  -- Гречка
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Гречка с котлетой' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Гречка', 0.12, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Говядина', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Свинина', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Лук', 0.03, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Яйца', 1, 'шт'),
      (uuid_generate_v4()::text, menu_rec.id, 'Хлеб', 0.5, 'шт');
  END LOOP;

  -- Плов
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Плов с говядиной' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Рис', 0.15, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Говядина', 0.12, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Морковь', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Лук', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Масло растительное', 0.05, 'л');
  END LOOP;

  -- Салат
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Салат овощной' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Помидоры', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Огурцы', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Перец болгарский', 0.05, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Лук', 0.02, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Масло растительное', 0.02, 'л');
  END LOOP;

  -- Запеканка
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Творожная запеканка' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Творог', 0.12, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Яйца', 2, 'шт'),
      (uuid_generate_v4()::text, menu_rec.id, 'Сахар', 0.04, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Мука пшеничная', 0.03, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Изюм', 0.02, 'кг');
  END LOOP;

  -- Йогурт
  FOR menu_rec IN SELECT id FROM menu WHERE name = 'Йогурт с фруктами' LOOP
    INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
      (uuid_generate_v4()::text, menu_rec.id, 'Йогурт', 0.2, 'л'),
      (uuid_generate_v4()::text, menu_rec.id, 'Яблоки', 0.08, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Бананы', 0.06, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Киви', 0.04, 'кг'),
      (uuid_generate_v4()::text, menu_rec.id, 'Мёд', 0.02, 'кг');
  END LOOP;

  RAISE NOTICE 'Добавлено ингредиентов: %', (SELECT COUNT(*) FROM menu_ingredients);
END $$;

-- Проверка
SELECT 'Всего ингредиентов: ' || COUNT(*) as result FROM menu_ingredients;
SELECT 'Блюд с ингредиентами: ' || COUNT(DISTINCT menu_id) as result FROM menu_ingredients;
