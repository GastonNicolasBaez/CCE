'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columnas faltantes a la tabla cuotas
    await queryInterface.addColumn('cuotas', 'link_pago', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Link de pago generado por MercadoPago'
    });

    await queryInterface.addColumn('cuotas', 'mercado_pago_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'ID de la preferencia/pago de MercadoPago'
    });

    await queryInterface.addColumn('cuotas', 'cantidad_recordatorios', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Cantidad de recordatorios enviados para esta cuota'
    });

    await queryInterface.addColumn('cuotas', 'fecha_envio_recordatorio', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha del último recordatorio enviado'
    });

    // Agregar índice para búsquedas por MercadoPago ID
    await queryInterface.addIndex('cuotas', ['mercado_pago_id'], {
      name: 'idx_cuotas_mercado_pago_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_mercado_pago_id');

    // Eliminar columnas
    await queryInterface.removeColumn('cuotas', 'fecha_envio_recordatorio');
    await queryInterface.removeColumn('cuotas', 'cantidad_recordatorios');
    await queryInterface.removeColumn('cuotas', 'mercado_pago_id');
    await queryInterface.removeColumn('cuotas', 'link_pago');
  }
};
