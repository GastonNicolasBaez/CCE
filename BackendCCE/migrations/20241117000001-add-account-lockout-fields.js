'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'failed_login_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of consecutive failed login attempts'
    });

    await queryInterface.addColumn('usuarios', 'locked_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Account is locked until this timestamp'
    });

    await queryInterface.addColumn('usuarios', 'last_login_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last successful login timestamp'
    });

    await queryInterface.addColumn('usuarios', 'last_login_ip', {
      type: Sequelize.STRING(45),
      allowNull: true,
      comment: 'Last login IP address (supports IPv6)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuarios', 'failed_login_attempts');
    await queryInterface.removeColumn('usuarios', 'locked_until');
    await queryInterface.removeColumn('usuarios', 'last_login_at');
    await queryInterface.removeColumn('usuarios', 'last_login_ip');
  }
};
