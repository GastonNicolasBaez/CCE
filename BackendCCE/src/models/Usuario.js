const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
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
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      isValidPassword(value) {
        // If it's a bcrypt hash (starts with $2b$ or $2a$ and is 60 chars), it's valid
        if (/^\$2[aby]\$\d{2}\$.{53}$/.test(value)) {
          return true;
        }

        // Otherwise, validate as a plain password (before hashing)
        // Minimum 12 characters
        if (value.length < 12) {
          throw new Error('Password must be at least 12 characters long');
        }

        // Must contain uppercase letter
        if (!/[A-Z]/.test(value)) {
          throw new Error('Password must contain at least one uppercase letter');
        }

        // Must contain lowercase letter
        if (!/[a-z]/.test(value)) {
          throw new Error('Password must contain at least one lowercase letter');
        }

        // Must contain number
        if (!/[0-9]/.test(value)) {
          throw new Error('Password must contain at least one number');
        }

        // Must contain special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          throw new Error('Password must contain at least one special character');
        }
      }
    }
  },
  rol: {
    type: DataTypes.ENUM('admin', 'staff'),
    allowNull: false,
    defaultValue: 'staff'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of consecutive failed login attempts'
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Account is locked until this timestamp'
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last successful login timestamp'
  },
  last_login_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Last login IP address (supports IPv6)'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  paranoid: true,  // Enable soft deletes
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',  // Soft delete timestamp
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        // Use 12 rounds for better security (increased from 10)
        usuario.password = await bcrypt.hash(usuario.password, 12);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        // Use 12 rounds for better security (increased from 10)
        usuario.password = await bcrypt.hash(usuario.password, 12);
      }
    }
  }
});

// Instance methods
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

// Account lockout methods
Usuario.prototype.isLocked = function() {
  // Check if account is locked and lock hasn't expired
  if (!this.locked_until) {
    return false;
  }

  const now = new Date();
  if (now >= this.locked_until) {
    // Lock has expired, clear it
    return false;
  }

  return true;
};

Usuario.prototype.incrementFailedAttempts = async function() {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MINUTES = 30;

  this.failed_login_attempts += 1;

  // Lock account after MAX_ATTEMPTS
  if (this.failed_login_attempts >= MAX_ATTEMPTS) {
    this.locked_until = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
  }

  await this.save();
};

Usuario.prototype.resetFailedAttempts = async function() {
  this.failed_login_attempts = 0;
  this.locked_until = null;
  await this.save();
};

Usuario.prototype.updateLastLogin = async function(ipAddress) {
  this.last_login_at = new Date();
  this.last_login_ip = ipAddress;
  await this.save();
};

module.exports = Usuario;