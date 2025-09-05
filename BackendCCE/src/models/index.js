const sequelize = require('../config/database');
const Socio = require('./Socio');
const Cuota = require('./Cuota');
const Usuario = require('./Usuario');

// Define associations
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
  Socio,
  Cuota,
  Usuario
};