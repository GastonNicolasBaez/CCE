const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const Usuario = require('./Usuario');
const Socio = require('./Socio');
const Cuota = require('./Cuota');

// ==========================================
// MULTI-TENANT ASSOCIATIONS
// ==========================================

// Tenant has many Users
Tenant.hasMany(Usuario, {
  foreignKey: 'tenantId',
  as: 'usuarios',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Usuario.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Tenant has many Socios
Tenant.hasMany(Socio, {
  foreignKey: 'tenantId',
  as: 'socios',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Socio.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Tenant has many Cuotas
Tenant.hasMany(Cuota, {
  foreignKey: 'tenantId',
  as: 'cuotas',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Cuota.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// EXISTING ASSOCIATIONS
// ==========================================

// Socio has many Cuotas
Socio.hasMany(Cuota, {
  foreignKey: 'socioId',
  as: 'cuotas',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Cuota.belongsTo(Socio, {
  foreignKey: 'socioId',
  as: 'socio',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Tenant,
  Usuario,
  Socio,
  Cuota
};