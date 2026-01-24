-- Заполнение склада тестовыми данными

-- Проверяем, есть ли уже данные
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM inventory) = 0 THEN
    -- Добавляем продукты на склад
    INSERT INTO inventory (id, name, quantity, unit, min_quantity) VALUES
      (gen_random_uuid()::text, 'Овсяные хлопья', 50, 'кг', 10),
      (gen_random_uuid()::text, 'Молоко', 100, 'л', 20),
      (gen_random_uuid()::text, 'Ягоды замороженные', 30, 'кг', 5),
      (gen_random_uuid()::text, 'Мёд', 15, 'кг', 3),
      (gen_random_uuid()::text, 'Творог', 40, 'кг', 10),
      (gen_random_uuid()::text, 'Яйца', 500, 'шт', 100),
      (gen_random_uuid()::text, 'Мука пшеничная', 80, 'кг', 15),
      (gen_random_uuid()::text, 'Сахар', 60, 'кг', 10),
      (gen_random_uuid()::text, 'Сметана', 25, 'кг', 5),
      (gen_random_uuid()::text, 'Ветчина', 20, 'кг', 5),
      (gen_random_uuid()::text, 'Сыр', 15, 'кг', 3),
      (gen_random_uuid()::text, 'Зелень', 10, 'кг', 2),
      (gen_random_uuid()::text, 'Курица', 60, 'кг', 15),
      (gen_random_uuid()::text, 'Лапша', 25, 'кг', 5),
      (gen_random_uuid()::text, 'Морковь', 40, 'кг', 10),
      (gen_random_uuid()::text, 'Лук', 35, 'кг', 8),
      (gen_random_uuid()::text, 'Гречка', 45, 'кг', 10),
      (gen_random_uuid()::text, 'Говядина', 50, 'кг', 12),
      (gen_random_uuid()::text, 'Свинина', 40, 'кг', 10),
      (gen_random_uuid()::text, 'Хлеб', 100, 'шт', 20),
      (gen_random_uuid()::text, 'Рис', 55, 'кг', 12),
      (gen_random_uuid()::text, 'Масло растительное', 30, 'л', 8),
      (gen_random_uuid()::text, 'Помидоры', 25, 'кг', 5),
      (gen_random_uuid()::text, 'Огурцы', 20, 'кг', 5),
      (gen_random_uuid()::text, 'Перец болгарский', 15, 'кг', 3),
      (gen_random_uuid()::text, 'Изюм', 10, 'кг', 2),
      (gen_random_uuid()::text, 'Йогурт', 50, 'л', 10),
      (gen_random_uuid()::text, 'Яблоки', 30, 'кг', 8),
      (gen_random_uuid()::text, 'Бананы', 25, 'кг', 5),
      (gen_random_uuid()::text, 'Киви', 15, 'кг', 3);
    
    RAISE NOTICE 'Склад заполнен: % продуктов', (SELECT COUNT(*) FROM inventory);
  ELSE
    RAISE NOTICE 'Склад уже содержит данные: % продуктов', (SELECT COUNT(*) FROM inventory);
  END IF;
END $$;

-- Добавляем ингредиенты к существующим блюдам
DO $$
DECLARE
  menu_record RECORD;
BEGIN
  IF (SELECT COUNT(*) FROM menu_ingredients) = 0 THEN
    -- Для каждого блюда добавляем ингредиенты
    FOR menu_record IN SELECT id, name FROM menu LOOP
      CASE 
        WHEN menu_record.name LIKE '%Каша овсяная%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Овсяные хлопья', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Молоко', 0.2, 'л'),
            (gen_random_uuid()::text, menu_record.id, 'Ягоды замороженные', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Мёд', 0.02, 'кг');
        
        WHEN menu_record.name LIKE '%Сырники%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Творог', 0.15, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Яйца', 2, 'шт'),
            (gen_random_uuid()::text, menu_record.id, 'Мука пшеничная', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Сахар', 0.03, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Сметана', 0.05, 'кг');
        
        WHEN menu_record.name LIKE '%Омлет%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Яйца', 3, 'шт'),
            (gen_random_uuid()::text, menu_record.id, 'Молоко', 0.1, 'л'),
            (gen_random_uuid()::text, menu_record.id, 'Ветчина', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Сыр', 0.04, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Зелень', 0.01, 'кг');
        
        WHEN menu_record.name LIKE '%Суп куриный%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Курица', 0.15, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Лапша', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Морковь', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Лук', 0.03, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Зелень', 0.01, 'кг');
        
        WHEN menu_record.name LIKE '%Гречка%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Гречка', 0.12, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Говядина', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Свинина', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Лук', 0.03, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Яйца', 1, 'шт'),
            (gen_random_uuid()::text, menu_record.id, 'Хлеб', 0.5, 'шт');
        
        WHEN menu_record.name LIKE '%Плов%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Рис', 0.15, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Говядина', 0.12, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Морковь', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Лук', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Масло растительное', 0.05, 'л');
        
        WHEN menu_record.name LIKE '%Салат%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Помидоры', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Огурцы', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Перец болгарский', 0.05, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Лук', 0.02, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Масло растительное', 0.02, 'л');
        
        WHEN menu_record.name LIKE '%запеканка%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Творог', 0.12, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Яйца', 2, 'шт'),
            (gen_random_uuid()::text, menu_record.id, 'Сахар', 0.04, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Мука пшеничная', 0.03, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Изюм', 0.02, 'кг');
        
        WHEN menu_record.name LIKE '%Йогурт%' THEN
          INSERT INTO menu_ingredients (id, menu_id, ingredient_name, quantity, unit) VALUES
            (gen_random_uuid()::text, menu_record.id, 'Йогурт', 0.2, 'л'),
            (gen_random_uuid()::text, menu_record.id, 'Яблоки', 0.08, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Бананы', 0.06, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Киви', 0.04, 'кг'),
            (gen_random_uuid()::text, menu_record.id, 'Мёд', 0.02, 'кг');
        
        ELSE
          -- Для остальных блюд не добавляем ингредиенты
          NULL;
      END CASE;
    END LOOP;
    
    RAISE NOTICE 'Добавлено ингредиентов: %', (SELECT COUNT(*) FROM menu_ingredients);
  ELSE
    RAISE NOTICE 'Ингредиенты уже добавлены: %', (SELECT COUNT(*) FROM menu_ingredients);
  END IF;
END $$;

SELECT 'Данные успешно добавлены!' as result;
