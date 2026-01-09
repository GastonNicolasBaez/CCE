const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Actividad - Representa actividades deportivas del club
 * MULTI-TENANT: Cada actividad pertenece a un tenant específico
 *
 * Cada club puede crear sus propias actividades con precios personalizados.
 * Los socios pueden tener múltiples actividades (relación many-to-many).
 */
const Actividad = sequelize.define('Actividad', {
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
    comment: 'Tenant this activity belongs to'
  },

  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 100],
        msg: 'El nombre de la actividad debe tener entre 2 y 100 caracteres'
      }
    },
    comment: 'Activity name (e.g., Basquet, Yoga, Natación)'
  },

  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'El monto debe ser mayor o igual a 0'
      },
      isDecimal: {
        msg: 'El monto debe ser un número decimal válido'
      }
    },
    comment: 'Monthly price for this activity'
  },

  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this activity is available for selection'
  },

  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'El orden debe ser un número entero'
      }
    },
    comment: 'Display order in UI (lower numbers first)'
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional description of the activity'
  }
}, {
  tableName: 'actividades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      // Multi-tenant: Nombre único por tenant
      unique: true,
      fields: ['tenant_id', 'nombre'],
      name: 'actividades_tenant_nombre_unique'
    },
    {
      // Filtrar actividades activas por tenant
      fields: ['tenant_id', 'activa'],
      name: 'actividades_tenant_activa_idx'
    },
    {
      // Ordenar actividades
      fields: ['tenant_id', 'orden'],
      name: 'actividades_tenant_orden_idx'
    }
  ]
});

// Instance methods

/**
 * Check if this activity is active
 * @returns {boolean}
 */
Actividad.prototype.isActiva = function() {
  return this.activa === true;
};

/**
 * Get count of socios enrolled in this activity
 * Requires the SocioActividad association to be loaded
 * @returns {Promise<number>}
 */
Actividad.prototype.getSociosCount = async function() {
  const SocioActividad = sequelize.models.SocioActividad;

  if (!SocioActividad) {
    throw new Error('SocioActividad model not loaded');
  }

  const count = await SocioActividad.count({
    where: {
      actividad_id: this.id
    }
  });

  return count;
};

/**
 * Get formatted price for display
 * @returns {string}
 */
Actividad.prototype.getMontoFormateado = function() {
  return `$${parseFloat(this.monto).toFixed(2)}`;
};

// Class methods

/**
 * Get all active activities for a tenant
 * @param {number} tenantId - Tenant ID
 * @returns {Promise<Array>}
 */
Actividad.getActivas = async function(tenantId) {
  return await this.findAll({
    where: {
      tenantId,
      activa: true
    },
    order: [['orden', 'ASC'], ['nombre', 'ASC']]
  });
};

module.exports = Actividad;
