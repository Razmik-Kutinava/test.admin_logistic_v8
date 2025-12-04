# Authentication Guide

## Введение

Мы используем Supabase Auth для аутентификации пользователей. Этот документ описывает полный flow аутентификации, от регистрации до защиты маршрутов.

## Supabase Auth Overview

Supabase Auth предоставляет:
- JWT токены (Access + Refresh)
- Email/Password аутентификация
- Social auth (Google, GitHub, etc)
- Session management
- Password reset

## JWT Tokens

### Access Token
- Короткоживущий токен (обычно 1 час)
- Используется для авторизации запросов
- Передается в заголовке `Authorization: Bearer <token>`

### Refresh Token
- Долгоживущий токен (обычно 7 дней)
- Используется для получения нового access token
- Хранится в httpOnly cookie или localStorage

## Auth Flow

### 1. Регистрация

```typescript
// Frontend
import { supabase } from './supabase';

async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

### 2. Вход

```typescript
// Frontend
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

### 3. Получение сессии

```typescript
// Frontend
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const accessToken = session.access_token;
  // Использовать токен для API запросов
}
```

### 4. Обновление токена

```typescript
// Frontend - автоматически через Supabase client
const { data: { session } } = await supabase.auth.refreshSession();
```

## Backend Integration

### Supabase Service

```typescript
// auth/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Service role для backend
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

  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) return null;
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
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.supabase.verifyToken(token);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Использование Guard

```typescript
// users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Request() req) {
    return req.user; // Пользователь из токена
  }

  // Или для всего контроллера
  @UseGuards(AuthGuard)
  @Controller('protected')
  export class ProtectedController {
    // Все маршруты защищены
  }
}
```

## Protected Routes (Frontend)

### SolidJS Router Guard

```typescript
// components/ProtectedRoute.tsx
import { Component, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: any;
}

const ProtectedRoute: Component<ProtectedRouteProps> = (props) => {
  const [user] = useAuth();

  return (
    <Show when={user()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
};

export default ProtectedRoute;
```

### Использование

```typescript
// App.tsx
import { Route } from '@solidjs/router';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

<Route path="/dashboard">
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

## Session Management

### Auth Context (Frontend)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, createSignal, ParentComponent, createEffect } from 'solid-js';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: () => User | null;
  loading: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);

  // Проверка сессии при загрузке
  createEffect(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);

    // Подписка на изменения auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  });

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## Logout Flow

```typescript
// Frontend
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return;
  }
  // Перенаправление на страницу входа
  navigate('/login');
}
```

## Password Reset

### Запрос сброса пароля

```typescript
// Frontend
async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}
```

### Обновление пароля

```typescript
// Frontend
async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}
```

## Social Auth (если нужно)

### Google Auth

```typescript
// Frontend
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}
```

### GitHub Auth

```typescript
async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}
```

## API запросы с токеном

### Frontend

```typescript
// api/client.ts
import { supabase } from '../supabase';

export async function apiRequest(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

## Примеры кода

### Полный пример Auth Service (Backend)

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async validateUser(token: string) {
    const user = await this.supabase.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }

  async getUserFromToken(token: string) {
    return this.supabase.getUser(token);
  }
}
```

### Полный пример Login Page (Frontend)

```typescript
// pages/Login.tsx
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';

const Login: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email(), password());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        placeholder="Password"
        required
      />
      {error() && <p class="error">{error()}</p>}
      <button type="submit" disabled={loading()}>
        {loading() ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default Login;
```

## Best Practices

### ✅ DO

1. **Всегда проверяйте токен** на backend
2. **Используйте httpOnly cookies** для refresh token (если возможно)
3. **Обрабатывайте истечение токена** и обновляйте его автоматически
4. **Валидируйте email** перед регистрацией
5. **Используйте сильные пароли** (валидация на frontend и backend)

### ❌ DON'T

1. **Не храните токены** в localStorage для production (используйте httpOnly cookies)
2. **Не передавайте токены** в URL параметрах
3. **Не логируйте токены** в консоль или логи
4. **Не используйте access token** дольше его срока жизни
5. **Не игнорируйте ошибки** аутентификации

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY] # Только для backend!

# Frontend
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

## Ссылки

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

