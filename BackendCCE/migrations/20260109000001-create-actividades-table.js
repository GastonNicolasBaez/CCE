'use strict';

/**
 * Migration: Create Actividades Table
 *
 * Creates the actividades table for dynamic activity management per tenant.
 * Each club can define their own activities with custom pricing.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create actividades table
      await queryInterface.createTable('actividades', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        tenant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Tenant this activity belongs to'
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Activity name (e.g., Basquet, Yoga, Natación)'
        },
        monto: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          comment: 'Monthly price for this activity'
        },
        activa: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Whether this activity is available for selection'
        },
        orden: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Display order in UI (lower numbers first)'
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Optional description of the activity'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      console.log('✅ Created actividades table');

      // Create unique constraint: tenant_id + nombre
      // This prevents duplicate activity names within the same tenant
      await queryInterface.addConstraint('actividades', {
        fields: ['tenant_id', 'nombre'],
        type: 'unique',
        name: 'actividades_tenant_nombre_unique',
        transaction
      });

      console.log('✅ Created unique constraint: tenant_id + nombre');

      // Create index for filtering active activities by tenant
      await queryInterface.addIndex('actividades', ['tenant_id', 'activa'], {
        name: 'actividades_tenant_activa_idx',
        transaction
      });

      console.log('✅ Created index: tenant_id + activa');

      // Create index for ordering
      await queryInterface.addIndex('actividades', ['tenant_id', 'orden'], {
        name: 'actividades_tenant_orden_idx',
        transaction
      });

      console.log('✅ Created index: tenant_id + orden');

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove indexes
      await queryInterface.removeIndex('actividades', 'actividades_tenant_orden_idx', { transaction });
      await queryInterface.removeIndex('actividades', 'actividades_tenant_activa_idx', { transaction });

      // Remove unique constraint
      await queryInterface.removeConstraint('actividades', 'actividades_tenant_nombre_unique', { transaction });

      // Drop table
      await queryInterface.dropTable('actividades', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
