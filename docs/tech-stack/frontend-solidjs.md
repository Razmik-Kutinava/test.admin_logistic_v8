# Frontend: SolidJS Guide

## Введение

SolidJS - это реактивный UI фреймворк с высокой производительностью. Мы используем SolidJS 1.9.x с TypeScript. SolidJS компилирует реактивность на этапе сборки, что дает отличную производительность без Virtual DOM.

## Основные концепции

### Signals (Сигналы)

Signals - это основа реактивности в SolidJS. Они хранят значение и автоматически обновляют компоненты при изменении.

```typescript
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

⚠️ **Важно**: Всегда вызывайте сигнал как функцию `count()`, а не `count`.

### Effects (Эффекты)

Effects выполняют побочные эффекты при изменении сигналов.

```typescript
import { createSignal, createEffect } from 'solid-js';

function Example() {
  const [name, setName] = createSignal('John');

  createEffect(() => {
    console.log('Name changed:', name());
  });

  return <input value={name()} onInput={(e) => setName(e.currentTarget.value)} />;
}
```

### Memos (Мемоизация)

Memos кэшируют вычисления и пересчитывают только при изменении зависимостей.

```typescript
import { createSignal, createMemo } from 'solid-js';

function ExpensiveComponent() {
  const [items, setItems] = createSignal([1, 2, 3, 4, 5]);

  const doubled = createMemo(() => {
    return items().map(item => item * 2);
  });

  return <div>{doubled().join(', ')}</div>;
}
```

## Компоненты

### Функциональные компоненты

SolidJS использует **только** функциональные компоненты.

```typescript
import type { Component } from 'solid-js';

interface Props {
  name: string;
  age?: number;
}

const UserCard: Component<Props> = (props) => {
  return (
    <div>
      <h2>{props.name}</h2>
      {props.age && <p>Age: {props.age}</p>}
    </div>
  );
};

export default UserCard;
```

### Props и children

```typescript
import type { Component, JSX } from 'solid-js';

interface LayoutProps {
  title: string;
  children: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  );
};
```

### Условный рендеринг

```typescript
function Conditional() {
  const [show, setShow] = createSignal(true);

  return (
    <div>
      {show() && <p>Visible</p>}
      {show() ? <p>True</p> : <p>False</p>}
    </div>
  );
}
```

### Списки

```typescript
function List() {
  const [items, setItems] = createSignal(['a', 'b', 'c']);

  return (
    <ul>
      <For each={items()}>
        {(item) => <li>{item}</li>}
      </For>
    </ul>
  );
}
```

Или с индексами:

```typescript
<For each={items()}>
  {(item, index) => (
    <li>
      {index() + 1}: {item}
    </li>
  )}
</For>
```

## Управление состоянием

### createSignal (локальное состояние)

```typescript
const [value, setValue] = createSignal(0);

// Установить значение
setValue(5);

// Функциональное обновление
setValue(prev => prev + 1);
```

### createStore (объектное состояние)

```typescript
import { createStore } from 'solid-js/store';

const [state, setState] = createStore({
  user: {
    name: 'John',
    age: 30,
  },
  items: [],
});

// Обновление
setState('user', 'name', 'Jane');
setState('user', { name: 'Jane', age: 31 });

// Массивы
setState('items', [...state.items, newItem]);
```

### Context API (глобальное состояние)

```typescript
// context.tsx
import { createContext, useContext, ParentComponent } from 'solid-js';

interface AppContextType {
  user: () => User | null;
  setUser: (user: User) => void;
}

const AppContext = createContext<AppContextType>();

export const AppProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {props.children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
```

## Роутинг (solid-router)

### Установка

```bash
npm install @solidjs/router
```

### Настройка роутера

```typescript
// App.tsx
import { Router, Routes, Route } from '@solidjs/router';
import Home from './pages/Home';
import About from './pages/About';
import User from './pages/User';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/user/:id" component={User} />
      </Routes>
    </Router>
  );
}
```

### Навигация

```typescript
import { useNavigate, useParams } from '@solidjs/router';

