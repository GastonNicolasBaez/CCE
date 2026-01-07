'use strict';

/**
 * Migration: Add tenant_id to Cuotas
 *
 * Adds multi-tenant support to the cuotas table.
 * Makes cuotas unique per tenant+socio+periodo.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Add tenant_id column (nullable initially)
      await queryInterface.addColumn('cuotas', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Temporarily nullable
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant this cuota belongs to'
      }, { transaction });

      console.log('✅ Added tenant_id column to cuotas');

      // 2. For existing data: get tenant_id from related socio
      await queryInterface.sequelize.query(`
        UPDATE cuotas
        SET tenant_id = (
          SELECT tenant_id
          FROM socios
          WHERE socios.id = cuotas.socio_id
          LIMIT 1
        )
        WHERE tenant_id IS NULL
      `, { transaction });

      console.log('✅ Assigned existing cuotas to tenant from their socio');

      // 3. Make tenant_id NOT NULL
      await queryInterface.changeColumn('cuotas', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction });

      console.log('✅ Made tenant_id NOT NULL');

      // 4. Drop old unique constraint (socio_id + periodo)
      try {
        // Try different possible constraint names
        await queryInterface.removeConstraint('cuotas', 'cuotas_socio_id_periodo_key', { transaction });
      } catch (error) {
        try {
          await queryInterface.removeIndex('cuotas', 'cuotas_socio_id_periodo_key', { transaction });
        } catch (error2) {
          console.log('ℹ️  No existing socio+periodo constraint to remove (ok)');
        }
      }

      console.log('✅ Removed old unique constraint');

      // 5. Create new indexes
      await queryInterface.addIndex('cuotas', ['tenant_id'], {
        name: 'cuotas_tenant_id_idx',
        transaction
      });

      await queryInterface.addIndex('cuotas', ['socio_id'], {
        name: 'cuotas_socio_id_idx',
        transaction
      });

      await queryInterface.addIndex('cuotas', ['estado'], {
        name: 'cuotas_estado_idx',
        transaction
      });

      await queryInterface.addIndex('cuotas', ['fecha_vencimiento'], {
        name: 'cuotas_fecha_vencimiento_idx',
        transaction
      });

      await queryInterface.addIndex('cuotas', ['periodo'], {
        name: 'cuotas_periodo_idx',
        transaction
      });

      console.log('✅ Created new indexes');

      // 6. Create composite unique constraint (tenant_id + socio_id + periodo)
      await queryInterface.addConstraint('cuotas', {
        fields: ['tenant_id', 'socio_id', 'periodo'],
        type: 'unique',
        name: 'cuotas_tenant_socio_periodo_unique',
        transaction
      });

      console.log('✅ Created tenant+socio+periodo unique constraint');

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
      // Remove composite unique constraint
      await queryInterface.removeConstraint('cuotas', 'cuotas_tenant_socio_periodo_unique', { transaction });

      // Remove indexes
      await queryInterface.removeIndex('cuotas', 'cuotas_tenant_id_idx', { transaction });
      await queryInterface.removeIndex('cuotas', 'cuotas_socio_id_idx', { transaction });
      await queryInterface.removeIndex('cuotas', 'cuotas_estado_idx', { transaction });
      await queryInterface.removeIndex('cuotas', 'cuotas_fecha_vencimiento_idx', { transaction });
      await queryInterface.removeIndex('cuotas', 'cuotas_periodo_idx', { transaction });

      // Recreate old unique constraint
      await queryInterface.addConstraint('cuotas', {
        fields: ['socio_id', 'periodo'],
        type: 'unique',
        name: 'cuotas_socio_id_periodo_key',
        transaction
      });

      // Remove tenant_id column
      await queryInterface.removeColumn('cuotas', 'tenant_id', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
