const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Cuota - Representa cuotas/pagos mensuales de socios
 * MULTI-TENANT: Cada cuota pertenece a un tenant específico
 */
const Cuota = sequelize.define('Cuota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // MULTI-TENANT: Relación con tenant
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Tenant this cuota belongs to'
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
      fields: ['tenant_id'],
      name: 'cuotas_tenant_id_idx'
    },
    {
      fields: ['socio_id'],
      name: 'cuotas_socio_id_idx'
    },
    {
      fields: ['estado'],
      name: 'cuotas_estado_idx'
    },
    {
      fields: ['fecha_vencimiento'],
      name: 'cuotas_fecha_vencimiento_idx'
    },
    {
      fields: ['periodo'],
      name: 'cuotas_periodo_idx'
    },
    {
      // Multi-tenant: único por socio y periodo dentro del tenant
      unique: true,
      fields: ['tenant_id', 'socio_id', 'periodo'],
      name: 'cuotas_tenant_socio_periodo_unique'
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