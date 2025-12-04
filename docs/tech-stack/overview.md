# Tech Stack Overview - Admin Logistic Panel v8

## Общий обзор

**Admin Logistic Panel v8** - это современное веб-приложение для управления логистикой, построенное на основе проверенных и производительных технологий.

## Технологический стек

### Backend
- **NestJS 11.x** - прогрессивный Node.js фреймворк для построения эффективных и масштабируемых серверных приложений
- **Prisma 7.x** - современный ORM для TypeScript с типобезопасностью
- **Supabase** - Backend-as-a-Service для PostgreSQL, аутентификации и хранения файлов
- **TypeScript 5.9.x** - строгая типизация для надежности кода
- **Node.js 18+** - среда выполнения

### Frontend
- **SolidJS 1.9.x** - реактивный UI фреймворк с высокой производительностью
- **Vite 7.x** - быстрый сборщик и dev-сервер
- **TypeScript 5.7.x** - строгая типизация

### База данных
- **PostgreSQL** - реляционная БД (через Supabase)
- **Prisma ORM** - для работы с БД

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway/Render (возможно)

## Архитектура взаимодействия

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Prisma Client      ┌─────────────┐
│   SolidJS   │ ──────────────────> │   NestJS    │ ──────────────────────> │ PostgreSQL  │
│  Frontend   │ <────────────────── │  Backend    │ <────────────────────── │  (Supabase) │
└─────────────┘      JSON/API       └─────────────┘      SQL Queries         └─────────────┘
```

### Поток данных:
1. **Frontend (SolidJS)** отправляет HTTP запросы через `fetch` или `axios`
2. **Backend (NestJS)** обрабатывает запросы через контроллеры
3. **Prisma Client** выполняет запросы к PostgreSQL
4. **Supabase** предоставляет инфраструктуру БД, аутентификацию и дополнительные сервисы

## Почему выбрали эти технологии?

### NestJS
- ✅ Модульная архитектура из коробки
- ✅ Dependency Injection для тестируемости
- ✅ TypeScript-first подход
- ✅ Отличная экосистема декораторов
- ✅ Встроенная поддержка валидации, guards, interceptors

### Prisma
- ✅ Type-safe запросы к БД
- ✅ Автогенерация типов из схемы
- ✅ Отличные миграции
- ✅ Prisma Studio для визуализации данных
- ✅ Поддержка PostgreSQL нативно

### SolidJS
- ✅ Высокая производительность (нет Virtual DOM)
- ✅ Реактивность на уровне компиляции
- ✅ Малый размер бандла
- ✅ Простой API, похожий на React
- ✅ Отличная поддержка TypeScript

### Supabase
- ✅ PostgreSQL как сервис
- ✅ Встроенная аутентификация
- ✅ Row Level Security (RLS)
- ✅ Realtime subscriptions
- ✅ Storage для файлов
- ✅ Бесплатный tier для разработки

## Что НЕ используем

### Frontend
- ❌ **React** - выбрали SolidJS для лучшей производительности
- ❌ **Vue** - не используем
- ❌ **Angular** - слишком тяжелый для наших задач
- ❌ **Svelte** - выбрали SolidJS

### Backend
- ❌ **Express** - выбрали NestJS для структурированности
- ❌ **Fastify** - NestJS покрывает наши потребности
- ❌ **Koa** - не используем

### ORM/Database
- ❌ **TypeORM** - выбрали Prisma для лучшей типобезопасности
- ❌ **Sequelize** - устаревший подход
- ❌ **Mongoose/MongoDB** - используем PostgreSQL
- ❌ **Drizzle** - Prisma более зрелый

### Styling
- ⚠️ **Уточнить** - какой подход к стилизации используем (CSS modules, Tailwind, или другой)

## Версии технологий

| Технология | Версия | Примечание |
|------------|--------|------------|
| NestJS | 11.x | Последняя стабильная |
| Prisma | 7.x | Последняя стабильная |
| SolidJS | 1.9.x | Latest |
| TypeScript | 5.9.x (backend), 5.7.x (frontend) | Strict mode |
| Node.js | 18+ | LTS версия |
| PostgreSQL | Latest (через Supabase) | Управляется Supabase |

## Структура проекта

```
project-root/
├── backend/           # NestJS приложение
│   ├── src/          # Исходный код
│   ├── prisma/       # Prisma schema и миграции
│   └── dist/         # Скомпилированный код
├── frontend/         # SolidJS приложение
│   └── src/          # Исходный код
└── docs/             # Документация
    └── tech-stack/   # Tech stack документация
```

## Следующие шаги

Для детального изучения каждой технологии, перейдите к соответствующим документам:

- [Backend (NestJS)](./backend-nestjs.md)
- [Database (Prisma)](./database-prisma.md)
- [Database (Supabase)](./database-supabase.md)
- [Frontend (SolidJS)](./frontend-solidjs.md)
- [TypeScript Conventions](./typescript-conventions.md)
- [API Design](./api-design.md)
- [Authentication](./authentication.md)
- [Environment Setup](./environment-setup.md)
- [Dependencies](./dependencies.md)

