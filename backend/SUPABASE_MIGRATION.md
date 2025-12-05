# Инструкция по применению миграции в Supabase

## Способ 1: Через Supabase Dashboard (Рекомендуется)

1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в раздел **SQL Editor**
3. Скопируйте содержимое файла `prisma/migrations/20240101000000_init_schema/migration.sql`
4. Вставьте SQL в редактор и нажмите **Run**

## Способ 2: Через Supabase CLI

Если у вас установлен Supabase CLI:

```bash
# Убедитесь, что вы подключены к проекту
supabase link --project-ref <your-project-ref>

# Примените миграцию
supabase db push
```

Или напрямую:

```bash
# Примените SQL файл
psql <your-connection-string> -f prisma/migrations/20240101000000_init_schema/migration.sql
```

## Способ 3: Через Prisma Migrate

Если у вас настроен DATABASE_URL:

```bash
cd backend
npx prisma migrate deploy
```

## Проверка

После применения миграции проверьте, что таблицы созданы:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Должны быть созданы следующие таблицы:
- zones
- warehouses
- districts
- drivers
- orders
- deliveries
- system_logs

И следующие типы:
- DriverStatus
- OrderStatus
- OrderPriority
- DeliveryStatus

