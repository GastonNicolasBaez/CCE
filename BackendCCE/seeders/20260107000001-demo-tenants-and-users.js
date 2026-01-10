'use strict';

const bcrypt = require('bcrypt');

/**
 * Seeder: Demo Tenants and Users
 *
 * Creates 2 demo tenants with admin users for testing multi-tenant functionality.
 *
 * Tenants:
 * 1. Club Comandante Espora (slug: espora)
 * 2. Club Demo (slug: demo)
 *
 * Access:
 * - espora.localhost:3000 → admin@espora.com / password123
 * - demo.localhost:3000 → admin@demo.com / password123
 *
 * Run: npm run db:seed
 * Undo: npm run db:seed:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Hash password for all users
      const hashedPassword = await bcrypt.hash('password123', 10);

      // ==========================================
      // 1. CREATE TENANTS
      // ==========================================

      const tenants = [
        {
          id: 1,
          slug: 'espora',
          name: 'Club Comandante Espora',
          status: 'active',
          plan: 'pro',
          settings: JSON.stringify({
            primaryColor: '#002C6F',
            secondaryColor: '#FFA500',
            logo: null
          }),
          max_members: 500,
          admin_email: 'admin@espora.com',
          admin_name: 'Admin Espora',
          phone: '+54 9 11 1234-5678',
          trial_ends_at: null, // Active, no trial
          metadata: JSON.stringify({
            activatedAt: new Date(),
            description: 'Club deportivo principal'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          slug: 'demo',
          name: 'Club Demo',
          status: 'trial',
          plan: 'free',
          settings: JSON.stringify({
            primaryColor: '#1E40AF',
            secondaryColor: '#10B981',
            logo: null
          }),
          max_members: 50,
          admin_email: 'admin@demo.com',
          admin_name: 'Admin Demo',
          phone: '+54 9 11 9876-5432',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          metadata: JSON.stringify({
            description: 'Club de demostración para testing'
          }),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('tenants', tenants, { transaction });
      console.log('✅ Created 2 demo tenants');

      // ==========================================
      // 2. CREATE ADMIN USERS FOR EACH TENANT
      // ==========================================

      const usuarios = [
        {
          tenant_id: 1,
          nombre: 'Admin',
          apellido: 'Espora',
          email: 'admin@espora.com',
          password: hashedPassword,
          rol: 'admin',
          status: 'active',
          activo: true,
          last_login_at: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          tenant_id: 2,
          nombre: 'Admin',
          apellido: 'Demo',
          email: 'admin@demo.com',
          password: hashedPassword,
          rol: 'admin',
          status: 'active',
          activo: true,
          last_login_at: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        // Additional user for tenant 1 (regular user)
        {
          tenant_id: 1,
          nombre: 'Usuario',
          apellido: 'Test',
          email: 'user@espora.com',
          password: hashedPassword,
          rol: 'operador',
          status: 'active',
          activo: true,
          last_login_at: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('usuarios', usuarios, { transaction });
      console.log('✅ Created 3 demo users (2 admins, 1 regular user)');

      // ==========================================
      // 3. CREATE SAMPLE SOCIOS FOR EACH TENANT
      // ==========================================

      const socios = [
        // Tenant 1 (Espora) - 3 socios
        {
          tenant_id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          email: 'juan.perez@email.com',
          telefono: '+54 9 11 1111-1111',
          fecha_nacimiento: '1990-05-15',
          fecha_ingreso: '2024-01-01',
          actividad: 'Basquet',
          es_jugador: true,
          estado: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          tenant_id: 1,
          nombre: 'María',
          apellido: 'González',
          dni: '23456789',
          email: 'maria.gonzalez@email.com',
          telefono: '+54 9 11 2222-2222',
          fecha_nacimiento: '1985-08-20',
          fecha_ingreso: '2024-02-01',
          actividad: 'Voley',
          es_jugador: true,
          estado: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          tenant_id: 1,
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          dni: '34567890',
          email: 'carlos.rodriguez@email.com',
          telefono: '+54 9 11 3333-3333',
          fecha_nacimiento: '1995-03-10',
          fecha_ingreso: '2024-03-01',
          actividad: 'Solo socio',
          es_jugador: false,
          estado: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        },
        // Tenant 2 (Demo) - 2 socios
        {
          tenant_id: 2,
          nombre: 'Ana',
          apellido: 'Martínez',
          dni: '12345678', // Same DNI as tenant 1, but different tenant (OK!)
          email: 'ana.martinez@email.com',
          telefono: '+54 9 11 4444-4444',
          fecha_nacimiento: '1992-11-25',
          fecha_ingreso: '2024-01-15',
          actividad: 'Karate',
          es_jugador: true,
          estado: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          tenant_id: 2,
          nombre: 'Pedro',
          apellido: 'López',
          dni: '45678901',
          email: 'pedro.lopez@email.com',
          telefono: '+54 9 11 5555-5555',
          fecha_nacimiento: '1988-07-30',
          fecha_ingreso: '2024-02-15',
          actividad: 'Gimnasio',
          es_jugador: false,
          estado: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('socios', socios, { transaction });
      console.log('✅ Created 5 demo socios (3 for espora, 2 for demo)');

      await transaction.commit();
      console.log('\n========================================');
      console.log('✅ SEED COMPLETED SUCCESSFULLY');
      console.log('========================================');
      console.log('\n📋 Demo Tenants Created:\n');
      console.log('1. Club Comandante Espora');
      console.log('   URL: http://espora.localhost:3000');
      console.log('   Admin: admin@espora.com / password123');
      console.log('   User: user@espora.com / password123');
      console.log('   Socios: 3');
      console.log('   Plan: Pro (500 members)');
      console.log('\n2. Club Demo');
      console.log('   URL: http://demo.localhost:3000');
      console.log('   Admin: admin@demo.com / password123');
      console.log('   Socios: 2');
      console.log('   Plan: Free (50 members, trial)');
      console.log('\n========================================\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Seed failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete in reverse order due to foreign keys
      await queryInterface.bulkDelete('cuotas', { tenant_id: [1, 2] }, { transaction });
      await queryInterface.bulkDelete('socios', { tenant_id: [1, 2] }, { transaction });
      await queryInterface.bulkDelete('usuarios', { tenant_id: [1, 2] }, { transaction });
      await queryInterface.bulkDelete('tenants', { id: [1, 2] }, { transaction });

      await transaction.commit();
      console.log('✅ Seed data removed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Seed removal failed:', error);
      throw error;
    }
  }
};
