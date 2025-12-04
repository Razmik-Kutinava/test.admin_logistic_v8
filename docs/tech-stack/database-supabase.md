# Database: Supabase Guide

## Введение

Supabase - это open-source альтернатива Firebase, построенная на PostgreSQL. Мы используем Supabase для:
- Управления PostgreSQL базой данных
- Аутентификации пользователей
- Row Level Security (RLS) для безопасности данных
- Storage для файлов
- Realtime subscriptions (если нужно)

## Что такое Supabase

Supabase предоставляет:
- **PostgreSQL Database** - полнофункциональная PostgreSQL БД
- **Authentication** - готовая система аутентификации
- **Storage** - хранение файлов
- **Realtime** - подписки на изменения в БД
- **Edge Functions** - serverless функции (если используем)

## Connection Strings

### Pooler vs Direct Connection

Supabase предоставляет два типа connection strings:

#### Direct Connection (для миграций)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```
- Используется для миграций Prisma
- Прямое подключение к БД
- Не используйте для приложения (ограничение на количество соединений)

#### Pooler Connection (для приложения)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
- Используется для Prisma Client в приложении
- Connection pooling для эффективного использования соединений
- Порт 6543 для транзакций, 5432 для сессий

### Настройка в проекте

```typescript
// .env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Для миграций
}
```

## Row Level Security (RLS)

RLS - это механизм PostgreSQL для ограничения доступа к строкам на уровне БД.

### Включение RLS

```sql
-- Включить RLS для таблицы
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

### Политики RLS

#### SELECT Policy (чтение)

```sql
-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view own data"
ON "User"
FOR SELECT
USING (auth.uid() = id);
```

#### INSERT Policy (создание)

```sql
-- Пользователи могут создавать только свои записи
CREATE POLICY "Users can insert own data"
ON "User"
FOR INSERT
WITH CHECK (auth.uid() = id);
```

#### UPDATE Policy (обновление)

```sql
-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own data"
ON "User"
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

#### DELETE Policy (удаление)

```sql
-- Пользователи могут удалять только свои данные
CREATE POLICY "Users can delete own data"
ON "User"
FOR DELETE
USING (auth.uid() = id);
```

### Примеры политик

#### Публичные данные (все могут читать)

```sql
CREATE POLICY "Public data is viewable by everyone"
ON "Post"
FOR SELECT
USING (true);
```

#### Администраторы могут все

```sql
CREATE POLICY "Admins can do everything"
ON "User"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Команда может видеть данные проекта

```sql
CREATE POLICY "Team members can view project data"
ON "Project"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "ProjectMember"
    WHERE "projectId" = "Project".id
    AND "userId" = auth.uid()
  )
);
```

## Auth Integration

### Supabase Auth в NestJS

```typescript
// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }

  getClient() {
    return this.supabase;
  }

  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }
}
```

### Auth Guard

```typescript
// auth/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const user = await this.supabase.getUser(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Storage для файлов

### Настройка Storage

```typescript
// Загрузка файла
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/user-123.png', file, {
    cacheControl: '3600',
    upsert: false
  });

// Получение публичного URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/user-123.png');

// Удаление файла
const { error } = await supabase.storage
  .from('avatars')
  .remove(['public/user-123.png']);
```

### Storage Policies

```sql
-- Разрешить всем читать файлы
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Разрешить пользователям загружать свои файлы
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Realtime Subscriptions

Подписка на изменения в реальном времени:

```typescript
// Подписка на изменения в таблице
const subscription = supabase
  .channel('users')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'User' },
    (payload) => {
      console.log('User updated:', payload.new);
    }
  )
  .subscribe();
```

## Edge Functions

Edge Functions - это serverless функции на Deno.

### Создание Edge Function

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();
  
  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
```

### Deploy Edge Function

```bash
supabase functions deploy my-function
```

## Supabase CLI

### Установка

```bash
npm install -g supabase
```

### Основные команды

```bash
# Логин
supabase login

# Инициализация проекта
supabase init

# Создание миграции
supabase migration new migration_name

# Применение миграций локально
supabase db reset

# Синхронизация с удаленным проектом
supabase db pull

# Запуск локального Supabase
supabase start

# Остановка локального Supabase
supabase stop
```

## Integration с Prisma

### Настройка Prisma для Supabase

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Миграции через Prisma

```bash
# Создать миграцию
npx prisma migrate dev --name add_user_table

# Применить в production
npx prisma migrate deploy
```

⚠️ **Важно**: Prisma миграции применяются напрямую к БД. RLS политики нужно создавать отдельно через SQL миграции или Supabase Dashboard.

## Best Practices для RLS

### ✅ DO

1. **Всегда включайте RLS** для таблиц с пользовательскими данными
2. **Используйте auth.uid()** для получения текущего пользователя
3. **Тестируйте политики** перед деплоем
4. **Используйте отдельные политики** для разных операций (SELECT, INSERT, UPDATE, DELETE)
5. **Документируйте политики** в комментариях SQL

### ❌ DON'T

1. **Не отключайте RLS** в production
2. **Не используйте service_role key** в клиентском коде
3. **Не забывайте про политики** при создании новых таблиц
4. **Не используйте слабые проверки** в политиках

## Примеры Policies

### Полный пример для User таблицы

```sql
-- Включить RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view own data"
ON "User"
FOR SELECT
USING (auth.uid()::text = id::text);

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own data"
ON "User"
FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Пользователи могут удалять только свои данные
CREATE POLICY "Users can delete own data"
ON "User"
FOR DELETE
USING (auth.uid()::text = id::text);

-- Администраторы могут все
CREATE POLICY "Admins have full access"
ON "User"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id::text = auth.uid()::text
    AND role = 'admin'
  )
);
```

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY] # Только для backend!

# Database
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## Ссылки

- [Официальная документация Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)

