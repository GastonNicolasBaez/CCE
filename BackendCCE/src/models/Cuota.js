const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cuota = sequelize.define('Cuota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  socioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'socio_id',
    references: {
      model: 'socios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  periodo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Formato: YYYY-MM (ej: 2024-01)'
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
    field: 'fecha_vencimiento',
    validate: {
      isDate: true
    }
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_pago',
    validate: {
      isDate: true
    }
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Pagada', 'Vencida', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  metodoPago: {
    type: DataTypes.ENUM('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
    allowNull: true,
    field: 'metodo_pago'
  },
  numeroRecibo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'numero_recibo',
    unique: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'cuotas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['socio_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_vencimiento']
    },
    {
      fields: ['periodo']
    },
    {
      unique: true,
      fields: ['socio_id', 'periodo']
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