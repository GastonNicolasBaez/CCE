'use strict';

/**
 * Migration: Add tenant_id to Usuarios
 *
 * Adds multi-tenant support to the usuarios table.
 * Makes email unique per tenant instead of globally.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Add tenant_id column (nullable initially for migration)
      await queryInterface.addColumn('usuarios', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Temporarily nullable
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant this user belongs to'
      }, { transaction });

      console.log('✅ Added tenant_id column to usuarios');

      // 2. Add new fields
      await queryInterface.addColumn('usuarios', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'User account status'
      }, { transaction });

      await queryInterface.addColumn('usuarios', 'last_login_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp of last successful login'
      }, { transaction });

      console.log('✅ Added status and last_login_at columns');

      // 3. Update rol enum to use 'user' instead of 'staff'
      // Note: In PostgreSQL, we need to handle ENUM changes carefully
      // For now, we'll keep both values and handle in application logic

      // 4. Drop old unique constraint on email
      try {
        await queryInterface.removeIndex('usuarios', 'email', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing email index to remove (ok)');
      }

      try {
        await queryInterface.removeConstraint('usuarios', 'usuarios_email_key', { transaction });
      } catch (error) {
        console.log('ℹ️  No existing email constraint to remove (ok)');
      }

      console.log('✅ Removed old email unique constraint');

      // 5. Create indexes
      await queryInterface.addIndex('usuarios', ['tenant_id'], {
        name: 'usuarios_tenant_id_idx',
        transaction
      });

      await queryInterface.addIndex('usuarios', ['email'], {
        name: 'usuarios_email_idx',
        transaction
      });

      await queryInterface.addIndex('usuarios', ['status'], {
        name: 'usuarios_status_idx',
        transaction
      });

      console.log('✅ Created new indexes');

      // 6. Create composite unique constraint (tenant_id + email)
      await queryInterface.addConstraint('usuarios', {
        fields: ['tenant_id', 'email'],
        type: 'unique',
        name: 'usuarios_tenant_email_unique',
        transaction
      });

      console.log('✅ Created tenant+email unique constraint');

      // 7. For existing data: assign to default tenant (id=1)
      // This assumes you'll create a default tenant before running this
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET tenant_id = 1 WHERE tenant_id IS NULL`,
        { transaction }
      );

      console.log('✅ Assigned existing users to default tenant');

      // 8. Make tenant_id NOT NULL
      await queryInterface.changeColumn('usuarios', 'tenant_id', {
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
      await queryInterface.removeConstraint('usuarios', 'usuarios_tenant_email_unique', { transaction });

      // Remove indexes
      await queryInterface.removeIndex('usuarios', 'usuarios_tenant_id_idx', { transaction });
      await queryInterface.removeIndex('usuarios', 'usuarios_email_idx', { transaction });
      await queryInterface.removeIndex('usuarios', 'usuarios_status_idx', { transaction });

      // Recreate old unique constraint on email
      await queryInterface.addConstraint('usuarios', {
        fields: ['email'],
        type: 'unique',
        name: 'usuarios_email_key',
        transaction
      });

      // Remove columns
      await queryInterface.removeColumn('usuarios', 'tenant_id', { transaction });
      await queryInterface.removeColumn('usuarios', 'status', { transaction });
      await queryInterface.removeColumn('usuarios', 'last_login_at', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
