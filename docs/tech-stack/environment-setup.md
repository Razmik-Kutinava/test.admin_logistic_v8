# Environment Setup

## Введение

Этот документ описывает настройку окружения для разработки Admin Logistic Panel v8.

## Требования

### Node.js

**Версия**: Node.js 18+ (LTS рекомендуется)

```bash
# Проверить версию
node --version

# Установить через nvm (рекомендуется)
nvm install 18
nvm use 18
```

### Package Manager

Мы используем **npm** (встроен в Node.js).

```bash
# Проверить версию
npm --version
```

### Git

```bash
# Проверить версию
git --version
```

### VS Code Extensions (рекомендуется)

- **ESLint** - для линтинга
- **Prettier** - для форматирования
- **Prisma** - для работы с Prisma schema
- **SolidJS** - для поддержки SolidJS
- **TypeScript** - для поддержки TypeScript

## Environment Variables

### Backend (.env)

Создайте файл `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Создайте файл `frontend/.env`:

```env
# API
VITE_API_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

⚠️ **Важно**: 
- Не коммитьте `.env` файлы в Git
- Используйте `.env.example` для шаблонов
- В production используйте переменные окружения платформы

## Database Setup

### 1. Создать Supabase проект

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите connection strings из Settings → Database

### 2. Настроить Prisma

```bash
cd backend

# Установить зависимости
npm install

# Сгенерировать Prisma Client
npx prisma generate

# Применить миграции (если есть)
npx prisma migrate deploy

# Или создать первую миграцию
npx prisma migrate dev --name init
```

### 3. Prisma Studio (опционально)

```bash
# Открыть Prisma Studio для визуализации данных
npx prisma studio
```

## Local Development Workflow

### Backend

```bash
cd backend

# Установить зависимости
npm install

# Запустить в режиме разработки (с hot reload)
npm run start:dev

# Backend будет доступен на http://localhost:3000
```

### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Frontend будет доступен на http://localhost:5173
```

### Одновременный запуск

Используйте два терминала:
- Терминал 1: `cd backend && npm run start:dev`
- Терминал 2: `cd frontend && npm run dev`

Или используйте инструменты типа `concurrently`:

```bash
# В корне проекта
npm install -g concurrently

concurrently "cd backend && npm run start:dev" "cd frontend && npm run dev"
```

## Hot Reload

### Backend (NestJS)

NestJS автоматически перезагружается при изменении файлов благодаря `--watch` флагу.

```bash
npm run start:dev
```

### Frontend (Vite)

Vite обеспечивает мгновенную перезагрузку (HMR) при изменении файлов.

```bash
npm run dev
```

## Debugging Setup

### Backend (VS Code)

Создайте `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

Запуск: F5 или через Debug панель VS Code.

### Frontend (VS Code)

Для отладки SolidJS используйте DevTools браузера:
- Chrome DevTools
- SolidJS DevTools extension

## Структура проекта

```
project-root/
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── docs/
    └── tech-stack/
```

## Первоначальная настройка проекта

### 1. Клонировать репозиторий

```bash
git clone <repository-url>
cd test.admin_logistic_v8
```

### 2. Настроить Backend

```bash
cd backend

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env
# Отредактировать .env с вашими значениями

# Сгенерировать Prisma Client
npx prisma generate

# Применить миграции
npx prisma migrate deploy
```

### 3. Настроить Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env
# Отредактировать .env с вашими значениями
```

### 4. Запустить проект

```bash
# Терминал 1 - Backend
cd backend
npm run start:dev

# Терминал 2 - Frontend
cd frontend
npm run dev
```

## Troubleshooting

### Проблема: Prisma Client не генерируется

```bash
# Решение
cd backend
npx prisma generate
```

### Проблема: Ошибка подключения к БД

1. Проверьте `DATABASE_URL` в `.env`
2. Убедитесь, что используете правильный connection string (pooler для приложения, direct для миграций)
3. Проверьте доступность Supabase проекта

### Проблема: Порт уже занят

```bash
# Изменить порт в .env
PORT=3001  # для backend

# Или в vite.config.ts для frontend
server: {
  port: 5174
}
```

### Проблема: TypeScript ошибки

```bash
# Пересобрать проект
cd backend
npm run build

# Или очистить кэш
rm -rf node_modules dist
npm install
```

## Полезные команды

### Backend

```bash
# Разработка
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
npx prisma studio          # Открыть Prisma Studio
npx prisma migrate dev     # Создать миграцию
npx prisma migrate deploy  # Применить миграции
npx prisma generate        # Сгенерировать Client
```

### Frontend

```bash
# Разработка
npm run dev

# Production build
npm run build

# Preview production build
npm run serve
```

## Ссылки

- [Node.js Installation](https://nodejs.org/)
- [Supabase Setup](https://supabase.com/docs/guides/getting-started)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- [Vite Guide](https://vitejs.dev/guide/)

