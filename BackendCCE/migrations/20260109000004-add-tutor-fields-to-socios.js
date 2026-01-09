'use strict';

/**
 * Migration: Add Tutor Fields to Socios
 *
 * Adds tutor information fields for minors (< 18 years old).
 * These fields become required when socio's age < 18.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add tutor_nombre field
      await queryInterface.addColumn('socios', 'tutor_nombre', {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Full name of parent/guardian (required for minors < 18)'
      }, { transaction });

      console.log('✅ Added column: tutor_nombre');

      // Add tutor_telefono field
      await queryInterface.addColumn('socios', 'tutor_telefono', {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Phone number of parent/guardian (required for minors < 18)'
      }, { transaction });

      console.log('✅ Added column: tutor_telefono');

      // Create index on tutor fields for searching
      await queryInterface.addIndex('socios', ['tutor_nombre'], {
        name: 'socios_tutor_nombre_idx',
        transaction
      });

      console.log('✅ Created index: tutor_nombre');

      console.log('\n⚠️  VALIDATION NOTICE:');
      console.log('   - These fields are nullable in the database');
      console.log('   - Application logic must enforce: required if socio.getEdad() < 18');
      console.log('   - Validation should happen in the controller/model layer\n');

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
      await queryInterface.removeIndex('socios', 'socios_tutor_nombre_idx', { transaction });

      // Remove columns
      await queryInterface.removeColumn('socios', 'tutor_telefono', { transaction });
      await queryInterface.removeColumn('socios', 'tutor_nombre', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
