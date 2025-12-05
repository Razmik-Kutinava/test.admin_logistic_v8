# Исправление ошибок и настройка базы данных

## Что было исправлено:

1. ✅ **Добавлен глобальный обработчик ошибок Prisma** (`PrismaExceptionFilter`)
   - Теперь ошибки базы данных обрабатываются корректно
   - Вместо 500 ошибок будут возвращаться понятные сообщения

2. ✅ **Обновлена схема Prisma для версии 7**
   - Убраны `url` и `directUrl` из `schema.prisma`
   - Конфигурация перенесена в `prisma.config.ts`

3. ✅ **Создана миграция базы данных**
   - Файл: `prisma/migrations/20240101000000_init_schema/migration.sql`

## Как применить миграцию в Supabase:

### Вариант 1: Через веб-интерфейс Supabase (Самый простой)

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (в левом меню)
4. Откройте файл `backend/prisma/migrations/20240101000000_init_schema/migration.sql`
5. Скопируйте весь SQL код
6. Вставьте в SQL Editor
7. Нажмите **Run** или `Ctrl+Enter`

### Вариант 2: Через Supabase CLI

```bash
# Если у вас установлен Supabase CLI
cd backend
supabase db push
```

### Вариант 3: Через Prisma (если DATABASE_URL настроен)

```bash
cd backend
npx prisma migrate deploy
```

## После применения миграции:

1. Перезапустите backend сервер:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Проверьте, что ошибки 500 исчезли

3. Убедитесь, что API endpoints работают:
   - `GET /api/v1/warehouses`
   - `GET /api/v1/drivers`
   - `GET /api/v1/orders`
   - `GET /api/v1/deliveries`
   - `GET /api/v1/districts`

## Проверка базы данных:

Выполните в SQL Editor Supabase:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Должны быть созданы таблицы:
- zones
- warehouses
- districts
- drivers
- orders
- deliveries
- system_logs

## Важно:

Убедитесь, что в файле `.env` (или переменных окружения) настроены:
- `DATABASE_URL` - строка подключения к Supabase
- `DIRECT_URL` - прямая строка подключения (обычно такая же как DATABASE_URL)

Пример:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

