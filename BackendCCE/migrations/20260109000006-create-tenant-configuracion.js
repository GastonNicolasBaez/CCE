'use strict';

/**
 * Migration: Create Tenant Configuration Table
 *
 * Creates the tenant_configuracion table to store club-specific settings
 * for quota calculation and automatic generation.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create tenant_configuracion table
      await queryInterface.createTable('tenant_configuracion', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        tenant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'tenants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Tenant this configuration belongs to'
        },

        // QUOTA TYPE
        tipo_cuota: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'por_actividad',
          comment: 'unica = fixed amount for all | por_actividad = based on activities'
        },
        monto_base: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Base amount (only used if tipo_cuota = unica)'
        },

        // MULTIPLE ACTIVITIES STRATEGY
        multiple_actividades_strategy: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'sumar',
          comment: 'sumar = add all | maximo = highest price | descuento = discount on additional'
        },
        descuento_actividades: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Discount percentage for additional activities (if strategy = descuento)'
        },

        // DUE DATE AND REMINDERS
        dia_vencimiento: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
          comment: 'Day of the month for payment due date (1-28)'
        },
        recordatorio_dias_antes: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 2,
          comment: 'Days before due date to send reminder email'
        },

        // DISCOUNTS
        descuento_menores: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Discount percentage for minors (< 18 years old)'
        },

        // AUTOMATION
        generar_automaticamente: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Auto-generate monthly quotas via cron job'
        },
        enviar_recordatorios: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Auto-send payment reminder emails'
        },

        // TIMESTAMPS
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

      console.log('✅ Created tenant_configuracion table');

      // Create unique constraint on tenant_id (one config per tenant)
      await queryInterface.addConstraint('tenant_configuracion', {
        fields: ['tenant_id'],
        type: 'unique',
        name: 'tenant_configuracion_tenant_unique',
        transaction
      });

      console.log('✅ Created unique constraint: tenant_id');

      // Create index for finding active auto-generation configs
      await queryInterface.addIndex('tenant_configuracion', ['generar_automaticamente'], {
        name: 'tenant_configuracion_generar_auto_idx',
        transaction
      });

      console.log('✅ Created index: generar_automaticamente');

      console.log('\n⚠️  DEFAULT VALUES:');
      console.log('   - tipo_cuota: por_actividad');
      console.log('   - multiple_actividades_strategy: sumar');
      console.log('   - dia_vencimiento: 10');
      console.log('   - recordatorio_dias_antes: 2');
      console.log('   - generar_automaticamente: true');
      console.log('   - enviar_recordatorios: true\n');

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
      // Remove index
      await queryInterface.removeIndex('tenant_configuracion', 'tenant_configuracion_generar_auto_idx', { transaction });

      // Remove constraint
      await queryInterface.removeConstraint('tenant_configuracion', 'tenant_configuracion_tenant_unique', { transaction });

      // Drop table
      await queryInterface.dropTable('tenant_configuracion', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
