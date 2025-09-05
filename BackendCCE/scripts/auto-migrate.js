#!/usr/bin/env node

/**
 * Script que ejecuta migraciones automáticamente al hacer deploy
 * Solo en producción y si AUTO_MIGRATE=true
 */

const { exec } = require('child_process');
const path = require('path');

// Solo ejecutar en producción si AUTO_MIGRATE está habilitado
const shouldMigrate = process.env.NODE_ENV === 'production' && 
                     process.env.AUTO_MIGRATE === 'true';

if (!shouldMigrate) {
  console.log('⚠️  Auto-migration skipped');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   AUTO_MIGRATE: ${process.env.AUTO_MIGRATE}`);
  console.log('   To enable: set AUTO_MIGRATE=true in Railway');
  process.exit(0);
}

console.log('🚀 Running auto-migration...');

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executing: ${command}`);
    
    const child = exec(command, {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env }
    });

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with exit code ${code}`));
      }
    });
  });
};

async function runAutoMigration() {
  try {
    console.log('📦 Checking database connection...');
    
    // Verificar que DATABASE_URL esté configurado
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    // Verificar si necesitamos forzar migraciones
    if (process.env.FORCE_MIGRATION === 'true') {
      console.log('🔄 Force migration enabled - undoing all migrations first...');
      try {
        await execPromise('npx sequelize-cli db:migrate:undo:all');
        console.log('✅ All migrations undone');
      } catch (error) {
        console.log('⚠️  No migrations to undo or error undoing:', error.message);
      }
    }

    // Ejecutar migraciones
    console.log('🗄️  Running migrations...');
    await execPromise('npx sequelize-cli db:migrate');

    console.log('✅ Auto-migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Auto-migration failed:', error.message);
    console.log('⚠️  Continuing server startup without migrations...');
    console.log('   You may need to run migrations manually');
    // NO hacemos process.exit(1) para que el servidor siga arrancando
  }
}

runAutoMigration();