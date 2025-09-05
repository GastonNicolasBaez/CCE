'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla usuarios
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('admin', 'staff'),
        allowNull: false,
        defaultValue: 'staff'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla socios
    await queryInterface.createTable('socios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      dni: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      actividad: {
        type: Sequelize.ENUM('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'),
        allowNull: false,
        defaultValue: 'Solo socio'
      },
      es_jugador: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      estado: {
        type: Sequelize.ENUM('Activo', 'Inactivo', 'Suspendido'),
        allowNull: false,
        defaultValue: 'Activo'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla cuotas
    await queryInterface.createTable('cuotas', {
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
        onDelete: 'CASCADE'
      },
      periodo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Formato: YYYY-MM (ej: 2024-01)'
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_pago: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('Pendiente', 'Pagada', 'Vencida', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Pendiente'
      },
      metodo_pago: {
        type: Sequelize.ENUM('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
        allowNull: true
      },
      numero_recibo: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices para optimización
    await queryInterface.addIndex('socios', ['dni'], {
      name: 'idx_socios_dni',
      unique: true
    });
    
    await queryInterface.addIndex('socios', ['email'], {
      name: 'idx_socios_email',
      unique: true
    });
    
    await queryInterface.addIndex('socios', ['estado'], {
      name: 'idx_socios_estado'
    });
    
    await queryInterface.addIndex('socios', ['actividad'], {
      name: 'idx_socios_actividad'
    });
    
    await queryInterface.addIndex('cuotas', ['socio_id'], {
      name: 'idx_cuotas_socio_id'
    });
    
    await queryInterface.addIndex('cuotas', ['periodo'], {
      name: 'idx_cuotas_periodo'
    });
    
    await queryInterface.addIndex('cuotas', ['estado'], {
      name: 'idx_cuotas_estado'
    });
    
    await queryInterface.addIndex('cuotas', ['fecha_vencimiento'], {
      name: 'idx_cuotas_fecha_vencimiento'
    });

    // Crear índice único compuesto para evitar cuotas duplicadas
    await queryInterface.addIndex('cuotas', ['socio_id', 'periodo'], {
      name: 'idx_cuotas_socio_periodo',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar tablas en orden inverso debido a las foreign keys
    await queryInterface.dropTable('cuotas');
    await queryInterface.dropTable('socios');
    await queryInterface.dropTable('usuarios');
  }
};