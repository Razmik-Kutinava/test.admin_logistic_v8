# AI Reference - Admin Logistic Panel v8

> **⚠️ ВАЖНО**: Этот документ должен быть прочитан ПЕРВЫМ перед началом любой задачи!

## Quick Reference

### Tech Stack (кратко)

- **Backend**: NestJS 11.x + Prisma 7.x + Supabase
- **Frontend**: SolidJS 1.9.x + Vite 7.x
- **Database**: PostgreSQL (через Supabase)
- **Language**: TypeScript (strict mode)

### Архитектура

```
Frontend (SolidJS) → HTTP/REST → Backend (NestJS) → Prisma Client → PostgreSQL (Supabase)
```

## Ссылки на детальные документы

Все детальные документы находятся в `docs/tech-stack/`:

1. **[Overview](./tech-stack/overview.md)** - Общий обзор стека
2. **[Backend (NestJS)](./tech-stack/backend-nestjs.md)** - Полный гайд по NestJS
3. **[Database (Prisma)](./tech-stack/database-prisma.md)** - Prisma ORM гайд
4. **[Database (Supabase)](./tech-stack/database-supabase.md)** - Supabase специфика
5. **[Frontend (SolidJS)](./tech-stack/frontend-solidjs.md)** - SolidJS полный гайд
6. **[TypeScript Conventions](./tech-stack/typescript-conventions.md)** - Стандарты TypeScript
7. **[API Design](./tech-stack/api-design.md)** - REST API стандарты
8. **[Authentication](./tech-stack/authentication.md)** - Auth flow
9. **[Environment Setup](./tech-stack/environment-setup.md)** - Настройка окружения
10. **[Dependencies](./tech-stack/dependencies.md)** - Список библиотек

## 🚫 Запрещенные практики

### ❌ НИКОГДА не используйте:

#### Frontend
- **React** - используем SolidJS
- **Vue, Angular** - не используем
- **React hooks** (useState, useEffect) - используем SolidJS API (createSignal, createEffect)
- **Virtual DOM паттерны** - SolidJS компилирует реактивность
- **Redux, MobX** - используем Context API или createStore
- **styled-components, Emotion** - уточнить подход к стилизации

#### Backend
- **Express напрямую** - используем NestJS декораторы
- **TypeORM, Sequelize** - используем Prisma
- **Mongoose/MongoDB** - используем PostgreSQL
- **Drizzle** - используем Prisma
- **Passport** - используем Supabase Auth напрямую

#### Database
- **MongoDB, MySQL, SQLite** - используем PostgreSQL
- **Raw SQL без необходимости** - используем Prisma Client
- **db push в production** - используем migrate deploy

#### Общее
- **`any` тип** - используем строгую типизацию
- **Игнорирование ошибок** (`@ts-ignore`) - исправляйте типы
- **Синхронный I/O** - используйте async/await

## Типичные задачи и решения

### 1. Создать CRUD endpoint

**Шаги:**

1. Создать DTO:
```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  name: string;
}
```

2. Создать Service:
```typescript
// users/users.service.ts
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }
}
```

3. Создать Controller:
```typescript
// users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}
  
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
```

4. Добавить в Module:
```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

**См. детали**: [backend-nestjs.md](./tech-stack/backend-nestjs.md)

### 2. Добавить новую таблицу

**Шаги:**

1. Обновить Prisma Schema:
```prisma
// prisma/schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  createdAt DateTime @default(now())
}
```

2. Создать миграцию:
```bash
npx prisma migrate dev --name add_post_table
```

3. Сгенерировать Prisma Client:
```bash
npx prisma generate
```

**См. детали**: [database-prisma.md](./tech-stack/database-prisma.md)

### 3. Создать форму в SolidJS

**Шаги:**

```typescript
import { Component, createSignal } from 'solid-js';

const MyForm: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Обработка формы
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
      />
      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

**См. детали**: [frontend-solidjs.md](./tech-stack/frontend-solidjs.md)

