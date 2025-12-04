# TypeScript Conventions

## Введение

Мы используем TypeScript для типобезопасности в обоих проектах (backend и frontend). Этот документ описывает стандарты и конвенции использования TypeScript в проекте.

## Настройки TypeScript

### Backend (tsconfig.json)

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "ES2023",
    "strictNullChecks": true,
    "noImplicitAny": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Frontend (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "target": "ESNext",
    "module": "ESNext"
  }
}
```

## Типы vs Interfaces

### Когда использовать Interface

Используйте `interface` для:
- Объектных типов, которые могут быть расширены
- Публичных API
- Props компонентов

```typescript
// ✅ Хорошо - interface для расширяемых типов
interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}
```

### Когда использовать Type

Используйте `type` для:
- Union типов
- Intersection типов
- Примитивных алиасов
- Mapped types

```typescript
// ✅ Хорошо - type для union
type Status = 'pending' | 'approved' | 'rejected';

// ✅ Хорошо - type для intersection
type AdminUser = User & {
  role: 'admin';
  permissions: string[];
};

// ✅ Хорошо - type для примитивов
type ID = string | number;
```

## Generics

### Функции с Generics

```typescript
// ✅ Хорошо
function identity<T>(value: T): T {
  return value;
}

// ✅ Хорошо - с ограничениями
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Классы с Generics

```typescript
// ✅ Хорошо
class Repository<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  find(id: number): T | undefined {
    return this.items.find(item => (item as any).id === id);
  }
}
```

## Utility Types

### Partial<T>

Делает все поля опциональными.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }
```

### Required<T>

Делает все поля обязательными.

```typescript
interface Config {
  host?: string;
  port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number; }
```

### Pick<T, K>

Выбирает определенные поля.

```typescript
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }
```

### Omit<T, K>

Исключает определенные поля.

```typescript
type CreateUser = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; }
```

### Record<K, T>

Создает объектный тип с ключами K и значениями T.

```typescript
type UserMap = Record<string, User>;
// { [key: string]: User; }
```

## Type Guards

### Пользовательские Type Guards

```typescript
interface Admin {
  role: 'admin';
  permissions: string[];
}

interface RegularUser {
  role: 'user';
}

type User = Admin | RegularUser;

function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

function processUser(user: User) {
  if (isAdmin(user)) {
    // TypeScript знает, что user - Admin
    console.log(user.permissions);
  }
}
```

### typeof и instanceof Guards

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript знает, что value - string
    return value.toUpperCase();
  }
  // TypeScript знает, что value - number
  return value * 2;
}
```

## DTOs типизация

### Backend DTOs

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

// update-user.dto.ts
export class UpdateUserDto implements Partial<CreateUserDto> {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;
}
```

### Frontend типы для API

```typescript
// api/types.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  phone?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
```

## API Response Types

### Универсальный тип ответа

```typescript
// api/response.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### Использование в сервисах

```typescript
// users.service.ts
async findAll(): Promise<ApiResponse<User[]>> {
  const users = await this.prisma.user.findMany();
  return {
    data: users,
    message: 'Users retrieved successfully',
  };
}
```

## Enums vs Union Types

### Когда использовать Enum

Используйте `enum` для:
- Констант, которые используются в runtime
- Когда нужна обратная совместимость

```typescript
// ✅ Хорошо - enum для runtime констант
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

function checkRole(role: UserRole) {
  // Можно использовать в runtime
  return Object.values(UserRole).includes(role);
}
```

### Когда использовать Union Type

Используйте `union type` для:
- Типов, которые только для TypeScript
- Когда не нужна обратная совместимость

```typescript
// ✅ Хорошо - union type для типизации
type UserRole = 'admin' | 'user' | 'guest';

function checkRole(role: UserRole) {
  // Только для типизации
  return role === 'admin';
}
```

## Naming Conventions

### Типы и Interfaces

```typescript
// ✅ PascalCase для типов и interfaces
interface User {}
type UserRole = 'admin' | 'user';

// ✅ Добавляйте суффиксы для ясности
interface CreateUserDto {}
interface UpdateUserDto {}
interface UserResponse {}
```

### Generics

```typescript
// ✅ Одна буква для простых generics
function identity<T>(value: T): T {}

// ✅ Описательные имена для сложных generics
function mapValues<TKey, TValue>(
  obj: Record<TKey, TValue>,
  mapper: (value: TValue) => TValue
): Record<TKey, TValue> {}
```

### Файлы

```
✅ Хорошо:
- user.dto.ts
- user.service.ts
- user.controller.ts
- user.types.ts

❌ Плохо:
- UserDto.ts (не используем PascalCase для файлов)
- userDTO.ts (не используем аббревиатуры)
```

## Примеры типизации

### Backend: NestJS Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### Frontend: SolidJS Component

```typescript
import { Component, createSignal, createEffect } from 'solid-js';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersPageProps {
  initialUsers?: User[];
}

const UsersPage: Component<UsersPageProps> = (props) => {
  const [users, setUsers] = createSignal<User[]>(props.initialUsers || []);
  const [loading, setLoading] = createSignal<boolean>(false);

  createEffect(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div>
      {loading() ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users().map((user) => (
            <li>{user.name} - {user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsersPage;
```

## Best Practices

### ✅ DO

1. **Используйте strict mode** в TypeScript
2. **Типизируйте все функции** и их параметры
3. **Используйте interface для объектов**, type для unions
4. **Создавайте отдельные типы** для DTOs и entities
5. **Используйте Utility Types** для трансформации типов
6. **Документируйте сложные типы** комментариями

### ❌ DON'T

1. **Не используйте `any`** без крайней необходимости
2. **Не игнорируйте ошибки типов** (`@ts-ignore`)
3. **Не смешивайте типы и значения** в одном файле без необходимости
4. **Не создавайте слишком сложные типы** - разбивайте на части
5. **Не используйте `as` кастинг** без необходимости

## Ссылки

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

