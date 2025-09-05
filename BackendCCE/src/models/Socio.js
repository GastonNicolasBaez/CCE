const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Socio = sequelize.define('Socio', {
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
      unique: true,
      fields: ['dni']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['actividad']
    },
    {
      fields: ['estado']
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