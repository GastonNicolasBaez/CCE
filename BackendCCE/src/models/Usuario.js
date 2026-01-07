const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Modelo Usuario - Representa usuarios del sistema (admins y staff)
 * Cada usuario pertenece a un tenant específico
 */
const Usuario = sequelize.define('Usuario', {
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
    comment: 'Tenant this user belongs to'
  },

  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },

  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    // Unique constraint per tenant (handled in migration)
    validate: {
      isEmail: true,
      notEmpty: true
    },
    comment: 'Email must be unique within tenant'
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },

  rol: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
    comment: 'User role: admin (full access) or user (limited access)'
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    allowNull: false,
    defaultValue: 'active',
    comment: 'User account status'
  },

  // Legacy field for backwards compatibility
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Deprecated: Use status field instead'
  },

  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
    comment: 'Timestamp of last successful login'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      // Unique email per tenant
      unique: true,
      fields: ['tenant_id', 'email'],
      name: 'usuarios_tenant_email_unique'
    },
    {
      fields: ['tenant_id'],
      name: 'usuarios_tenant_id_idx'
    },
    {
      fields: ['email'],
      name: 'usuarios_email_idx'
    },
    {
      fields: ['status'],
      name: 'usuarios_status_idx'
    }
  ],
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

// ==========================================
// Instance Methods
// ==========================================

Usuario.prototype.getNombreCompleto = function() {
  return `${this.nombre} ${this.apellido}`;
};

Usuario.prototype.verificarPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

Usuario.prototype.toSafeJSON = function() {
  const usuario = this.toJSON();
  delete usuario.password;
  return usuario;
};

/**
 * Check if user is active
 */
Usuario.prototype.isActive = function() {
  return this.status === 'active' && this.activo;
};

/**
 * Check if user is admin
 */
Usuario.prototype.isAdmin = function() {
  return this.rol === 'admin';
};

/**
 * Update last login timestamp
 */
Usuario.prototype.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  await this.save();
};

// ==========================================
// Static Methods
// ==========================================

/**
 * Find user by email within a specific tenant
 */
Usuario.findByEmailAndTenant = async function(email, tenantId) {
  return await Usuario.findOne({
    where: {
      email: email.toLowerCase(),
      tenantId: tenantId
    }
  });
};

/**
 * Check if email exists within tenant
 */
Usuario.emailExistsInTenant = async function(email, tenantId) {
  const user = await Usuario.findByEmailAndTenant(email, tenantId);
  return !!user;
};

module.exports = Usuario;