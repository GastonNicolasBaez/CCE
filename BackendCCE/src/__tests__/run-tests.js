/**
 * Test Runner Script
 * Simple script to validate test setup
 */

const { testDataFactory, mockServices } = require('./testDatabase');

describe('Test Setup Validation', () => {
  it('should have test data factory working', () => {
    const testSocio = testDataFactory.socio();
    
    expect(testSocio).toHaveProperty('nombre');
    expect(testSocio).toHaveProperty('email');
    expect(testSocio).toHaveProperty('actividad');
    expect(testSocio.actividad).toBe('basketball');
  });

  it('should have mock services available', () => {
    expect(mockServices.email).toBeDefined();
    expect(mockServices.sms).toBeDefined();
    expect(mockServices.mercadoPago).toBeDefined();
  });

  it('should create test cuota correctly', () => {
    const testCuota = testDataFactory.cuota({
      monto: 20000,
      estado: 'pagado'
    });

    expect(testCuota.monto).toBe(20000);
    expect(testCuota.estado).toBe('pagado');
    expect(testCuota.periodo).toBe('2024-01');
  });
});