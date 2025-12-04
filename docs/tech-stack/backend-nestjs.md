# Backend: NestJS Guide

## Введение

NestJS - это прогрессивный Node.js фреймворк для построения эффективных и масштабируемых серверных приложений. Мы используем NestJS 11.x с TypeScript в строгом режиме.

## Основные концепции

### Модульная архитектура

NestJS построен на модульной архитектуре. Каждый модуль инкапсулирует связанную функциональность.

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Экспортируем для использования в других модулях
})
export class UsersModule {}
```

### Dependency Injection (DI)

NestJS использует DI для управления зависимостями. Это делает код тестируемым и модульным.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} // Автоматическая инъекция

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

## Структура проекта

```
backend/
├── src/
│   ├── app.module.ts          # Корневой модуль
│   ├── app.controller.ts      # Корневой контроллер
│   ├── app.service.ts         # Корневой сервис
│   ├── main.ts                # Точка входа
│   ├── users/                 # Модуль пользователей (пример)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   └── prisma/
│       └── prisma.service.ts  # Prisma сервис
├── prisma/
│   └── schema.prisma
└── dist/                       # Скомпилированный код
```

## Декораторы

### @Module()
Определяет модуль приложения.

```typescript
@Module({
  imports: [OtherModule],        // Импортируем другие модули
  controllers: [UsersController], // Контроллеры модуля
  providers: [UsersService],     // Провайдеры (сервисы)
  exports: [UsersService],       // Экспортируем для других модулей
})
export class UsersModule {}
```

### @Controller()
Определяет контроллер для обработки HTTP запросов.

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('users') // Префикс маршрута: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()           // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')      // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()          // POST /users
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### @Injectable()
Помечает класс как провайдер, который может быть внедрен через DI.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Сервисная логика
}
```

### HTTP методы декораторы

```typescript
@Get()        // GET запрос
@Post()       // POST запрос
@Put()        // PUT запрос
@Patch()      // PATCH запрос
@Delete()     // DELETE запрос
```

### Параметры запроса

```typescript
@Get(':id')
findOne(
  @Param('id') id: string,              // Параметр пути
  @Query('page') page: number,          // Query параметр
  @Body() body: CreateUserDto,          // Тело запроса
  @Headers('authorization') auth: string, // Заголовок
) {
  // ...
}
```

## Guards (Защита маршрутов)

Guards определяют, может ли запрос быть обработан маршрутом.

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Проверка аутентификации
    return !!request.user;
  }
}
```

Использование:

```typescript
@Controller('users')
@UseGuards(AuthGuard) // Применяется ко всем маршрутам контроллера
export class UsersController {
  @Get('profile')
  @UseGuards(AuthGuard) // Или к конкретному маршруту
  getProfile() {
    // ...
  }
}
```

## Pipes (Валидация и трансформация)

Pipes используются для валидации и трансформации данных.

### ValidationPipe

```typescript
import { ValidationPipe } from '@nestjs/common';

// В main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Удаляет свойства, не описанные в DTO
  forbidNonWhitelisted: true, // Выбрасывает ошибку при лишних свойствах
  transform: true,        // Автоматически преобразует типы
}));
```

### Кастомный Pipe

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

## Interceptors (Перехватчики)

Interceptors позволяют добавлять логику до/после выполнения обработчика.

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

## Exception Filters

Обработка исключений.

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

## Примеры использования

### Создание модуля

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### CRUD операции

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### Валидация DTO

```typescript
// users/dto/create-user.dto.ts
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
```

### Обработка ошибок

```typescript
import { NotFoundException } from '@nestjs/common';

async findOne(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return user;
}
```

## Best Practices

### ✅ DO

1. **Используйте модули для организации кода**
   ```typescript
   @Module({
     imports: [PrismaModule],
     controllers: [UsersController],
     providers: [UsersService],
   })
   ```

2. **Создавайте DTO для всех входных данных**
   ```typescript
   export class CreateUserDto {
     @IsEmail()
     email: string;
   }
   ```

3. **Используйте Dependency Injection**
   ```typescript
   constructor(private prisma: PrismaService) {}
   ```

4. **Обрабатывайте ошибки явно**
   ```typescript
   if (!user) {
     throw new NotFoundException('User not found');
   }
   ```

5. **Используйте Guards для защиты маршрутов**
   ```typescript
   @UseGuards(AuthGuard)
   ```

### ❌ DON'T

1. **Не используйте Express напрямую** (используйте NestJS декораторы)
2. **Не создавайте глобальные переменные** (используйте DI)
3. **Не игнорируйте валидацию** (всегда используйте DTO)
4. **Не смешивайте бизнес-логику с контроллерами** (используйте сервисы)
5. **Не используйте синхронный код для I/O операций** (используйте async/await)

## Swagger/OpenAPI Integration

Для добавления Swagger документации:

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Admin Logistic API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

## Ссылки

- [Официальная документация NestJS](https://docs.nestjs.com/)
- [NestJS GitHub](https://github.com/nestjs/nest)

