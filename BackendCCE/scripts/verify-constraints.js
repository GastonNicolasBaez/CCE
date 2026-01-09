#!/usr/bin/env node

/**
 * Script para verificar constraints de la base de datos
 * Verifica que DNI y email estén aislados por tenant
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Usar la misma configuración que database.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cce_multitenant',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: false
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

async function verifyConstraints() {
  try {
    console.log('\n═══════════════════════════════════════════');
    console.log('   🔍 VERIFICACIÓN DE CONSTRAINTS');
    console.log('═══════════════════════════════════════════\n');

    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL\n');

    // Verificar constraints UNIQUE en tabla socios
    const [constraints] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        tc.table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'socios'
        AND tc.constraint_type = 'UNIQUE'
      ORDER BY tc.constraint_name, kcu.ordinal_position;
    `);

    console.log('📋 Constraints UNIQUE en tabla "socios":\n');

    if (constraints.length === 0) {
      console.log('❌ NO se encontraron constraints UNIQUE en tabla socios');
      console.log('   ⚠️  PROBLEMA: Los datos NO están aislados por tenant\n');
      process.exit(1);
    }

    // Agrupar constraints por nombre
    const groupedConstraints = constraints.reduce((acc, row) => {
      if (!acc[row.constraint_name]) {
        acc[row.constraint_name] = [];
      }
      acc[row.constraint_name].push(row.column_name);
      return acc;
    }, {});

    let hasTenantDni = false;
    let hasTenantEmail = false;
    let hasGlobalDni = false;
    let hasGlobalEmail = false;

    for (const [constraintName, columns] of Object.entries(groupedConstraints)) {
      const columnStr = columns.join(' + ');
      console.log(`   • ${constraintName}: ${columnStr}`);

      // Verificar constraints correctos (con tenant_id)
      if (columns.includes('tenant_id') && columns.includes('dni')) {
        hasTenantDni = true;
      }
      if (columns.includes('tenant_id') && columns.includes('email')) {
        hasTenantEmail = true;
      }

      // Verificar constraints incorrectos (sin tenant_id)
      if (columns.length === 1 && columns[0] === 'dni') {
        hasGlobalDni = true;
      }
      if (columns.length === 1 && columns[0] === 'email') {
        hasGlobalEmail = true;
      }
    }

    console.log('\n─────────────────────────────────────────\n');
    console.log('📊 RESULTADO DE VERIFICACIÓN:\n');

    // Verificar estado ideal
    let allGood = true;

    if (hasTenantDni) {
      console.log('✅ DNI está aislado por tenant (tenant_id + dni)');
    } else {
      console.log('❌ DNI NO está aislado por tenant');
      allGood = false;
    }

    if (hasTenantEmail) {
      console.log('✅ Email está aislado por tenant (tenant_id + email)');
    } else {
      console.log('❌ Email NO está aislado por tenant');
      allGood = false;
    }

    // Advertencias sobre constraints globales
    if (hasGlobalDni) {
      console.log('⚠️  ADVERTENCIA: Existe constraint global de DNI (sin tenant_id)');
      console.log('   Esto impedirá que dos tenants usen el mismo DNI');
      allGood = false;
    }

    if (hasGlobalEmail) {
      console.log('⚠️  ADVERTENCIA: Existe constraint global de email (sin tenant_id)');
      console.log('   Esto impedirá que dos tenants usen el mismo email');
      allGood = false;
    }

    console.log('\n═══════════════════════════════════════════');

    if (allGood) {
      console.log('   ✅ TODO CORRECTO - Aislamiento por tenant OK');
      console.log('═══════════════════════════════════════════\n');
      process.exit(0);
    } else {
      console.log('   ❌ PROBLEMAS DETECTADOS');
      console.log('═══════════════════════════════════════════\n');
      console.log('🔧 SOLUCIÓN:');
      console.log('   1. Ejecutar: npm run db:migrate:undo (revertir última migración)');
      console.log('   2. Verificar que la migración 20260107000003 sea correcta');
      console.log('   3. Ejecutar: npm run db:migrate (aplicar de nuevo)\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  No se pudo conectar a PostgreSQL.');
      console.error('   Verifica que el servicio esté corriendo.\n');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  La base de datos no existe.');
      console.error(`   Crea la base de datos: createdb ${dbConfig.database}\n`);
    } else if (error.code === '28P01') {
      console.error('\n⚠️  Credenciales incorrectas.');
      console.error('   Verifica DB_USER y DB_PASSWORD en .env\n');
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

verifyConstraints();
