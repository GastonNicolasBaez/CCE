/**
 * Jest Test Setup
 * Configuración global para todas las pruebas
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_PATH = ':memory:'; // In-memory SQLite for tests

// Mock external services
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    }),
    verify: jest.fn().mockResolvedValue(true)
  }))
}));

// Mock MercadoPago
jest.mock('mercadopago', () => ({
  configure: jest.fn(),
  payment: {
    create: jest.fn().mockResolvedValue({ id: 'test-payment-id' })
  },
  preferences: {
    create: jest.fn().mockResolvedValue({ 
      id: 'test-preference-id',
      init_point: 'https://test-payment-link.com'
    })
  }
}));

// Mock Twilio
jest.mock('twilio', () => jest.fn(() => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      sid: 'test-sms-id',
      status: 'sent'
    })
  }
})));

// Global test utilities
global.testUtils = {
  // Helper to create mock request object
  createMockReq: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: { id: 'test-user-id' },
    ...overrides
  }),
  
  // Helper to create mock response object
  createMockRes: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Helper to create test member data
  createTestMember: (overrides = {}) => ({
    id: 'test-member-id',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@test.com',
    telefono: '+54 11 1234-5678',
    actividad: 'basketball',
    estado: 'activo',
    fechaRegistro: new Date().toISOString(),
    ...overrides
  }),
  
  // Helper to create test payment data
  createTestPayment: (overrides = {}) => ({
    id: 'test-payment-id',
    socioId: 'test-member-id',
    periodo: '2024-01',
    monto: 15000,
    estado: 'pendiente',
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  })
};

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});