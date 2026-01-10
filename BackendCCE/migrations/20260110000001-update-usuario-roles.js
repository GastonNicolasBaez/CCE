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

      // Step 1: Add a temporary column for the new role
      console.log('📝 Step 1: Adding temporary rol_new column...');
      await queryInterface.addColumn('usuarios', 'rol_new', {
        type: Sequelize.STRING(20),
        allowNull: true
      }, { transaction });
      console.log('✅ Added rol_new column\n');

      // Step 2: Copy and transform existing values
      // Map: 'admin' -> 'admin', 'user' -> 'operador'
      console.log('📝 Step 2: Copying and transforming role values...');
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET rol_new =
          CASE
            WHEN rol::text = 'admin' THEN 'admin'
            WHEN rol::text = 'user' THEN 'operador'
            ELSE 'operador'
          END`,
        { transaction }
      );
      console.log('✅ Transformed role values (user → operador)\n');

      // Step 3: Drop the old rol column
      console.log('📝 Step 3: Dropping old rol column...');
      await queryInterface.removeColumn('usuarios', 'rol', { transaction });
      console.log('✅ Dropped old rol column\n');

      // Step 4: Drop the old ENUM type if it exists
      console.log('📝 Step 4: Dropping old ENUM type...');
      try {
        await queryInterface.sequelize.query(
          `DROP TYPE IF EXISTS "enum_usuarios_rol" CASCADE`,
          { transaction }
        );
        console.log('✅ Dropped old ENUM type\n');
      } catch (error) {
        console.log('ℹ️  Old ENUM type does not exist (ok)\n');
      }

      // Step 5: Rename rol_new to rol
      console.log('📝 Step 5: Renaming rol_new to rol...');
      await queryInterface.renameColumn('usuarios', 'rol_new', 'rol', { transaction });
      console.log('✅ Renamed column\n');

      // Step 6: Create new ENUM type
      console.log('📝 Step 6: Creating new ENUM type...');
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_usuarios_rol" AS ENUM ('super_admin', 'admin', 'operador')`,
        { transaction }
      );
      console.log('✅ Created new ENUM type\n');

      // Step 7: Convert rol column to new ENUM type
      console.log('📝 Step 7: Converting rol to new ENUM type...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios"
         ALTER COLUMN "rol" TYPE "enum_usuarios_rol"
         USING rol::text::"enum_usuarios_rol"`,
        { transaction }
      );
      console.log('✅ Converted to ENUM type\n');

      // Step 8: Set NOT NULL and default value
      console.log('📝 Step 8: Setting NOT NULL and default value...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET NOT NULL`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'operador'::enum_usuarios_rol`,
        { transaction }
      );
      console.log('✅ Set constraints\n');

      // Step 9: Remove NOT NULL constraint from tenant_id
      // (to allow super_admin users with tenant_id = NULL)
      console.log('📝 Step 9: Allowing NULL for tenant_id (super_admin users)...');
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

      // Step 10: Add index for role
      console.log('📝 Step 10: Adding index for rol field...');
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

      // Add temporary column
      console.log('📝 Adding temporary column...');
      await queryInterface.addColumn('usuarios', 'rol_old', {
        type: Sequelize.STRING(20),
        allowNull: true
      }, { transaction });
      console.log('✅ Added rol_old column\n');

      // Copy and transform values back
      console.log('📝 Reverting role values...');
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET rol_old =
          CASE
            WHEN rol::text = 'admin' THEN 'admin'
            WHEN rol::text = 'operador' THEN 'user'
            WHEN rol::text = 'super_admin' THEN 'user'
            ELSE 'user'
          END`,
        { transaction }
      );
      console.log('✅ Reverted role values (operador/super_admin → user)\n');

      // Drop new column
      console.log('📝 Dropping new rol column...');
      await queryInterface.removeColumn('usuarios', 'rol', { transaction });
      console.log('✅ Dropped rol column\n');

      // Drop new ENUM type
      console.log('📝 Dropping new ENUM type...');
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_usuarios_rol" CASCADE`,
        { transaction }
      );
      console.log('✅ Dropped new ENUM type\n');

      // Rename temp column back
      console.log('📝 Renaming rol_old to rol...');
      await queryInterface.renameColumn('usuarios', 'rol_old', 'rol', { transaction });
      console.log('✅ Renamed column\n');

      // Create old ENUM type
      console.log('📝 Creating old ENUM type...');
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_usuarios_rol" AS ENUM ('admin', 'user')`,
        { transaction }
      );
      console.log('✅ Created old ENUM type\n');

      // Convert to old ENUM
      console.log('📝 Converting to old ENUM...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios"
         ALTER COLUMN "rol" TYPE "enum_usuarios_rol"
         USING rol::text::"enum_usuarios_rol"`,
        { transaction }
      );
      console.log('✅ Converted to old ENUM type\n');

      // Set constraints
      console.log('📝 Setting constraints...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET NOT NULL`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'user'::enum_usuarios_rol`,
        { transaction }
      );
      console.log('✅ Set constraints\n');

      console.log('✅ Rollback completed successfully!\n');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
