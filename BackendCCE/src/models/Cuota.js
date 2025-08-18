const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cuota = sequelize.define('Cuota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  socioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'socios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Pagada', 'Vencida', 'Anulada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  metodoPago: {
    type: DataTypes.ENUM('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
    allowNull: true
  },
  numeroRecibo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mercadoPagoId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  linkPago: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fechaEnvioRecordatorio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cantidadRecordatorios: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  periodo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Formato: YYYY-MM (ej: 2024-01)'
  }
}, {
  tableName: 'cuotas',
  timestamps: true,
  indexes: [
    {
      fields: ['socioId']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fechaVencimiento']
    },
    {
      fields: ['periodo']
    },
    {
      unique: true,
      fields: ['socioId', 'periodo']
    }
  ],
  hooks: {
    beforeUpdate: (cuota, options) => {
      // Auto-update payment date when status changes to 'Pagada'
      if (cuota.estado === 'Pagada' && cuota.previous('estado') !== 'Pagada') {
        cuota.fechaPago = new Date();
      }
      
      // Clear payment date if status changes from 'Pagada'
      if (cuota.estado !== 'Pagada' && cuota.previous('estado') === 'Pagada') {
        cuota.fechaPago = null;
      }
    }
  }
});

// Instance methods
Cuota.prototype.estaVencida = function() {
  const today = new Date();
  const vencimiento = new Date(this.fechaVencimiento);
  return today > vencimiento && this.estado !== 'Pagada';
};

Cuota.prototype.diasVencimiento = function() {
  const today = new Date();
  const vencimiento = new Date(this.fechaVencimiento);
  const diffTime = today - vencimiento;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Cuota.prototype.generarNumeroRecibo = function() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CCE-${fecha}-${this.socioId}-${random}`;
};

// Static methods
Cuota.actualizarEstadosVencidos = async function() {
  const today = new Date().toISOString().split('T')[0];
  
  await Cuota.update(
    { estado: 'Vencida' },
    {
      where: {
        fechaVencimiento: {
          [sequelize.Sequelize.Op.lt]: today
        },
        estado: 'Pendiente'
      }
    }
  );
};

module.exports = Cuota;