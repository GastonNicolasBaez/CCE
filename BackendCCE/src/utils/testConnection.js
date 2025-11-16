const { sequelize, Usuario, Socio, Cuota } = require('../models');

/**
 * Script de verificación rápida del entorno de pruebas
 * Verifica que la base de datos esté correctamente configurada
 */

async function testConnection() {
  console.log('🔍 Verificando conexión y datos...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión establecida correctamente\n');

    // Test 2: Check users
    console.log('2️⃣ Verificando usuarios del sistema...');
    const users = await Usuario.findAll({
      attributes: ['id', 'email', 'nombre', 'apellido', 'rol', 'activo']
    });

    if (users.length === 0) {
      console.log('   ⚠️  No se encontraron usuarios');
      console.log('   💡 Ejecuta: npm run test-env\n');
      return false;
    }

    console.log(`   ✅ ${users.length} usuarios encontrados:`);
    users.forEach(user => {
      const status = user.activo ? '🟢' : '🔴';
      const roleIcon = user.rol === 'admin' ? '👑' : '👤';
      console.log(`      ${status} ${roleIcon} ${user.email} (${user.nombre} ${user.apellido}) - ${user.rol}`);
    });
    console.log('');

    // Test 3: Check socios
    console.log('3️⃣ Verificando socios del club...');
    const totalSocios = await Socio.count();
    const activeSocios = await Socio.count({ where: { estado: 'Activo' } });
    const inactiveSocios = await Socio.count({ where: { estado: 'Inactivo' } });
    const suspendedSocios = await Socio.count({ where: { estado: 'Suspendido' } });

    if (totalSocios === 0) {
      console.log('   ⚠️  No se encontraron socios');
      console.log('   💡 Ejecuta: npm run test-env\n');
      return false;
    }

    console.log(`   ✅ ${totalSocios} socios encontrados:`);
    console.log(`      🟢 Activos: ${activeSocios}`);
    console.log(`      🟠 Inactivos: ${inactiveSocios}`);
    console.log(`      🔴 Suspendidos: ${suspendedSocios}`);

    // Socios por actividad
    const sociosPorActividad = await sequelize.query(
      'SELECT actividad, COUNT(*) as total FROM socios GROUP BY actividad',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n   📊 Socios por actividad:');
    sociosPorActividad.forEach(({ actividad, total }) => {
      const icon = {
        'Basquet': '🏀',
        'Voley': '🏐',
        'Karate': '🥋',
        'Gimnasio': '💪',
        'Solo socio': '👥'
      }[actividad] || '📌';
      console.log(`      ${icon} ${actividad}: ${total}`);
    });
    console.log('');

    // Test 4: Check cuotas
    console.log('4️⃣ Verificando cuotas de pago...');
    const totalCuotas = await Cuota.count();
    const paidCuotas = await Cuota.count({ where: { estado: 'Pagada' } });
    const pendingCuotas = await Cuota.count({ where: { estado: 'Pendiente' } });
    const overdueCuotas = await Cuota.count({ where: { estado: 'Vencida' } });

    if (totalCuotas === 0) {
      console.log('   ⚠️  No se encontraron cuotas');
      console.log('   💡 Ejecuta: npm run test-env\n');
      return false;
    }

    console.log(`   ✅ ${totalCuotas} cuotas encontradas:`);
    console.log(`      💰 Pagadas: ${paidCuotas} (${Math.round((paidCuotas / totalCuotas) * 100)}%)`);
    console.log(`      ⏳ Pendientes: ${pendingCuotas} (${Math.round((pendingCuotas / totalCuotas) * 100)}%)`);
    console.log(`      ⚠️  Vencidas: ${overdueCuotas} (${Math.round((overdueCuotas / totalCuotas) * 100)}%)`);

    // Total de ingresos
    const totalIngresos = await sequelize.query(
      "SELECT SUM(monto) as total FROM cuotas WHERE estado = 'Pagada'",
      { type: sequelize.QueryTypes.SELECT }
    );

    const totalPendiente = await sequelize.query(
      "SELECT SUM(monto) as total FROM cuotas WHERE estado IN ('Pendiente', 'Vencida')",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n   💵 Montos:');
    console.log(`      Ingresado: $${Number(totalIngresos[0]?.total || 0).toLocaleString()}`);
    console.log(`      Pendiente: $${Number(totalPendiente[0]?.total || 0).toLocaleString()}`);
    console.log('');

    // Test 5: Sample queries
    console.log('5️⃣ Probando consultas complejas...');

    // Último socio registrado
    const lastSocio = await Socio.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['nombre', 'apellido', 'actividad', 'createdAt']
    });

    console.log(`   ✅ Último socio registrado: ${lastSocio.nombre} ${lastSocio.apellido} (${lastSocio.actividad})`);

    // Cuotas vencidas este mes
    const currentMonth = new Date().toISOString().slice(0, 7);
    const vencidasEsteMes = await Cuota.count({
      where: {
        estado: 'Vencida',
        periodo: currentMonth
      }
    });

    console.log(`   ✅ Cuotas vencidas este mes: ${vencidasEsteMes}`);
    console.log('');

    // Summary
    console.log('═'.repeat(60));
    console.log('✅ TODAS LAS VERIFICACIONES PASARON EXITOSAMENTE');
    console.log('═'.repeat(60));
    console.log('');
    console.log('🚀 El entorno de pruebas está listo para usar');
    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log('   Admin: admin@cce.com / admin123');
    console.log('   Staff: staff@cce.com / staff123');
    console.log('');
    console.log('🌐 Inicia el servidor:');
    console.log('   npm run dev');
    console.log('');

    return true;

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('\n🔧 Soluciones:');
    console.error('   1. Verifica que las tablas existan: npm run init-db');
    console.error('   2. Recrea el entorno: npm run test-env');
    console.error('   3. Verifica la configuración en .env');
    console.error('');
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación si se ejecuta directamente
if (require.main === module) {
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testConnection };