### 4. Защитить маршрут (Backend)

```typescript
@Controller('users')
@UseGuards(AuthGuard) // Защищает все маршруты
export class UsersController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Пользователь из токена
  }
}
```

**См. детали**: [authentication.md](./tech-stack/authentication.md)

### 5. Защитить маршрут (Frontend)

```typescript
import { Navigate } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: Component = (props) => {
  const [user] = useAuth();
  return user() ? props.children : <Navigate href="/login" />;
};
```

**См. детали**: [authentication.md](./tech-stack/authentication.md)

### 6. Создать API запрос

**Frontend:**
```typescript
const response = await fetch('/api/v1/users', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();
```

**См. детали**: [api-design.md](./tech-stack/api-design.md)

## Структура проекта

```
project-root/
├── backend/                 # NestJS приложение
│   ├── src/
│   │   ├── app.module.ts   # Корневой модуль
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── main.ts         # Точка входа
│   │   ├── users/          # Пример модуля
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   └── prisma/
│   │       └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma   # Prisma схема
│   │   └── migrations/     # Миграции
│   ├── .env                # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # SolidJS приложение
│   ├── src/
│   │   ├── App.tsx         # Корневой компонент
│   │   ├── index.tsx       # Точка входа
│   │   ├── pages/          # Страницы
│   │   ├── components/     # Компоненты
│   │   ├── contexts/       # Context API
│   │   └── api/            # API клиент
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
└── docs/                   # Документация
    ├── AI-REFERENCE.md     # Этот файл
    └── tech-stack/         # Детальные документы
```

## Команды для разработки

### Backend

```bash
# Разработка (с hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Линтинг
npm run lint

# Тесты
npm run test
npm run test:watch
npm run test:e2e

# Prisma
npx prisma generate        # Генерация Client
npx prisma migrate dev     # Создать миграцию
npx prisma migrate deploy  # Применить миграции
npx prisma studio          # Открыть Prisma Studio
```

### Frontend

```bash
# Разработка (с HMR)
npm run dev

# Production build
npm run build

# Preview production build
npm run serve
```

## Быстрая шпаргалка

### NestJS

- **Модуль**: `@Module({ controllers, providers })`
- **Контроллер**: `@Controller('path')`
- **Сервис**: `@Injectable()`
- **HTTP методы**: `@Get()`, `@Post()`, `@Put()`, `@Delete()`
- **Параметры**: `@Param()`, `@Query()`, `@Body()`, `@Headers()`
- **Guards**: `@UseGuards(AuthGuard)`
- **Validation**: `ValidationPipe` + `class-validator`

### Prisma

- **Запросы**: `prisma.user.findMany()`, `findUnique()`, `create()`, `update()`, `delete()`
- **Фильтры**: `where: { email: { contains: '@' } }`
- **Include**: `include: { posts: true }`
- **Select**: `select: { id: true, name: true }`
- **Транзакции**: `prisma.$transaction([...])`

### SolidJS

- **Signal**: `createSignal(initialValue)`
- **Effect**: `createEffect(() => { ... })`
- **Memo**: `createMemo(() => { ... })`
- **Store**: `createStore({ ... })`
- **Context**: `createContext()`, `useContext()`
- **Рендеринг**: `{value()}` - всегда вызывать как функцию!

### TypeScript

- **Interface** - для объектов, расширяемых типов
- **Type** - для unions, intersections, примитивов
- **Generics** - `<T>` для переиспользуемых типов
- **Utility Types** - `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`

## Checklist перед началом задачи

- [ ] Прочитан соответствующий документ из `docs/tech-stack/`
- [ ] Понятна структура проекта
- [ ] Известны запрещенные практики
- [ ] Проверены примеры для типичной задачи
- [ ] Настроено окружение (см. [environment-setup.md](./tech-stack/environment-setup.md))

## Полезные ссылки

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [SolidJS Docs](https://www.solidjs.com/docs/latest)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Последнее обновление**: 2024-12-03

