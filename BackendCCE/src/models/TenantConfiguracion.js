const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo TenantConfiguracion - Configuración del club para generación de cuotas
 *
 * Stores club-specific settings for quota calculation and automatic generation.
 * One configuration per tenant.
 */
const TenantConfiguracion = sequelize.define('TenantConfiguracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // TENANT RELATION (one-to-one)
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Tenant this configuration belongs to'
  },

  // QUOTA TYPE
  tipoCuota: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'por_actividad',
    field: 'tipo_cuota',
    validate: {
      isIn: {
        args: [['unica', 'por_actividad']],
        msg: 'Tipo de cuota debe ser "unica" o "por_actividad"'
      }
    },
    comment: 'unica = fixed amount for all | por_actividad = based on activities'
  },

  montoBase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'monto_base',
    validate: {
      min: {
        args: [0],
        msg: 'El monto base debe ser mayor o igual a 0'
      }
    },
    comment: 'Base amount (only used if tipo_cuota = unica)'
  },

  // MULTIPLE ACTIVITIES STRATEGY
  multipleActividadesStrategy: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'sumar',
    field: 'multiple_actividades_strategy',
    validate: {
      isIn: {
        args: [['sumar', 'maximo', 'descuento']],
        msg: 'Estrategia debe ser "sumar", "maximo" o "descuento"'
      }
    },
    comment: 'sumar = add all | maximo = highest price | descuento = discount on additional'
  },

  descuentoActividades: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'descuento_actividades',
    validate: {
      min: {
        args: [0],
        msg: 'El descuento debe ser mayor o igual a 0'
      },
      max: {
        args: [100],
        msg: 'El descuento no puede ser mayor a 100'
      }
    },
    comment: 'Discount percentage for additional activities (if strategy = descuento)'
  },

  // DUE DATE AND REMINDERS
  diaVencimiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'dia_vencimiento',
    validate: {
      min: {
        args: [1],
        msg: 'El día de vencimiento debe estar entre 1 y 28'
      },
      max: {
        args: [28],
        msg: 'El día de vencimiento debe estar entre 1 y 28'
      }
    },
    comment: 'Day of the month for payment due date (1-28)'
  },

  recordatorioDiasAntes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    field: 'recordatorio_dias_antes',
    validate: {
      min: {
        args: [0],
        msg: 'Los días de recordatorio deben ser mayor o igual a 0'
      },
      max: {
        args: [30],
        msg: 'Los días de recordatorio no pueden ser mayor a 30'
      }
    },
    comment: 'Days before due date to send reminder email'
  },

  // DISCOUNTS
  descuentoMenores: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'descuento_menores',
    validate: {
      min: {
        args: [0],
        msg: 'El descuento debe ser mayor o igual a 0'
      },
      max: {
        args: [100],
        msg: 'El descuento no puede ser mayor a 100'
      }
    },
    comment: 'Discount percentage for minors (< 18 years old)'
  },

  // AUTOMATION
  generarAutomaticamente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'generar_automaticamente',
    comment: 'Auto-generate monthly quotas via cron job'
  },

  enviarRecordatorios: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'enviar_recordatorios',
    comment: 'Auto-send payment reminder emails'
  }
}, {
  tableName: 'tenant_configuracion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['tenant_id'],
      name: 'tenant_configuracion_tenant_unique'
    },
    {
      fields: ['generar_automaticamente'],
      name: 'tenant_configuracion_generar_auto_idx'
    }
  ]
});

// Instance methods

/**
 * Get the full configuration as a plain object
 * @returns {Object}
 */
TenantConfiguracion.prototype.getConfig = function() {
  return {
    tenantId: this.tenantId,
    tipoCuota: this.tipoCuota,
    montoBase: parseFloat(this.montoBase),
    multipleActividadesStrategy: this.multipleActividadesStrategy,
    descuentoActividades: parseFloat(this.descuentoActividades),
    diaVencimiento: this.diaVencimiento,
    recordatorioDiasAntes: this.recordatorioDiasAntes,
    descuentoMenores: parseFloat(this.descuentoMenores),
    generarAutomaticamente: this.generarAutomaticamente,
    enviarRecordatorios: this.enviarRecordatorios
  };
};

/**
 * Check if this tenant has automatic quota generation enabled
 * @returns {boolean}
 */
TenantConfiguracion.prototype.debeGenerarCuotas = function() {
  return this.generarAutomaticamente === true;
};

/**
 * Check if this tenant has automatic reminders enabled
 * @returns {boolean}
 */
TenantConfiguracion.prototype.debeEnviarRecordatorios = function() {
  return this.enviarRecordatorios === true;
};

/**
 * Get the date for sending reminders based on due date
 * @param {Date} fechaVencimiento - Due date
 * @returns {Date}
 */
TenantConfiguracion.prototype.getFechaRecordatorio = function(fechaVencimiento) {
  const fecha = new Date(fechaVencimiento);
  fecha.setDate(fecha.getDate() - this.recordatorioDiasAntes);
  return fecha;
};

// Class methods

/**
 * Get or create default configuration for a tenant
 * @param {number} tenantId - Tenant ID
 * @returns {Promise<TenantConfiguracion>}
 */
TenantConfiguracion.getOrCreateDefault = async function(tenantId) {
  const [configuracion, created] = await this.findOrCreate({
    where: { tenantId },
    defaults: {
      tenantId,
      tipoCuota: 'por_actividad',
      montoBase: 0,
      multipleActividadesStrategy: 'sumar',
      descuentoActividades: 0,
      diaVencimiento: 10,
      recordatorioDiasAntes: 2,
      descuentoMenores: 0,
      generarAutomaticamente: true,
      enviarRecordatorios: true
    }
  });

  if (created) {
    console.log(`✅ Created default configuration for tenant ${tenantId}`);
  }

  return configuracion;
};

module.exports = TenantConfiguracion;
