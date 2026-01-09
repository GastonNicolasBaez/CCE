'use strict';

/**
 * Migration: Deprecate Actividad ENUM Field
 *
 * Renames the 'actividad' column to 'actividad_legacy' to preserve historical data.
 * The new system uses the 'socio_actividades' pivot table instead.
 *
 * IMPORTANT: This migration does NOT migrate data. If you have existing socios,
 * you need to manually create actividades and populate socio_actividades table.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // First, check if column exists
      const tableDescription = await queryInterface.describeTable('socios');

      if (!tableDescription.actividad) {
        console.log('ℹ️  Column "actividad" does not exist, skipping migration');
        await transaction.commit();
        return;
      }

      // Remove the old index on actividad if it exists
      try {
        await queryInterface.removeIndex('socios', 'socios_actividad_idx', { transaction });
        console.log('✅ Removed index: socios_actividad_idx');
      } catch (error) {
        console.log('ℹ️  No existing actividad index to remove (ok)');
      }

      // Rename column: actividad -> actividad_legacy
      await queryInterface.renameColumn('socios', 'actividad', 'actividad_legacy', { transaction });

      console.log('✅ Renamed column: actividad → actividad_legacy');

      // Add comment to the renamed column
      await queryInterface.sequelize.query(
        `COMMENT ON COLUMN socios.actividad_legacy IS 'DEPRECATED - Use socio_actividades table instead. Kept for historical data.'`,
        { transaction }
      );

      console.log('✅ Added deprecation comment to actividad_legacy');

      // Log migration notice
      console.log('\n⚠️  MIGRATION NOTICE:');
      console.log('   - The "actividad" field has been deprecated');
      console.log('   - Use the new "socio_actividades" many-to-many relationship');
      console.log('   - To migrate existing data, create actividades first, then populate socio_actividades\n');

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
      // Rename back: actividad_legacy -> actividad
      await queryInterface.renameColumn('socios', 'actividad_legacy', 'actividad', { transaction });

      console.log('✅ Renamed column: actividad_legacy → actividad');

      // Recreate index
      await queryInterface.addIndex('socios', ['actividad'], {
        name: 'socios_actividad_idx',
        transaction
      });

      console.log('✅ Recreated index: socios_actividad_idx');

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
