# Database: Prisma ORM Guide

## Введение

Prisma - это современный ORM для TypeScript и Node.js. Мы используем Prisma 7.x для работы с PostgreSQL через Supabase. Prisma обеспечивает типобезопасность и отличный Developer Experience.

## Основные концепции

### Prisma Schema

Схема Prisma определяет структуру базы данных и модели данных.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

## Типы данных PostgreSQL

### Скалярные типы

```prisma
model Example {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  price       Float
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tags        String[]  // Массив строк
  metadata    Json      // JSON данные
}
```

### Типы полей

- `String` - VARCHAR/TEXT
- `Int` - INTEGER
- `BigInt` - BIGINT
- `Float` - REAL/DOUBLE PRECISION
- `Decimal` - DECIMAL/NUMERIC
- `Boolean` - BOOLEAN
- `DateTime` - TIMESTAMP
- `Json` - JSONB
- `Bytes` - BYTEA
- `String[]` - Массив строк

## Relations (Связи)

### One-to-Many (1:N)

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[] // Один пользователь - много постов
}

model Post {
  id       Int  @id @default(autoincrement())
  title    String
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

### One-to-One (1:1)

```prisma
model User {
  id      Int     @id @default(autoincrement())
  email   String  @unique
  profile Profile? // Опциональная связь один-к-одному
}

model Profile {
  id     Int   @id @default(autoincrement())
  bio    String?
  userId Int   @unique
  user   User  @relation(fields: [userId], references: [id])
}
```

### Many-to-Many (N:M)

```prisma
model Post {
  id       Int      @id @default(autoincrement())
  title    String
  tags     Tag[]    // Много постов - много тегов
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] // Много тегов - много постов
}
```

### Many-to-Many с дополнительными полями

```prisma
model Post {
  id       Int         @id @default(autoincrement())
  title    String
  tags     PostTag[]
}

model Tag {
  id    Int      @id @default(autoincrement())
  name  String   @unique
  posts PostTag[]
}

model PostTag {
  postId   Int
  tagId    Int
  assignedAt DateTime @default(now())
  post     Post   @relation(fields: [postId], references: [id])
  tag      Tag    @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
```

## Миграции

### Создание миграции

```bash
# Создать новую миграцию
npx prisma migrate dev --name add_user_table

# Применить миграции в production
npx prisma migrate deploy

# Откатить последнюю миграцию (только в dev)
npx prisma migrate reset
```

### db push (для разработки)

```bash
# Быстрое обновление схемы без создания миграции (только для dev!)
npx prisma db push
```

⚠️ **Важно**: `db push` не создает файлы миграций. Используйте только для быстрого прототипирования.

## Prisma Client Usage

### Инициализация

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// В NestJS обычно создается сервис
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Базовые запросы

#### findMany - Получить все записи

```typescript
// Получить всех пользователей
const users = await prisma.user.findMany();

// С фильтрацией
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true,
  },
});

// С пагинацией
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
});

// С сортировкой
const users = await prisma.user.findMany({
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### findUnique - Получить одну запись по уникальному полю

```typescript
const user = await prisma.user.findUnique({
  where: {
    id: 1,
  },
});

// По email (unique поле)
const user = await prisma.user.findUnique({
  where: {
    email: 'user@example.com',
  },
});
```

#### findFirst - Получить первую запись

```typescript
const firstUser = await prisma.user.findFirst({
  where: {
    name: {
      contains: 'John',
    },
  },
});
```

#### create - Создать запись

```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

#### update - Обновить запись

```typescript
const user = await prisma.user.update({
  where: {
    id: 1,
  },
  data: {
    name: 'Jane Doe',
  },
});
```

#### updateMany - Обновить несколько записей

```typescript
const result = await prisma.user.updateMany({
  where: {
    isActive: false,
  },
  data: {
    isActive: true,
  },
});
```

#### delete - Удалить запись

```typescript
const user = await prisma.user.delete({
  where: {
    id: 1,
  },
});
```

#### deleteMany - Удалить несколько записей

```typescript
const result = await prisma.user.deleteMany({
  where: {
    isActive: false,
  },
});
```

### Вложенные запросы (Include)

```typescript
// Получить пользователя с постами
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
  },
});

// Вложенные include
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: {
        tags: true,
      },
    },
  },
});
```

### Select - Выбор конкретных полей

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    name: true,
    // posts не будет включен
  },
});
```

## Фильтры

### Операторы сравнения

```typescript
const users = await prisma.user.findMany({
  where: {
    age: {
      gt: 18,        // Больше
      gte: 18,       // Больше или равно
      lt: 65,        // Меньше
      lte: 65,       // Меньше или равно
      equals: 25,    // Равно
      not: 25,       // Не равно
    },
  },
});
```

### Строковые фильтры

```typescript
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@gmail.com',
      startsWith: 'john',
      endsWith: '.com',
    },
  },
});
```

### Массивы

```typescript
const users = await prisma.user.findMany({
  where: {
    id: {
      in: [1, 2, 3],
      notIn: [4, 5, 6],
    },
  },
});
```

### Логические операторы

```typescript
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@gmail.com' } },
      { email: { contains: '@yahoo.com' } },
    ],
    AND: [
      { isActive: true },
      { age: { gte: 18 } },
    ],
    NOT: {
      email: { contains: '@test.com' },
    },
  },
});
```

## Transactions

### Последовательные операции

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  });

  const post = await tx.post.create({
    data: {
      title: 'My Post',
      authorId: user.id,
    },
  });

  return { user, post };
});
```

