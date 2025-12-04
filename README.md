# Admin Logistic Panel v8

> Современная система управления логистикой с раздельной архитектурой frontend и backend

## 📋 Описание проекта

**Admin Logistic Panel v8** — веб-приложение для управления логистическими процессами: управление заказами, отслеживание доставки, управление курьерами и складами. Проект построен на современном технологическом стеке с раздельной архитектурой frontend и backend.

## 🏗️ Архитектура

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Prisma Client      ┌─────────────┐
│   SolidJS   │ ──────────────────> │   NestJS    │ ──────────────────────> │ PostgreSQL  │
│  Frontend   │ <────────────────── │  Backend    │ <────────────────────── │  (Supabase) │
└─────────────┘      JSON/API       └─────────────┘      SQL Queries         └─────────────┘
```

## 🛠️ Технологический стек

### Backend
- **NestJS 11.x** — прогрессивный Node.js фреймворк
- **Prisma 7.x** — современный ORM для TypeScript
- **Supabase** — PostgreSQL, аутентификация, хранение файлов
- **TypeScript 5.9.x** — строгая типизация
- **Node.js 18+** — среда выполнения

### Frontend
- **SolidJS 1.9.x** — реактивный UI фреймворк
- **Vite 7.x** — быстрый сборщик и dev-сервер
- **TypeScript 5.7.x** — строгая типизация

### База данных
- **PostgreSQL** — реляционная БД (через Supabase)
- **Prisma ORM** — для работы с БД

## 📁 Структура проекта

```
test.admin_logistic_v8/
├── backend/                    # NestJS приложение
│   ├── src/
│   │   ├── app.module.ts      # Корневой модуль
│   │   ├── app.controller.ts  # Корневой контроллер
│   │   ├── app.service.ts     # Корневой сервис
│   │   └── main.ts            # Точка входа (порт 3000)
│   ├── prisma/
│   │   └── schema.prisma      # Prisma схема (модель User)
│   ├── dist/                  # Скомпилированный код
│   ├── test/                  # E2E тесты
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # SolidJS приложение
│   ├── src/
│   │   ├── App.tsx            # Корневой компонент
│   │   ├── index.tsx          # Точка входа
│   │   └── Comp.tsx           # Пример компонента
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── docs/                      # Документация
    ├── AI-REFERENCE.md        # Быстрая справка для AI
    ├── development-team/      # Документация команды
    └── tech-stack/            # Детальная документация по технологиям
```

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+ (LTS рекомендуется)
- **npm** (встроен в Node.js)
- **Git**
- **Supabase** аккаунт (для базы данных)

### Установка

1. **Клонировать репозиторий**
   ```bash
   git clone <repository-url>
   cd test.admin_logistic_v8
   ```

2. **Настроить Backend**
   ```bash
   cd backend
   npm install
   
   # Создать .env файл
   cp .env.example .env
   # Отредактировать .env с вашими Supabase credentials
   
   # Сгенерировать Prisma Client
   npx prisma generate
   
   # Применить миграции
   npx prisma migrate deploy
   ```

3. **Настроить Frontend**
   ```bash
   cd frontend
   npm install
   
   # Создать .env файл
   cp .env.example .env
   # Отредактировать .env с вашими API URL и Supabase keys
   ```

### Запуск

**Backend (терминал 1):**
```bash
cd backend
npm run start:dev
# Backend будет доступен на http://localhost:3000
```

**Frontend (терминал 2):**
```bash
cd frontend
npm run dev
# Frontend будет доступен на http://localhost:5173
```

## 📝 Environment Variables

### Backend (.env)

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
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

## 🧪 Тестирование

### Backend

```bash
cd backend

# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

Тестирование frontend настраивается по необходимости.

## 📚 Документация

### Для разработчиков

- **[AI-REFERENCE.md](docs/AI-REFERENCE.md)** — быстрая справка для AI и разработчиков
- **[Tech Stack Overview](docs/tech-stack/overview.md)** — общий обзор технологий
- **[Backend Guide](docs/tech-stack/backend-nestjs.md)** — полный гайд по NestJS
- **[Frontend Guide](docs/tech-stack/frontend-solidjs.md)** — полный гайд по SolidJS
- **[Database Guide](docs/tech-stack/database-prisma.md)** — Prisma ORM гайд
- **[API Design](docs/tech-stack/api-design.md)** — стандарты REST API
- **[Authentication](docs/tech-stack/authentication.md)** — аутентификация через Supabase

### Для команды

- **[Team Master Reference](docs/development-team/TEAM-MASTER-REFERENCE.md)** — главный справочник по команде
- **[Team Structure](docs/development-team/team-structure.md)** — структура команды
- **[Personas](docs/development-team/personas/)** — профили ролей команды
- **[Workflows](docs/development-team/workflows/)** — рабочие процессы
- **[Interactions](docs/development-team/interactions/)** — взаимодействия между ролями

## 🎯 Текущее состояние проекта

### ✅ Готово

- Базовая структура NestJS backend
- Базовая структура SolidJS frontend
- Prisma схема с моделью User
- Настроен TypeScript (строгий режим)
- Supabase клиент установлен
- Полная документация по стеку
- Документация команды разработки

### 🚧 В разработке

- Аутентификация (Supabase Auth)
- API endpoints для бизнес-логики
- UI компоненты
- Роутинг (solid-router)

### 📋 Планируется

- Модули для управления заказами
- Отслеживание доставки
- Управление курьерами
- Управление складами
- Dashboard и аналитика

## 🔧 Команды разработки

### Backend

```bash
cd backend

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
cd frontend

# Разработка (с HMR)
npm run dev

# Production build
npm run build

# Preview production build
npm run serve
```

## 🗄️ База данных

### Текущая схема

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Работа с Prisma

```bash
cd backend

# Создать миграцию
npx prisma migrate dev --name migration_name

# Применить миграции
npx prisma migrate deploy

# Открыть Prisma Studio (GUI)
npx prisma studio

# Сгенерировать Client
npx prisma generate
```

## 🚫 Запрещенные практики

### ❌ НЕ использовать:

- **React** — используем SolidJS
- **Express напрямую** — используем NestJS декораторы
- **TypeORM, Sequelize** — используем Prisma
- **MongoDB** — используем PostgreSQL
- **`any` типы** — строгая типизация TypeScript
- **React hooks** — используем SolidJS API (createSignal, createEffect)

### ✅ Использовать:

- **SolidJS**: `createSignal`, `createEffect`, `createMemo`
- **NestJS**: декораторы, модули, DI
- **Prisma**: типобезопасные запросы
- **TypeScript**: строгая типизация

## 📖 Полезные ссылки

### Технологии

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SolidJS Documentation](https://www.solidjs.com/docs/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Документация проекта

- [AI Reference](docs/AI-REFERENCE.md)
- [Tech Stack](docs/tech-stack/)
- [Development Team](docs/development-team/)

## 🤝 Команда разработки

Проект разрабатывается виртуальной командой:

- **Product Manager** — требования и приоритеты
- **Tech Lead** — архитектура и координация
- **Backend Developer** — NestJS API и бизнес-логика
- **Frontend Developer** — SolidJS UI/UX
- **QA Engineer** — тестирование и качество
- **DevOps Engineer** — CI/CD и инфраструктура

Подробнее: [Development Team Documentation](docs/development-team/)

## 📄 Лицензия

UNLICENSED

## 📞 Контакты

Для вопросов и предложений создавайте issues в репозитории.

---

**Версия**: 0.0.1  
**Последнее обновление**: 2024-12-04

