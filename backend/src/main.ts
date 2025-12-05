import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global exception filter for Prisma errors
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Admin Logistic API')
    .setDescription('Admin Logistic Panel v8 API Documentation')
    .setVersion('1.0')
    .addTag('drivers', 'Driver management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('deliveries', 'Delivery tracking endpoints')
    .addTag('districts', 'District management endpoints')
    .addTag('warehouses', 'Warehouse management endpoints')
    .addTag('dashboard', 'Dashboard and analytics endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
