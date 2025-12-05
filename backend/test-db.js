const { PrismaClient } = require('@prisma/client');

// Для Prisma 7 требуется передать DATABASE_URL в конструктор
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✓ База данных подключена успешно!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('✗ Ошибка подключения:', error.message);
    process.exit(1);
  }
}

testConnection();
