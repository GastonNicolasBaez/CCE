#!/usr/bin/env node

/**
 * Script para ejecutar migraciones en Railway
 * Se puede ejecutar manualmente o como part del deployment
 */

const { exec } = require('child_process');
const path = require('path');

// Configurar NODE_ENV si no está definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log('🚀 Starting database migrations...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`📍 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

// Función para ejecutar comandos con promesas
const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Executing: ${command}`);
    
    const child = exec(command, {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStdout: ${stdout}\nStderr: ${stderr}`));
      }
    });
  });
};

// Función principal
async function runMigrations() {
  try {
    // Verificar que sequelize-cli esté disponible
    console.log('\n📦 Checking Sequelize CLI...');
    await execPromise('npx sequelize-cli --version');

    // Ejecutar migraciones
    console.log('\n🗄️  Running database migrations...');
    await execPromise('npx sequelize-cli db:migrate');

    console.log('\n✅ Migrations completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('   • Your database is now ready');
    console.log('   • You can start your application');
    console.log('   • Optionally run seeders: npm run db:seed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check DATABASE_URL is set correctly');
    console.log('   2. Verify database connection');
    console.log('   3. Check migration files exist');
    console.log('   4. Review error details above');
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };