const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Socio - Representa miembros/socios del club
 * MULTI-TENANT: Cada socio pertenece a un tenant específico
 */
const Socio = sequelize.define('Socio', {
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
    comment: 'Tenant this socio belongs to'
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
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isNumeric: true,
      len: [7, 20]
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
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[\+]?[0-9\s\-\(\)]{10,20}$/
    }
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_nacimiento',
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0]
    }
  },
  fechaIngreso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_ingreso',
    defaultValue: DataTypes.NOW
  },
  actividad: {
    type: DataTypes.ENUM('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'),
    allowNull: false,
    defaultValue: 'Solo socio'
  },
  esJugador: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'es_jugador',
    defaultValue: false
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Inactivo', 'Suspendido'),
    allowNull: false,
    defaultValue: 'Activo'
  }
}, {
  tableName: 'socios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      // Multi-tenant: DNI único por tenant
      unique: true,
      fields: ['tenant_id', 'dni'],
      name: 'socios_tenant_dni_unique'
    },
    {
      // Multi-tenant: Email único por tenant
      unique: true,
      fields: ['tenant_id', 'email'],
      name: 'socios_tenant_email_unique'
    },
    {
      fields: ['tenant_id'],
      name: 'socios_tenant_id_idx'
    },
    {
      fields: ['actividad'],
      name: 'socios_actividad_idx'
    },
    {
      fields: ['estado'],
      name: 'socios_estado_idx'
    }
  ]
});

// Instance methods
Socio.prototype.getNombreCompleto = function() {
  return `${this.nombre} ${this.apellido}`;
};

Socio.prototype.getEdad = function() {
  if (!this.fechaNacimiento) {
    return null;
  }
  
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento);
  
  // Validate that birthDate is a valid date
  if (isNaN(birthDate.getTime())) {
    return null;
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = Socio;