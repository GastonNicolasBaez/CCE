'use strict';

/**
 * Migration: Create Socio_Actividades Pivot Table
 *
 * Creates many-to-many relationship between socios and actividades.
 * Allows a socio to have multiple activities.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create socio_actividades pivot table
      await queryInterface.createTable('socio_actividades', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        socio_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'socios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Socio ID'
        },
        actividad_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'actividades',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Actividad ID'
        },
        fecha_inicio: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Date when socio started this activity'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      console.log('✅ Created socio_actividades pivot table');

      // Create unique constraint: socio_id + actividad_id
      // A socio cannot have the same activity twice
      await queryInterface.addConstraint('socio_actividades', {
        fields: ['socio_id', 'actividad_id'],
        type: 'unique',
        name: 'socio_actividades_socio_actividad_unique',
        transaction
      });

      console.log('✅ Created unique constraint: socio_id + actividad_id');

      // Create index for finding activities of a socio
      await queryInterface.addIndex('socio_actividades', ['socio_id'], {
        name: 'socio_actividades_socio_idx',
        transaction
      });

      console.log('✅ Created index: socio_id');

      // Create index for finding socios of an activity
      await queryInterface.addIndex('socio_actividades', ['actividad_id'], {
        name: 'socio_actividades_actividad_idx',
        transaction
      });

      console.log('✅ Created index: actividad_id');

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
      await queryInterface.removeIndex('socio_actividades', 'socio_actividades_actividad_idx', { transaction });
      await queryInterface.removeIndex('socio_actividades', 'socio_actividades_socio_idx', { transaction });

      // Remove unique constraint
      await queryInterface.removeConstraint('socio_actividades', 'socio_actividades_socio_actividad_unique', { transaction });

      // Drop table
      await queryInterface.dropTable('socio_actividades', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