### Интерактивные транзакции

```typescript
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com' } }),
  prisma.post.create({ data: { title: 'Post' } }),
]);
```

## Raw Queries

Когда нужны сложные SQL запросы:

```typescript
// Raw SQL
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE age > ${18}
`;

// С параметрами
const users = await prisma.$queryRawUnsafe(
  'SELECT * FROM "User" WHERE email = $1',
  'user@example.com'
);

// Execute raw (для INSERT, UPDATE, DELETE)
await prisma.$executeRaw`
  UPDATE "User" SET "isActive" = true WHERE "age" > ${18}
`;
```

⚠️ **Важно**: Используйте raw queries только когда Prisma Client не может выразить нужный запрос. Всегда предпочитайте типобезопасные методы Prisma.

## Оптимизация запросов

### Индексы

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String

  @@index([name]) // Индекс на поле name
  @@index([email, name]) // Составной индекс
}
```

### Использование select вместо include

```typescript
// ❌ Плохо - загружает все поля
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// ✅ Хорошо - загружает только нужные поля
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});
```

### Пагинация

```typescript
// Cursor-based pagination (лучше для больших данных)
const users = await prisma.user.findMany({
  take: 10,
  cursor: {
    id: lastUserId,
  },
  skip: 1, // Пропускаем курсор
  orderBy: {
    id: 'asc',
  },
});

// Offset-based pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

## Примеры схем для типичных сущностей

### User с профилем

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // Хешированный пароль
  name      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile   Profile?
  posts     Post[]
}

model Profile {
  id        Int      @id @default(autoincrement())
  bio       String?
  avatar    String?
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Post с тегами

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

## Best Practices

### ✅ DO

1. **Всегда используйте миграции** для изменений схемы
2. **Используйте select** когда нужны только определенные поля
3. **Создавайте индексы** для часто используемых полей в WHERE
4. **Используйте транзакции** для связанных операций
5. **Валидируйте данные** перед сохранением в БД
6. **Используйте unique constraints** для полей, которые должны быть уникальными

### ❌ DON'T

1. **Не используйте db push в production** (только migrate deploy)
2. **Не делайте N+1 запросы** (используйте include/select)
3. **Не используйте raw queries** без необходимости
4. **Не забывайте про индексы** для полей в WHERE/JOIN
5. **Не храните пароли в открытом виде** (всегда хешируйте)

## Команды Prisma CLI

```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграции
npx prisma migrate dev --name migration_name

# Применение миграций
npx prisma migrate deploy

# Открыть Prisma Studio (GUI)
npx prisma studio

# Форматирование schema
npx prisma format

# Валидация schema
npx prisma validate

# Сброс БД (только для dev!)
npx prisma migrate reset
```

## Ссылки

- [Официальная документация Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

