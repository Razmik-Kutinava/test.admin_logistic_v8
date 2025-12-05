/**
 * Скрипт для применения миграции в Supabase
 * 
 * ТРЕБОВАНИЯ:
 * 1. Установлен Supabase CLI: npm install -g supabase
 * 2. Настроен .env с DATABASE_URL
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * node apply-migration.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationFile = path.join(__dirname, 'prisma/migrations/20240101000000_init_schema/migration.sql');

console.log('🚀 Применение миграции базы данных...\n');

// Проверяем наличие файла миграции
if (!fs.existsSync(migrationFile)) {
  console.error('❌ Файл миграции не найден:', migrationFile);
  process.exit(1);
}

// Читаем SQL из файла
const sql = fs.readFileSync(migrationFile, 'utf8');

console.log('📋 SQL миграция загружена');
console.log('📝 Размер:', (sql.length / 1024).toFixed(2), 'KB\n');

console.log('⚠️  ВНИМАНИЕ: Supabase MCP в режиме только чтения.');
console.log('📌 Примените миграцию вручную:\n');
console.log('1. Откройте Supabase Dashboard: https://app.supabase.com');
console.log('2. Выберите проект');
console.log('3. Перейдите в SQL Editor');
console.log('4. Скопируйте содержимое файла: backend/APPLY_MIGRATION.sql');
console.log('5. Вставьте и выполните SQL\n');

console.log('Или используйте Supabase CLI:');
console.log('  supabase db push\n');

// Пытаемся применить через psql, если DATABASE_URL настроен
if (process.env.DATABASE_URL) {
  console.log('💡 Попытка применить через psql...\n');
  try {
    execSync(`psql "${process.env.DATABASE_URL}" -f "${migrationFile}"`, {
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('\n✅ Миграция применена успешно!');
  } catch (error) {
    console.error('\n❌ Ошибка при применении миграции через psql');
    console.error('💡 Примените миграцию вручную через Supabase Dashboard\n');
  }
} else {
  console.log('⚠️  DATABASE_URL не настроен в .env');
  console.log('💡 Примените миграцию вручную через Supabase Dashboard\n');
}

