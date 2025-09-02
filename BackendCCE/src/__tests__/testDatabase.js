/**
 * Test Database Setup and Utilities
 */

const { Sequelize } = require('sequelize');
const config = require('../config');

// Create test database instance
const createTestDatabase = () => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:', // In-memory database for tests
    logging: false, // Disable SQL logging in tests
    sync: { force: true }, // Recreate tables for each test run
  });
};

// Test data factories
const testDataFactory = {
  socio: (overrides = {}) => ({
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan@test.com',
    telefono: '+54 11 1234-5678',
    direccion: 'Calle Falsa 123',
    fechaNacimiento: '1990-01-01',
    actividad: 'basketball',
    estado: 'activo',
    tipoMembresia: 'jugador',
    fechaRegistro: new Date(),
    ...overrides,
  }),

  cuota: (overrides = {}) => ({
    socioId: 'test-socio-id',
    periodo: '2024-01',
    monto: 15000,
    estado: 'pendiente',
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    fechaCreacion: new Date(),
    ...overrides,
  }),

  usuario: (overrides = {}) => ({
    nombre: 'Admin',
    apellido: 'Test',
    email: 'admin@test.com',
    password: 'hashedpassword123',
    rol: 'admin',
    activo: true,
    fechaRegistro: new Date(),
    ...overrides,
  }),
};

// Database seeding utilities
const seedDatabase = async (sequelize, data = {}) => {
  const { Socio, Cuota, Usuario } = require('../models');

  // Clear existing data
  await sequelize.truncate({ cascade: true, restartIdentity: true });

  const createdData = {
    socios: [],
    cuotas: [],
    usuarios: [],
  };

  // Create socios
  if (data.socios) {
    for (const socioData of data.socios) {
      const socio = await Socio.create(testDataFactory.socio(socioData));
      createdData.socios.push(socio);
    }
  }

  // Create cuotas
  if (data.cuotas) {
    for (const cuotaData of data.cuotas) {
      const cuota = await Cuota.create(testDataFactory.cuota(cuotaData));
      createdData.cuotas.push(cuota);
    }
  }

  // Create usuarios
  if (data.usuarios) {
    for (const usuarioData of data.usuarios) {
      const usuario = await Usuario.create(testDataFactory.usuario(usuarioData));
      createdData.usuarios.push(usuario);
    }
  }

  return createdData;
};

// Test database cleanup
const cleanupDatabase = async (sequelize) => {
  try {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  } catch (error) {
    console.warn('Database cleanup warning:', error.message);
  }
};

// Mock external services for testing
const mockServices = {
  email: {
    enviarInformacionPago: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
    }),
    enviarRecordatorioPago: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-reminder-id',
    }),
    enviarConfirmacionPago: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-confirmation-id',
    }),
  },

  sms: {
    enviarSMS: jest.fn().mockResolvedValue({
      success: true,
      sid: 'test-sms-id',
    }),
  },

  mercadoPago: {
    crearLinkPago: jest.fn().mockResolvedValue({
      success: true,
      paymentLink: 'https://test-payment-link.com',
      preferenceId: 'test-preference-id',
    }),
    procesarWebhook: jest.fn().mockResolvedValue({
      success: true,
      paymentId: 'test-payment-id',
    }),
  },
};

// Test authentication helpers
const authHelpers = {
  generateTestToken: (payload = { id: 'test-user-id', rol: 'admin' }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
  },

  createAuthHeaders: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
};

// Database transaction wrapper for tests
const withTransaction = async (sequelize, callback) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.rollback(); // Always rollback in tests
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Test utilities for date manipulation
const dateUtils = {
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  subtractDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  },

  formatDate: (date) => {
    return date.toISOString().split('T')[0];
  },
};

// Performance testing helpers
const performanceHelpers = {
  measureExecutionTime: async (fn) => {
    const start = Date.now();
    const result = await fn();
    const executionTime = Date.now() - start;
    return { result, executionTime };
  },

  expectExecutionTime: (executionTime, maxTime) => {
    expect(executionTime).toBeLessThan(maxTime);
  },
};

module.exports = {
  createTestDatabase,
  testDataFactory,
  seedDatabase,
  cleanupDatabase,
  mockServices,
  authHelpers,
  withTransaction,
  dateUtils,
  performanceHelpers,
};