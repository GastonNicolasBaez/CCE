const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const Usuario = require('./Usuario');
const Socio = require('./Socio');
const Cuota = require('./Cuota');
const Actividad = require('./Actividad');
const TenantConfiguracion = require('./TenantConfiguracion');

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

// Tenant has many Actividades
Tenant.hasMany(Actividad, {
  foreignKey: 'tenantId',
  as: 'actividades',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Actividad.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Tenant has one Configuracion (one-to-one)
Tenant.hasOne(TenantConfiguracion, {
  foreignKey: 'tenantId',
  as: 'configuracion',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

TenantConfiguracion.belongsTo(Tenant, {
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

// ==========================================
// MANY-TO-MANY: SOCIOS ↔ ACTIVIDADES
// ==========================================

// Many-to-many relationship through socio_actividades pivot table
Socio.belongsToMany(Actividad, {
  through: 'socio_actividades',
  foreignKey: 'socio_id',
  otherKey: 'actividad_id',
  as: 'actividades',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Actividad.belongsToMany(Socio, {
  through: 'socio_actividades',
  foreignKey: 'actividad_id',
  otherKey: 'socio_id',
  as: 'socios',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Tenant,
  Usuario,
  Socio,
  Cuota,
  Actividad,
  TenantConfiguracion
};