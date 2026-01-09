'use strict';

/**
 * Migration: Add Exemption Fields to Socios
 *
 * Adds fields to handle payment exemptions:
 * - exento_cuota: Permanent exemption (never generate quotas)
 * - mes_gracia_hasta: Temporary grace period until date
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add exento_cuota field
      await queryInterface.addColumn('socios', 'exento_cuota', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Permanent exemption - never generate quotas for this socio'
      }, { transaction });

      console.log('✅ Added column: exento_cuota');

      // Add mes_gracia_hasta field
      await queryInterface.addColumn('socios', 'mes_gracia_hasta', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Temporary grace period - do not generate quotas until this date'
      }, { transaction });

      console.log('✅ Added column: mes_gracia_hasta');

      // Create index for querying exempt socios
      await queryInterface.addIndex('socios', ['exento_cuota'], {
        name: 'socios_exento_cuota_idx',
        transaction
      });

      console.log('✅ Created index: exento_cuota');

      // Create index for querying grace period socios
      await queryInterface.addIndex('socios', ['mes_gracia_hasta'], {
        name: 'socios_mes_gracia_hasta_idx',
        transaction
      });

      console.log('✅ Created index: mes_gracia_hasta');

      console.log('\n⚠️  QUOTA GENERATION LOGIC:');
      console.log('   - If exento_cuota = true → Never generate quotas');
      console.log('   - If mes_gracia_hasta is set and current date < mes_gracia_hasta → Do not generate quotas');
      console.log('   - These checks should be in cuotaService.calcularMontoCuota()\n');

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
      await queryInterface.removeIndex('socios', 'socios_mes_gracia_hasta_idx', { transaction });
      await queryInterface.removeIndex('socios', 'socios_exento_cuota_idx', { transaction });

      // Remove columns
      await queryInterface.removeColumn('socios', 'mes_gracia_hasta', { transaction });
      await queryInterface.removeColumn('socios', 'exento_cuota', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
