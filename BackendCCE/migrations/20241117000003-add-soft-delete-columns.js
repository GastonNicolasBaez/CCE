'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add deleted_at column to usuarios table
    await queryInterface.addColumn('usuarios', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp for usuarios'
    });

    // Add deleted_at column to socios table
    await queryInterface.addColumn('socios', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp for socios'
    });

    // Add deleted_at column to cuotas table
    await queryInterface.addColumn('cuotas', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp for cuotas'
    });

    // Add indexes for soft delete queries
    await queryInterface.addIndex('usuarios', ['deleted_at'], {
      name: 'idx_usuarios_deleted_at'
    });

    await queryInterface.addIndex('socios', ['deleted_at'], {
      name: 'idx_socios_deleted_at'
    });

    await queryInterface.addIndex('cuotas', ['deleted_at'], {
      name: 'idx_cuotas_deleted_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_deleted_at');
    await queryInterface.removeIndex('socios', 'idx_socios_deleted_at');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_deleted_at');

    // Remove columns
    await queryInterface.removeColumn('usuarios', 'deleted_at');
    await queryInterface.removeColumn('socios', 'deleted_at');
    await queryInterface.removeColumn('cuotas', 'deleted_at');
  }
};
