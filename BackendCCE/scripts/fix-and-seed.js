/**
 * Script para arreglar la columna tenant_id y ejecutar el seeder
 */

const { sequelize } = require('../src/models');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixAndSeed() {
  try {
    console.log('🔧 Arreglando columna tenant_id...');

    // Permitir NULL en tenant_id para super_admin
    await sequelize.query('ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL;');
    console.log('✅ Columna tenant_id ahora permite NULL');

    // Preguntar si quiere limpiar datos
    console.log('\n⚠️  ADVERTENCIA: Se detectaron datos existentes en la base de datos.');
    const answer = await question('¿Deseas ELIMINAR todos los datos y empezar de cero? (s/n): ');

    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
      console.log('\n🗑️  Limpiando base de datos...');

      await sequelize.query('TRUNCATE TABLE usuarios, socios, cuotas, actividades, socio_actividades, tenant_configuracion, tenants RESTART IDENTITY CASCADE;');
      console.log('✅ Base de datos limpia');

      // Cerrar conexión
      await sequelize.close();
      rl.close();
      console.log('✅ Conexión cerrada');

      console.log('\n🌱 Ejecutando seeders...');

      // Ejecutar seeder
      execSync('npm run db:seed', { stdio: 'inherit' });

      console.log('\n✅ ¡Todo listo! Ahora puedes hacer login con:');
      console.log('   - admin@espora.com / password123');
      console.log('   - admin@demo.com / password123');
      console.log('   - superadmin@cce.com / password123');
    } else {
      console.log('\n❌ Operación cancelada. Los datos existentes no fueron modificados.');
      console.log('\nSi quieres intentar el login con las credenciales existentes:');
      console.log('   - admin@espora.com / password123');
      console.log('   - admin@demo.com / password123');
      console.log('   - superadmin@cce.com / password123');

      await sequelize.close();
      rl.close();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

fixAndSeed();
