'use strict';

/**
 * Migration: Add tenant_id to Socios
 *
 * Adds multi-tenant support to the socios table.
 * Makes DNI and email unique per tenant instead of globally.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Add tenant_id column (nullable initially)
      await queryInterface.addColumn('socios', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Temporarily nullable
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant this socio belongs to'
      }, { transaction });

      console.log('✅ Added tenant_id column to socios');

      // 2. Drop old unique constraints
      try {
        await queryInterface.removeConstraint('socios', 'socios_dni_key', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing DNI constraint to remove (ok)');
      }

      try {
        await queryInterface.removeConstraint('socios', 'socios_email_key', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing email constraint to remove (ok)');
      }

      // Also try to remove indexes if they exist
      try {
        await queryInterface.removeIndex('socios', 'socios_dni_key', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing DNI index to remove (ok)');
      }

      try {
        await queryInterface.removeIndex('socios', 'socios_email_key', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing email index to remove (ok)');
      }

      console.log('✅ Removed old unique constraints');

      // 3. For existing data: assign to default tenant (id=1)
      await queryInterface.sequelize.query(
        `UPDATE socios SET tenant_id = 1 WHERE tenant_id IS NULL`,
        { transaction }
      );

      console.log('✅ Assigned existing socios to default tenant');

      // 4. Make tenant_id NOT NULL
      await queryInterface.changeColumn('socios', 'tenant_id', {
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

      // 5. Create new indexes
      await queryInterface.addIndex('socios', ['tenant_id'], {
        name: 'socios_tenant_id_idx',
        transaction
      });

      await queryInterface.addIndex('socios', ['actividad'], {
        name: 'socios_actividad_idx',
        transaction
      });

      await queryInterface.addIndex('socios', ['estado'], {
        name: 'socios_estado_idx',
        transaction
      });

      console.log('✅ Created new indexes');

      // 6. Create composite unique constraints (tenant_id + dni/email)
      await queryInterface.addConstraint('socios', {
        fields: ['tenant_id', 'dni'],
        type: 'unique',
        name: 'socios_tenant_dni_unique',
        transaction
      });

      await queryInterface.addConstraint('socios', {
        fields: ['tenant_id', 'email'],
        type: 'unique',
        name: 'socios_tenant_email_unique',
        transaction
      });

      console.log('✅ Created tenant+dni and tenant+email unique constraints');

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
      // Remove composite unique constraints
      await queryInterface.removeConstraint('socios', 'socios_tenant_dni_unique', { transaction });
      await queryInterface.removeConstraint('socios', 'socios_tenant_email_unique', { transaction });

      // Remove indexes
      await queryInterface.removeIndex('socios', 'socios_tenant_id_idx', { transaction });
      await queryInterface.removeIndex('socios', 'socios_actividad_idx', { transaction });
      await queryInterface.removeIndex('socios', 'socios_estado_idx', { transaction });

      // Recreate old unique constraints
      await queryInterface.addConstraint('socios', {
        fields: ['dni'],
        type: 'unique',
        name: 'socios_dni_key',
        transaction
      });

      await queryInterface.addConstraint('socios', {
        fields: ['email'],
        type: 'unique',
        name: 'socios_email_key',
        transaction
      });

      // Remove tenant_id column
      await queryInterface.removeColumn('socios', 'tenant_id', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
