'use strict';

/**
 * Migration: Update Usuario Roles
 *
 * Updates the 'rol' ENUM field to support three roles:
 * - 'super_admin': Global administrator (tenant_id = NULL)
 * - 'admin': Club administrator (tenant_id = X)
 * - 'operador': Club staff member (tenant_id = X)
 *
 * Also updates tenant_id to allow NULL for super_admin users.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🚀 Starting roles migration...\n');

      // Step 1: Change rol column to VARCHAR temporarily
      console.log('📝 Step 1: Converting rol ENUM to VARCHAR...');
      await queryInterface.changeColumn('usuarios', 'rol', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'operador'
      }, { transaction });
      console.log('✅ Converted rol to VARCHAR\n');

      // Step 2: Update existing values
      // Keep 'admin' as 'admin', change 'user' to 'operador'
      console.log('📝 Step 2: Updating existing role values...');
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET rol = 'operador' WHERE rol = 'user'`,
        { transaction }
      );
      console.log('✅ Updated role values (user → operador)\n');

      // Step 3: Change rol back to ENUM with new values
      console.log('📝 Step 3: Converting rol back to ENUM with new values...');
      await queryInterface.changeColumn('usuarios', 'rol', {
        type: Sequelize.ENUM('super_admin', 'admin', 'operador'),
        allowNull: false,
        defaultValue: 'operador',
        comment: 'User role: super_admin (global), admin (club admin), operador (staff)'
      }, { transaction });
      console.log('✅ Converted rol to new ENUM\n');

      // Step 4: Remove NOT NULL constraint from tenant_id
      // (to allow super_admin users with tenant_id = NULL)
      console.log('📝 Step 4: Allowing NULL for tenant_id (super_admin users)...');
      await queryInterface.changeColumn('usuarios', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Changed from false to true
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant this user belongs to (NULL for super_admin)'
      }, { transaction });
      console.log('✅ Updated tenant_id to allow NULL\n');

      // Step 5: Add index for role
      console.log('📝 Step 5: Adding index for rol field...');
      try {
        await queryInterface.addIndex('usuarios', ['rol'], {
          name: 'usuarios_rol_idx',
          transaction
        });
        console.log('✅ Added index: usuarios_rol_idx\n');
      } catch (error) {
        console.log('ℹ️  Index usuarios_rol_idx already exists (ok)\n');
      }

      // Log migration summary
      console.log('✅ Migration completed successfully!\n');
      console.log('📊 Role Migration Summary:');
      console.log('   - Old roles: admin, user');
      console.log('   - New roles: super_admin, admin, operador');
      console.log('   - Mapping: admin → admin, user → operador');
      console.log('   - super_admin users can have tenant_id = NULL\n');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Rolling back roles migration...\n');

      // Remove index
      console.log('📝 Removing rol index...');
      try {
        await queryInterface.removeIndex('usuarios', 'usuarios_rol_idx', { transaction });
        console.log('✅ Removed index: usuarios_rol_idx\n');
      } catch (error) {
        console.log('ℹ️  Index does not exist (ok)\n');
      }

      // Change tenant_id back to NOT NULL
      console.log('📝 Restoring tenant_id NOT NULL constraint...');
      await queryInterface.changeColumn('usuarios', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: false, // Back to NOT NULL
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant this user belongs to'
      }, { transaction });
      console.log('✅ Restored tenant_id NOT NULL\n');

      // Change rol to VARCHAR temporarily
      console.log('📝 Converting rol to VARCHAR...');
      await queryInterface.changeColumn('usuarios', 'rol', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'user'
      }, { transaction });
      console.log('✅ Converted rol to VARCHAR\n');

      // Update values back
      console.log('📝 Reverting role values...');
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET rol = 'user' WHERE rol IN ('operador', 'super_admin')`,
        { transaction }
      );
      console.log('✅ Reverted role values (operador/super_admin → user)\n');

      // Change rol back to old ENUM
      console.log('📝 Converting rol back to old ENUM...');
      await queryInterface.changeColumn('usuarios', 'rol', {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
        comment: 'User role: admin (full access) or user (limited access)'
      }, { transaction });
      console.log('✅ Converted rol to old ENUM\n');

      console.log('✅ Rollback completed successfully!\n');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
