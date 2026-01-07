const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Tenant - Representa un club/organización en la plataforma multi-tenant
 * Cada tenant tiene su propia instancia aislada del sistema
 */
const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // Identificador único para subdomain (ej: 'espora' para espora.zeclogic.net.ar)
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i, // Solo letras, números y guiones
      len: [3, 50]
    },
    comment: 'Unique identifier for subdomain (e.g., espora, river, boca)'
  },

  // Nombre completo del club
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    },
    comment: 'Full name of the club (e.g., Club Comandante Espora)'
  },

  // Estado del tenant
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'trial', 'cancelled'),
    allowNull: false,
    defaultValue: 'trial',
    comment: 'Tenant status: active, suspended, trial, cancelled'
  },

  // Plan de suscripción
  plan: {
    type: DataTypes.ENUM('free', 'pro', 'enterprise'),
    allowNull: false,
    defaultValue: 'free',
    comment: 'Subscription plan: free (50 members), pro (500 members), enterprise (unlimited)'
  },

  // Configuración personalizable (logo, colores, etc)
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Custom settings: { logo, primaryColor, secondaryColor, etc }'
  },

  // Límites según el plan
  maxMembers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    field: 'max_members',
    comment: 'Maximum number of members allowed based on plan'
  },

  // Información de contacto del admin
  adminEmail: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'admin_email',
    validate: {
      isEmail: true,
      notEmpty: true
    },
    comment: 'Email of the tenant administrator'
  },

  adminName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'admin_name',
    validate: {
      notEmpty: true,
      len: [2, 100]
    },
    comment: 'Name of the tenant administrator'
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\+]?[0-9\s\-\(\)]{10,20}$/
    },
    comment: 'Contact phone number'
  },

  // Fecha de fin del trial (si aplica)
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'trial_ends_at',
    comment: 'Trial expiration date (null if not on trial)'
  },

  // Metadata adicional
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata: { activatedAt, lastLoginAt, etc }'
  }
}, {
  tableName: 'tenants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['slug'],
      name: 'tenants_slug_unique'
    },
    {
      fields: ['status'],
      name: 'tenants_status_idx'
    },
    {
      fields: ['plan'],
      name: 'tenants_plan_idx'
    },
    {
      fields: ['admin_email'],
      name: 'tenants_admin_email_idx'
    }
  ]
});

// ==========================================
// Instance Methods
// ==========================================

/**
 * Check if tenant is active and can access the system
 */
Tenant.prototype.isActive = function() {
  return this.status === 'active';
};

/**
 * Check if tenant is on trial
 */
Tenant.prototype.isOnTrial = function() {
  return this.status === 'trial';
};

/**
 * Check if trial has expired
 */
Tenant.prototype.isTrialExpired = function() {
  if (!this.trialEndsAt) return false;
  return new Date() > new Date(this.trialEndsAt);
};

/**
 * Get subdomain URL
 */
Tenant.prototype.getSubdomainUrl = function(baseDomain = 'zeclogic.net.ar') {
  return `https://${this.slug}.${baseDomain}`;
};

/**
 * Check if tenant has reached member limit
 */
Tenant.prototype.hasReachedMemberLimit = async function() {
  const Socio = require('./Socio');
  const count = await Socio.count({
    where: { tenantId: this.id }
  });
  return count >= this.maxMembers;
};

/**
 * Get tenant statistics
 */
Tenant.prototype.getStatistics = async function() {
  const Socio = require('./Socio');
  const Cuota = require('./Cuota');

  const totalMembers = await Socio.count({
    where: { tenantId: this.id }
  });

  const activeMembers = await Socio.count({
    where: { tenantId: this.id, estado: 'Activo' }
  });

  const totalCuotas = await Cuota.count({
    where: { tenantId: this.id }
  });

  const cuotasPagadas = await Cuota.count({
    where: { tenantId: this.id, estado: 'Pagada' }
  });

  return {
    totalMembers,
    activeMembers,
    memberLimit: this.maxMembers,
    usagePercentage: (totalMembers / this.maxMembers * 100).toFixed(2),
    totalCuotas,
    cuotasPagadas,
    paymentRate: totalCuotas > 0 ? (cuotasPagadas / totalCuotas * 100).toFixed(2) : 0
  };
};

// ==========================================
// Static Methods
// ==========================================

/**
 * Find tenant by slug (for subdomain resolution)
 */
Tenant.findBySlug = async function(slug) {
  return await Tenant.findOne({
    where: { slug: slug.toLowerCase() }
  });
};

/**
 * Check if slug is available
 */
Tenant.isSlugAvailable = async function(slug) {
  const existing = await Tenant.findOne({
    where: { slug: slug.toLowerCase() }
  });
  return !existing;
};

/**
 * Get active tenants count
 */
Tenant.getActiveTenants = async function() {
  return await Tenant.count({
    where: { status: 'active' }
  });
};

/**
 * Activate tenant (move from trial to active)
 */
Tenant.prototype.activate = async function() {
  this.status = 'active';
  this.trialEndsAt = null;
  await this.save();
};

/**
 * Suspend tenant
 */
Tenant.prototype.suspend = async function(reason = null) {
  this.status = 'suspended';
  if (reason) {
    this.metadata = {
      ...this.metadata,
      suspendedReason: reason,
      suspendedAt: new Date()
    };
  }
  await this.save();
};

// ==========================================
// Hooks
// ==========================================

Tenant.beforeCreate(async (tenant, options) => {
  // Normalize slug
  tenant.slug = tenant.slug.toLowerCase().trim();

  // Set trial end date (14 days from now) if on trial
  if (tenant.status === 'trial' && !tenant.trialEndsAt) {
    const trialDays = 14;
    tenant.trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
  }

  // Set max members based on plan
  if (!tenant.maxMembers) {
    const planLimits = {
      free: 50,
      pro: 500,
      enterprise: 999999
    };
    tenant.maxMembers = planLimits[tenant.plan] || 50;
  }
});

module.exports = Tenant;
