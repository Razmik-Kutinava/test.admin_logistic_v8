# Dependencies

## Введение

Этот документ описывает все используемые библиотеки в проекте, их назначение и версии.

## Backend Dependencies

### Core

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@nestjs/common` | ^11.0.1 | Основные декораторы и утилиты NestJS |
| `@nestjs/core` | ^11.0.1 | Ядро NestJS фреймворка |
| `@nestjs/platform-express` | ^11.0.1 | Express адаптер для NestJS |
| `reflect-metadata` | ^0.2.2 | Поддержка метаданных для декораторов |
| `rxjs` | ^7.8.1 | Реактивное программирование (используется NestJS) |

### Database

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@prisma/client` | ^7.1.0 | Prisma Client для типобезопасных запросов к БД |
| `@supabase/supabase-js` | ^2.86.0 | Supabase JavaScript клиент для Auth и других сервисов |

### Development Dependencies

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@nestjs/cli` | ^11.0.0 | CLI для NestJS (генерация модулей, контроллеров) |
| `@nestjs/schematics` | ^11.0.0 | Схемы для генерации кода |
| `@nestjs/testing` | ^11.0.1 | Утилиты для тестирования |
| `typescript` | ^5.9.3 | TypeScript компилятор |
| `ts-node` | ^10.9.2 | Запуск TypeScript файлов напрямую |
| `ts-loader` | ^9.5.2 | TypeScript loader для webpack |
| `prisma` | ^7.1.0 | Prisma CLI для миграций и генерации |
| `jest` | ^30.0.0 | Тестовый фреймворк |
| `ts-jest` | ^29.2.5 | TypeScript поддержка для Jest |
| `supertest` | ^7.0.0 | HTTP assertions для тестирования API |
| `eslint` | ^9.18.0 | Линтер для JavaScript/TypeScript |
| `prettier` | ^3.4.2 | Форматтер кода |

## Frontend Dependencies

### Core

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `solid-js` | ^1.9.5 | SolidJS фреймворк |

### Development Dependencies

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `vite` | ^7.1.4 | Сборщик и dev-сервер |
| `vite-plugin-solid` | ^2.11.8 | Плагин Vite для SolidJS |
| `solid-devtools` | ^0.34.3 | DevTools для отладки SolidJS |
| `typescript` | ^5.7.2 | TypeScript компилятор |

## Что НЕ используем

### Frontend

- ❌ **React** - используем SolidJS
- ❌ **Vue** - не используем
- ❌ **Angular** - не используем
- ❌ **styled-components** - не используем (уточнить подход к стилизации)
- ❌ **Emotion** - не используем
- ❌ **Redux** - используем Context API или createStore
- ❌ **MobX** - не используем

### Backend

- ❌ **Express** - используем NestJS (который использует Express под капотом, но не напрямую)
- ❌ **Fastify** - используем Express через NestJS
- ❌ **Koa** - не используем
- ❌ **TypeORM** - используем Prisma
- ❌ **Sequelize** - используем Prisma
- ❌ **Mongoose** - используем PostgreSQL, не MongoDB
- ❌ **Drizzle** - используем Prisma

### Database

- ❌ **MongoDB** - используем PostgreSQL
- ❌ **MySQL** - используем PostgreSQL
- ❌ **SQLite** - используем PostgreSQL (через Supabase)

### Validation

- ⚠️ **class-validator** - не установлен, но может понадобиться для DTO валидации
- ⚠️ **class-transformer** - не установлен, но может понадобиться

### Auth

- ❌ **Passport** - используем Supabase Auth напрямую
- ❌ **JWT библиотеки** - используем Supabase для управления JWT

## Рекомендуемые дополнения

### Backend

```bash
# Валидация DTO
npm install class-validator class-transformer

# Swagger документация
npm install @nestjs/swagger swagger-ui-express

# CORS (встроен в NestJS, но может понадобиться настройка)
# Уже включен через @nestjs/platform-express

# Config модуль для переменных окружения
npm install @nestjs/config
```

### Frontend

```bash
# Роутинг
npm install @solidjs/router

# HTTP клиент (опционально, можно использовать fetch)
npm install axios

# Формы и валидация (опционально)
npm install solid-js-form

# UI библиотека (опционально, уточнить)
# Например: @kobalte/core, solid-ui, или собственная
```

## Установка зависимостей

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Обновление зависимостей

### Проверка устаревших пакетов

```bash
# Backend
cd backend
npm outdated

# Frontend
cd frontend
npm outdated
```

### Обновление

```bash
# Обновить все зависимости до последних версий (осторожно!)
npm update

# Или обновить конкретный пакет
npm install package-name@latest
```

⚠️ **Важно**: Всегда тестируйте после обновления зависимостей!

## Версионирование

Мы используем семантическое версионирование (SemVer):
- `^11.0.1` - обновления минорных и патч версий разрешены
- `~11.0.1` - только патч версии разрешены
- `11.0.1` - точная версия

## Security

### Проверка уязвимостей

```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit
```

### Исправление уязвимостей

```bash
npm audit fix
```

## Ссылки

- [npm Documentation](https://docs.npmjs.com/)
- [NestJS Packages](https://www.npmjs.com/search?q=%40nestjs)
- [SolidJS Ecosystem](https://www.solidjs.com/ecosystem)
- [Prisma Releases](https://github.com/prisma/prisma/releases)

