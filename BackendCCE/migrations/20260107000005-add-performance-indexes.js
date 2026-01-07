'use strict';

/**
 * Migration: Add Performance Indexes
 *
 * Adds composite indexes to improve query performance for multi-tenant queries.
 * These indexes are critical for filtering by tenant and other common columns.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('⚡ Adding performance indexes for multi-tenant queries...');

    // ==================== SOCIOS TABLE ====================

    // Index for querying active members by tenant
    await queryInterface.addIndex('socios', ['tenantId', 'activo'], {
      name: 'socios_tenant_activo_idx',
      concurrently: false // Set to true in production for zero-downtime
    });
    console.log('✅ Added index: socios_tenant_activo_idx');

    // Index for querying members by tenant and activity
    await queryInterface.addIndex('socios', ['tenantId', 'actividad'], {
      name: 'socios_tenant_actividad_idx',
      concurrently: false
    });
    console.log('✅ Added index: socios_tenant_actividad_idx');

    // Index for querying members by tenant and payment status
    await queryInterface.addIndex('socios', ['tenantId', 'estadoPago'], {
      name: 'socios_tenant_estado_pago_idx',
      concurrently: false
    });
    console.log('✅ Added index: socios_tenant_estado_pago_idx');

    // ==================== CUOTAS TABLE ====================

    // Index for querying payments by tenant and member
    await queryInterface.addIndex('cuotas', ['tenantId', 'socioId'], {
      name: 'cuotas_tenant_socio_idx',
      concurrently: false
    });
    console.log('✅ Added index: cuotas_tenant_socio_idx');

    // Index for querying payments by tenant and status
    await queryInterface.addIndex('cuotas', ['tenantId', 'estado'], {
      name: 'cuotas_tenant_estado_idx',
      concurrently: false
    });
    console.log('✅ Added index: cuotas_tenant_estado_idx');

    // Index for querying payments by tenant and due date (for overdue payments)
    await queryInterface.addIndex('cuotas', ['tenantId', 'vencimiento'], {
      name: 'cuotas_tenant_vencimiento_idx',
      concurrently: false
    });
    console.log('✅ Added index: cuotas_tenant_vencimiento_idx');

    // ==================== USUARIOS TABLE ====================

    // Index for querying users by tenant and email (login optimization)
    // Note: This is a unique index to prevent duplicate emails within a tenant
    await queryInterface.addIndex('usuarios', ['tenantId', 'email'], {
      name: 'usuarios_tenant_email_idx',
      unique: true, // Enforce unique email per tenant
      concurrently: false
    });
    console.log('✅ Added index: usuarios_tenant_email_idx (unique)');

    // Index for querying active users by tenant
    await queryInterface.addIndex('usuarios', ['tenantId', 'activo'], {
      name: 'usuarios_tenant_activo_idx',
      concurrently: false
    });
    console.log('✅ Added index: usuarios_tenant_activo_idx');

    // Index for querying users by tenant and role (admin queries)
    await queryInterface.addIndex('usuarios', ['tenantId', 'rol'], {
      name: 'usuarios_tenant_rol_idx',
      concurrently: false
    });
    console.log('✅ Added index: usuarios_tenant_rol_idx');

    console.log('✅ Performance indexes added successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚡ Removing performance indexes...');

    // Remove indexes in reverse order
    await queryInterface.removeIndex('usuarios', 'usuarios_tenant_rol_idx');
    await queryInterface.removeIndex('usuarios', 'usuarios_tenant_activo_idx');
    await queryInterface.removeIndex('usuarios', 'usuarios_tenant_email_idx');

    await queryInterface.removeIndex('cuotas', 'cuotas_tenant_vencimiento_idx');
    await queryInterface.removeIndex('cuotas', 'cuotas_tenant_estado_idx');
    await queryInterface.removeIndex('cuotas', 'cuotas_tenant_socio_idx');

    await queryInterface.removeIndex('socios', 'socios_tenant_estado_pago_idx');
    await queryInterface.removeIndex('socios', 'socios_tenant_actividad_idx');
    await queryInterface.removeIndex('socios', 'socios_tenant_activo_idx');

    console.log('✅ Performance indexes removed');
  }
};
