#!/usr/bin/env node

/**
 * Script para verificar tenants en la base de datos
 */

require('dotenv').config();
const { Tenant, Usuario } = require('../src/models');
const sequelize = require('../src/config/database');

async function checkTenants() {
  try {
    console.log('\n═══════════════════════════════════════════');
    console.log('   🔍 VERIFICACIÓN DE TENANTS');
    console.log('═══════════════════════════════════════════\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL\n');

    // Listar todos los tenants
    const tenants = await Tenant.findAll({
      order: [['createdAt', 'DESC']]
    });

    if (tenants.length === 0) {
      console.log('❌ No hay tenants registrados en la base de datos\n');
      console.log('Para crear un tenant, usa el endpoint:');
      console.log('   POST http://localhost:5000/api/auth/register\n');
      process.exit(0);
    }

    console.log(`📊 Total de tenants: ${tenants.length}\n`);

    for (const tenant of tenants) {
      console.log('─────────────────────────────────────────');
      console.log(`🏢 Tenant: ${tenant.name}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Status: ${tenant.status}`);
      console.log(`   Plan: ${tenant.plan}`);
      console.log(`   Max Members: ${tenant.maxMembers}`);
      console.log(`   Admin Email: ${tenant.adminEmail}`);
      console.log(`   URL: http://${tenant.slug}.localhost:3000`);

      // Contar usuarios de este tenant
      const userCount = await Usuario.count({
        where: { tenantId: tenant.id }
      });
      console.log(`   👥 Usuarios: ${userCount}`);

      if (tenant.trialEndsAt) {
        const daysLeft = Math.ceil((new Date(tenant.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   ⏰ Trial: ${daysLeft} días restantes`);
      }

      console.log(`   🕐 Creado: ${tenant.createdAt.toLocaleString()}`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('   ✅ VERIFICACIÓN COMPLETA');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTenants();