function UserPage() {
  const params = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <p>User ID: {params.id}</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
```

### Защищенные маршруты

```typescript
import { Navigate } from '@solidjs/router';

function ProtectedRoute(props: { children: JSX.Element }) {
  const [user] = useApp();

  return user() ? props.children : <Navigate href="/login" />;
}
```

## Формы и валидация

### Простая форма

```typescript
import { createSignal } from 'solid-js';

function LoginForm() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Обработка формы
    console.log({ email: email(), password: password() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
        required
      />
      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Валидация

```typescript
function ValidatedForm() {
  const [email, setEmail] = createSignal('');
  const [error, setError] = createSignal('');

  const validateEmail = (value: string) => {
    if (!value.includes('@')) {
      setError('Invalid email');
      return false;
    }
    setError('');
    return true;
  };

  return (
    <form>
      <input
        type="email"
        value={email()}
        onInput={(e) => {
          setEmail(e.currentTarget.value);
          validateEmail(e.currentTarget.value);
        }}
      />
      {error() && <p class="error">{error()}</p>}
    </form>
  );
}
```

## HTTP запросы

### Fetch API

```typescript
import { createSignal, createEffect } from 'solid-js';

function UsersList() {
  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  });

  if (loading()) return <p>Loading...</p>;

  return (
    <ul>
      <For each={users()}>
        {(user) => <li>{user.name}</li>}
      </For>
    </ul>
  );
}
```

### Создание API клиента

```typescript
// api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchUsers() {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}
```

### Supabase Client Integration

```typescript
// supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Использование
const { data, error } = await supabase
  .from('users')
  .select('*');
```

## Styling

### CSS Modules

```typescript
// UserCard.module.css
.card {
  padding: 1rem;
  border: 1px solid #ccc;
}

.title {
  font-size: 1.5rem;
  color: #333;
}
```

```typescript
// UserCard.tsx
import styles from './UserCard.module.css';

function UserCard() {
  return (
    <div class={styles.card}>
      <h2 class={styles.title}>User</h2>
    </div>
  );
}
```

### Inline Styles

```typescript
function StyledComponent() {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
      Content
    </div>
  );
}
```

### Tailwind CSS (если используем)

```bash
npm install -D tailwindcss postcss autoprefixer
```

```typescript
function TailwindComponent() {
  return (
    <div class="p-4 bg-gray-100 rounded-lg">
      <h2 class="text-2xl font-bold">Title</h2>
    </div>
  );
}
```

## SSR/SSG

SolidJS поддерживает SSR через `solid-start` (если используем).

## Примеры компонентов

### Полный пример компонента

```typescript
import { Component, createSignal, createEffect, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';

interface User {
  id: number;
  name: string;
  email: string;
}

const UsersPage: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);
  const navigate = useNavigate();

  createEffect(async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div>
      <h1>Users</h1>
      {loading() ? (
        <p>Loading...</p>
      ) : (
        <ul>
          <For each={users()}>
            {(user) => (
              <li>
                <button onClick={() => navigate(`/users/${user.id}`)}>
                  {user.name} - {user.email}
                </button>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
};

export default UsersPage;
```

## Best Practices

### ✅ DO

1. **Всегда вызывайте сигналы как функции** `count()`, не `count`
2. **Используйте createMemo** для дорогих вычислений
3. **Используйте createStore** для сложных объектов состояния
4. **Разделяйте компоненты** на маленькие, переиспользуемые части
5. **Используйте TypeScript** для типизации props и состояния
6. **Обрабатывайте ошибки** в async операциях

### ❌ DON'T (Отличия от React)

1. **НЕ используйте React hooks** (useState, useEffect, etc) - используйте SolidJS API
2. **НЕ используйте Virtual DOM паттерны** - SolidJS компилирует реактивность
3. **НЕ деструктурируйте props** в параметрах функции - используйте `props.name`
4. **НЕ используйте ключи в For** - SolidJS автоматически отслеживает элементы
5. **НЕ создавайте компоненты через классы** - только функции
6. **НЕ используйте React.memo** - не нужно, реактивность на уровне компиляции

## Отличия от React

| React | SolidJS |
|-------|---------|
| `useState` | `createSignal` |
| `useEffect` | `createEffect` |
| `useMemo` | `createMemo` |
| `useContext` | `useContext` (аналогично) |
| Virtual DOM | Компилированная реактивность |
| Рендер всего компонента | Обновление только измененных узлов |

## Ссылки

- [Официальная документация SolidJS](https://www.solidjs.com/docs/latest)
- [SolidJS Tutorial](https://www.solidjs.com/tutorial/introduction_basics)
- [SolidJS Router](https://github.com/solidjs/solid-router)

