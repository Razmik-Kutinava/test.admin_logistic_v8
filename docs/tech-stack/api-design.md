# API Design Standards

## Введение

Этот документ описывает стандарты проектирования REST API для Admin Logistic Panel v8. Мы следуем RESTful принципам и используем единообразный формат для всех endpoints.

## URL структура

### Базовый путь

```
/api/v1/
```

Все API endpoints начинаются с `/api/v1/`.

### Ресурсы

Используйте существительные во множественном числе:

```
✅ Хорошо:
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

❌ Плохо:
GET    /api/v1/user/:id
POST   /api/v1/createUser
GET    /api/v1/getUsers
```

### Вложенные ресурсы

```
✅ Хорошо:
GET    /api/v1/users/:userId/posts
POST   /api/v1/users/:userId/posts
GET    /api/v1/users/:userId/posts/:postId
```

## HTTP методы

### GET - Получение данных

```typescript
// Получить все ресурсы
GET /api/v1/users

// Получить один ресурс
GET /api/v1/users/:id

// Получить вложенные ресурсы
GET /api/v1/users/:id/posts
```

### POST - Создание ресурса

```typescript
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### PUT - Полное обновление ресурса

```typescript
PUT /api/v1/users/:id
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "1234567890"
}
```

### PATCH - Частичное обновление ресурса

```typescript
PATCH /api/v1/users/:id
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

### DELETE - Удаление ресурса

```typescript
DELETE /api/v1/users/:id
```

## Status Codes

### Успешные ответы

- `200 OK` - Успешный GET, PUT, PATCH
- `201 Created` - Успешное создание ресурса (POST)
- `204 No Content` - Успешное удаление (DELETE)

### Ошибки клиента

- `400 Bad Request` - Неверный запрос (валидация)
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Доступ запрещен
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Конфликт (например, дубликат email)
- `422 Unprocessable Entity` - Ошибка валидации данных

### Ошибки сервера

- `500 Internal Server Error` - Внутренняя ошибка сервера
- `503 Service Unavailable` - Сервис недоступен

## Request/Response Formats

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
```

### Успешный Response

```typescript
// GET /api/v1/users/:id
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}

// GET /api/v1/users
{
  "data": [
    { "id": 1, "email": "user1@example.com", "name": "John" },
    { "id": 2, "email": "user2@example.com", "name": "Jane" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}

// POST /api/v1/users
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

### Error Response

```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users",
  "details": [
    {
      "field": "email",
      "message": "email must be an email"
    }
  ]
}
```

## Error Handling

### NestJS Exception Filters

```typescript
// http-exception.filter.ts
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
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Validation Errors

```typescript
// validation-exception.filter.ts
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionResponse = exception.getResponse();
    const validationErrors = (exceptionResponse as any).message;

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path: request.url,
      details: Array.isArray(validationErrors)
        ? validationErrors.map((error: string) => ({
            field: this.extractField(error),
            message: error,
          }))
        : [{ message: validationErrors }],
    });
  }

  private extractField(error: string): string {
    const match = error.match(/^(\w+)\s/);
    return match ? match[1] : 'unknown';
  }
}
```

## Pagination

### Query Parameters

```
GET /api/v1/users?page=1&limit=10&sort=createdAt&order=desc
```

### Response Format

```typescript
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Implementation

```typescript
// users.controller.ts
@Get()
async findAll(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('sort') sort: string = 'createdAt',
  @Query('order') order: 'asc' | 'desc' = 'desc',
) {
  return this.usersService.findAll({
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    order,
  });
}
```

## Filtering и Sorting

### Filtering

```
GET /api/v1/users?status=active&role=admin
```

```typescript
@Get()
async findAll(@Query() query: FilterUserDto) {
  return this.usersService.findAll(query);
}

// dto/filter-user.dto.ts
export class FilterUserDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### Sorting

```
GET /api/v1/users?sort=createdAt&order=desc
```

```typescript
export class SortDto {
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
```

## Authentication Headers

### Bearer Token

```
Authorization: Bearer <jwt_token>
```

### Implementation

```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    // Валидация токена
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## CORS настройки

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

## API Versioning

### URL Versioning

```
/api/v1/users
/api/v2/users
```

### Header Versioning

```
Accept: application/vnd.api+json;version=1
```

Мы используем **URL versioning** для простоты.

## OpenAPI/Swagger документация

### Настройка

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Admin Logistic API')
  .setDescription('API documentation for Admin Logistic Panel')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('users', 'User management')
  .addTag('posts', 'Post management')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Документирование Endpoints

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

## Примеры Endpoints

### Полный CRUD пример

```typescript
// users.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: FilterUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id')
  async partialUpdate(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

## Best Practices

### ✅ DO

1. **Используйте существительные** для ресурсов
2. **Используйте правильные HTTP методы**
3. **Возвращайте единообразные ответы**
4. **Обрабатывайте ошибки явно**
5. **Документируйте API** через Swagger
6. **Используйте версионирование** для API
7. **Валидируйте все входные данные**

### ❌ DON'T

1. **Не используйте глаголы** в URL (`/api/v1/createUser`)
2. **Не возвращайте разные форматы** для одинаковых операций
3. **Не игнорируйте ошибки** - всегда возвращайте понятные сообщения
4. **Не используйте GET** для операций с побочными эффектами
5. **Не передавайте чувствительные данные** в URL параметрах

## Ссылки

- [REST API Design Best Practices](https://restfulapi.net/)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [OpenAPI Specification](https://swagger.io/specification/)

