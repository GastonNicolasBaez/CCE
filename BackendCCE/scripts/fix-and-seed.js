/**
 * Script para arreglar la columna tenant_id y ejecutar el seeder
 */

const { sequelize } = require('../src/models');
const { execSync } = require('child_process');

async function fixAndSeed() {
  try {
    console.log('🔧 Arreglando columna tenant_id...');

    // Permitir NULL en tenant_id para super_admin
    await sequelize.query('ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL;');
    console.log('✅ Columna tenant_id ahora permite NULL');

    // Cerrar conexión
    await sequelize.close();
    console.log('✅ Conexión cerrada');

    console.log('\n🌱 Ejecutando seeders...');

    // Ejecutar seeder
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('\n✅ ¡Todo listo! Ahora puedes hacer login con:');
    console.log('   - admin@espora.com / password123');
    console.log('   - admin@demo.com / password123');
    console.log('   - superadmin@cce.com / Admin2024!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAndSeed();
