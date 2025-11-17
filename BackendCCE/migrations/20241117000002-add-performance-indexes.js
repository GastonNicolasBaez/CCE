'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Usuarios table indexes
    await queryInterface.addIndex('usuarios', ['email'], {
      name: 'idx_usuarios_email',
      unique: true
    });

    await queryInterface.addIndex('usuarios', ['activo'], {
      name: 'idx_usuarios_activo'
    });

    await queryInterface.addIndex('usuarios', ['locked_until'], {
      name: 'idx_usuarios_locked_until',
      where: {
        locked_until: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Socios table indexes
    await queryInterface.addIndex('socios', ['nombre'], {
      name: 'idx_socios_nombre'
    });

    await queryInterface.addIndex('socios', ['apellido'], {
      name: 'idx_socios_apellido'
    });

    await queryInterface.addIndex('socios', ['estado'], {
      name: 'idx_socios_estado'
    });

    await queryInterface.addIndex('socios', ['actividad'], {
      name: 'idx_socios_actividad'
    });

    await queryInterface.addIndex('socios', ['created_at'], {
      name: 'idx_socios_created_at'
    });

    // Composite index for common query pattern
    await queryInterface.addIndex('socios', ['estado', 'actividad'], {
      name: 'idx_socios_estado_actividad'
    });

    // Cuotas table indexes
    await queryInterface.addIndex('cuotas', ['estado'], {
      name: 'idx_cuotas_estado'
    });

    await queryInterface.addIndex('cuotas', ['metodo_pago'], {
      name: 'idx_cuotas_metodo_pago'
    });

    await queryInterface.addIndex('cuotas', ['fecha_pago'], {
      name: 'idx_cuotas_fecha_pago'
    });

    await queryInterface.addIndex('cuotas', ['fecha_vencimiento'], {
      name: 'idx_cuotas_fecha_vencimiento'
    });

    await queryInterface.addIndex('cuotas', ['fecha_envio_recordatorio'], {
      name: 'idx_cuotas_fecha_envio_recordatorio'
    });

    // Composite indexes for common query patterns
    await queryInterface.addIndex('cuotas', ['estado', 'fecha_vencimiento'], {
      name: 'idx_cuotas_estado_fecha_vencimiento'
    });

    await queryInterface.addIndex('cuotas', ['socio_id', 'periodo'], {
      name: 'idx_cuotas_socio_periodo'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove usuarios indexes
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_email');
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_activo');
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_locked_until');

    // Remove socios indexes
    await queryInterface.removeIndex('socios', 'idx_socios_nombre');
    await queryInterface.removeIndex('socios', 'idx_socios_apellido');
    await queryInterface.removeIndex('socios', 'idx_socios_estado');
    await queryInterface.removeIndex('socios', 'idx_socios_actividad');
    await queryInterface.removeIndex('socios', 'idx_socios_created_at');
    await queryInterface.removeIndex('socios', 'idx_socios_estado_actividad');

    // Remove cuotas indexes
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_estado');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_metodo_pago');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_fecha_pago');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_fecha_vencimiento');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_fecha_envio_recordatorio');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_estado_fecha_vencimiento');
    await queryInterface.removeIndex('cuotas', 'idx_cuotas_socio_periodo');
  }
};
