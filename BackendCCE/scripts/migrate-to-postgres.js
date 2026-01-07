#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Configuración de bases de datos
const sqliteConfig = {
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
};

const postgresConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cce_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: false
};

async function migrateData() {
  let sqliteDb, postgresDb;
  
  try {
    console.log('🔄 Iniciando migración de SQLite a PostgreSQL...\n');

    // Verificar que existe la base de datos SQLite
    const sqlitePath = sqliteConfig.storage;
    if (!fs.existsSync(sqlitePath)) {
      console.log('ℹ️  No se encontró base de datos SQLite en:', sqlitePath);
      console.log('ℹ️  No hay datos para migrar. Creando base de datos PostgreSQL vacía...');
      
      // Solo crear las tablas en PostgreSQL
      postgresDb = new Sequelize(postgresConfig);
      await postgresDb.authenticate();
      console.log('✅ Conexión a PostgreSQL establecida');
      
      // Importar modelos para crear las tablas
      const { Socio, Cuota, Usuario } = require('../src/models');
      await postgresDb.sync({ force: true });
      console.log('✅ Tablas creadas en PostgreSQL');
      
      await postgresDb.close();
      console.log('\n🎉 Configuración de PostgreSQL completada (sin datos para migrar)');
      return;
    }

    // Conectar a ambas bases de datos
    sqliteDb = new Sequelize(sqliteConfig);
    postgresDb = new Sequelize(postgresConfig);

    await sqliteDb.authenticate();
    console.log('✅ Conexión a SQLite establecida');

    await postgresDb.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Obtener datos de SQLite
    const [usuarios] = await sqliteDb.query('SELECT * FROM Usuarios');
    const [socios] = await sqliteDb.query('SELECT * FROM Socios');
    const [cuotas] = await sqliteDb.query('SELECT * FROM Cuotas');

    console.log(`\n📊 Datos encontrados en SQLite:`);
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Socios: ${socios.length}`);
    console.log(`   - Cuotas: ${cuotas.length}`);

    // Crear tablas en PostgreSQL (force: true para limpiar si existen)
    console.log('\n🔨 Creando tablas en PostgreSQL...');
    
    // Importar modelos
    const { Socio, Cuota, Usuario } = require('../src/models');
    await postgresDb.sync({ force: true });
    console.log('✅ Tablas creadas en PostgreSQL');

    // Migrar datos
    console.log('\n📤 Migrando datos...');

    // Migrar usuarios
    if (usuarios.length > 0) {
      console.log(`   Migrando ${usuarios.length} usuarios...`);
      for (const usuario of usuarios) {
        await postgresDb.query(`
          INSERT INTO "Usuarios" (id, username, email, password, role, "createdAt", "updatedAt")
          VALUES (:id, :username, :email, :password, :role, :createdAt, :updatedAt)
        `, {
          replacements: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            password: usuario.password,
            role: usuario.role,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt
          }
        });
      }
      console.log('   ✅ Usuarios migrados');
    }

    // Migrar socios
    if (socios.length > 0) {
      console.log(`   Migrando ${socios.length} socios...`);
      for (const socio of socios) {
        await postgresDb.query(`
          INSERT INTO "Socios" (
            id, nombre, apellido, dni, email, telefono, direccion, 
            fechaNacimiento, actividad, estado, tipoMembresia, observaciones,
            contactoEmergenciaNombre, contactoEmergenciaTelefono, 
            contactoEmergenciaRelacion, problemasCardiacos, problemasPulmonares,
            problemasOseos, problemasMusculares, diabetes, hipertension,
            otrasCondiciones, medicamentos, "mesPrueba", "fechaFinPrueba",
            "createdAt", "updatedAt"
          )
          VALUES (
            :id, :nombre, :apellido, :dni, :email, :telefono, :direccion,
            :fechaNacimiento, :actividad, :estado, :tipoMembresia, :observaciones,
            :contactoEmergenciaNombre, :contactoEmergenciaTelefono,
            :contactoEmergenciaRelacion, :problemasCardiacos, :problemasPulmonares,
            :problemasOseos, :problemasMusculares, :diabetes, :hipertension,
            :otrasCondiciones, :medicamentos, :mesPrueba, :fechaFinPrueba,
            :createdAt, :updatedAt
          )
        `, {
          replacements: {
            id: socio.id,
            nombre: socio.nombre,
            apellido: socio.apellido,
            dni: socio.dni,
            email: socio.email,
            telefono: socio.telefono,
            direccion: socio.direccion,
            fechaNacimiento: socio.fechaNacimiento,
            actividad: socio.actividad,
            estado: socio.estado,
            tipoMembresia: socio.tipoMembresia,
            observaciones: socio.observaciones,
            contactoEmergenciaNombre: socio.contactoEmergenciaNombre,
            contactoEmergenciaTelefono: socio.contactoEmergenciaTelefono,
            contactoEmergenciaRelacion: socio.contactoEmergenciaRelacion,
            problemasCardiacos: socio.problemasCardiacos,
            problemasPulmonares: socio.problemasPulmonares,
            problemasOseos: socio.problemasOseos,
            problemasMusculares: socio.problemasMusculares,
            diabetes: socio.diabetes,
            hipertension: socio.hipertension,
            otrasCondiciones: socio.otrasCondiciones,
            medicamentos: socio.medicamentos,
            mesPrueba: socio.mesPrueba || false,
            fechaFinPrueba: socio.fechaFinPrueba,
            createdAt: socio.createdAt,
            updatedAt: socio.updatedAt
          }
        });
      }
      console.log('   ✅ Socios migrados');
    }

    // Migrar cuotas
    if (cuotas.length > 0) {
      console.log(`   Migrando ${cuotas.length} cuotas...`);
      for (const cuota of cuotas) {
        await postgresDb.query(`
          INSERT INTO "Cuotas" (
            id, periodo, monto, fechaVencimiento, fechaPago, estado, 
            metodoPago, numeroRecibo, observaciones, socioId,
            "createdAt", "updatedAt"
          )
          VALUES (
            :id, :periodo, :monto, :fechaVencimiento, :fechaPago, :estado,
            :metodoPago, :numeroRecibo, :observaciones, :socioId,
            :createdAt, :updatedAt
          )
        `, {
          replacements: {
            id: cuota.id,
            periodo: cuota.periodo,
            monto: cuota.monto,
            fechaVencimiento: cuota.fechaVencimiento,
            fechaPago: cuota.fechaPago,
            estado: cuota.estado,
            metodoPago: cuota.metodoPago,
            numeroRecibo: cuota.numeroRecibo,
            observaciones: cuota.observaciones,
            socioId: cuota.socioId,
            createdAt: cuota.createdAt,
            updatedAt: cuota.updatedAt
          }
        });
      }
      console.log('   ✅ Cuotas migradas');
    }

    // Verificar migración
    console.log('\n🔍 Verificando migración...');
    const [pgUsuarios] = await postgresDb.query('SELECT COUNT(*) as count FROM "Usuarios"');
    const [pgSocios] = await postgresDb.query('SELECT COUNT(*) as count FROM "Socios"');
    const [pgCuotas] = await postgresDb.query('SELECT COUNT(*) as count FROM "Cuotas"');

    console.log(`📊 Datos migrados a PostgreSQL:`);
    console.log(`   - Usuarios: ${pgUsuarios[0].count}`);
    console.log(`   - Socios: ${pgSocios[0].count}`);
    console.log(`   - Cuotas: ${pgCuotas[0].count}`);

    // Verificar que los números coincidan
    const migrationSuccess = 
      parseInt(pgUsuarios[0].count) === usuarios.length &&
      parseInt(pgSocios[0].count) === socios.length &&
      parseInt(pgCuotas[0].count) === cuotas.length;

    if (migrationSuccess) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('\n📝 Próximos pasos:');
      console.log('   1. Configura USE_POSTGRES=true en tu archivo .env');
      console.log('   2. Reinicia el servidor backend');
      console.log('   3. Verifica que la aplicación funcione correctamente');
      console.log('   4. Opcional: Respalda el archivo SQLite antes de eliminarlo');
    } else {
      console.log('\n❌ Error en la migración - Los números no coinciden');
      console.log('   Revisa los logs para más detalles');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Cerrar conexiones
    if (sqliteDb) {
      await sqliteDb.close();
      console.log('🔌 Conexión SQLite cerrada');
    }
    if (postgresDb) {
      await postgresDb.close();
      console.log('🔌 Conexión PostgreSQL cerrada');
    }
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };