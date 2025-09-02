/**
 * Tests for Pagos Controller
 */

const pagosController = require('../../controllers/pagosController');
const { Socio, Cuota } = require('../../models');
const mercadoPagoService = require('../../services/mercadoPagoService');

// Mock the models
jest.mock('../../models', () => ({
  Socio: {
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  Cuota: {
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

// Mock MercadoPago service
jest.mock('../../services/mercadoPagoService', () => ({
  crearLinkPago: jest.fn(),
  procesarWebhook: jest.fn()
}));

describe('Pagos Controller', () => {
  let req, res;

  beforeEach(() => {
    req = global.testUtils.createMockReq();
    res = global.testUtils.createMockRes();
    jest.clearAllMocks();
  });

  describe('obtenerEstadoPagos', () => {
    it('should return payment status for all socios', async () => {
      const mockSocios = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          cuotas: [
            global.testUtils.createTestPayment({ estado: 'pendiente' })
          ]
        }
      ];

      Socio.findAll.mockResolvedValue(mockSocios);

      await pagosController.obtenerEstadoPagos(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith({
        where: {},
        include: {
          model: Cuota,
          as: 'cuotas',
          where: {},
          required: false,
          order: [['fechaVencimiento', 'DESC']]
        },
        limit: 50,
        offset: 0,
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSocios
      });
    });

    it('should filter by payment status', async () => {
      req.query.estado = 'pendiente';

      Socio.findAll.mockResolvedValue([]);

      await pagosController.obtenerEstadoPagos(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith({
        where: {},
        include: {
          model: Cuota,
          as: 'cuotas',
          where: { estado: 'pendiente' },
          required: false,
          order: [['fechaVencimiento', 'DESC']]
        },
        limit: 50,
        offset: 0,
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
      });
    });

    it('should filter by activity and date range', async () => {
      req.query.actividad = 'basketball';
      req.query.fechaDesde = '2024-01-01';
      req.query.fechaHasta = '2024-12-31';

      Socio.findAll.mockResolvedValue([]);

      await pagosController.obtenerEstadoPagos(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith({
        where: { actividad: 'basketball' },
        include: {
          model: Cuota,
          as: 'cuotas',
          where: {
            fechaVencimiento: {
              [require('sequelize').Op.gte]: '2024-01-01',
              [require('sequelize').Op.lte]: '2024-12-31'
            }
          },
          required: false,
          order: [['fechaVencimiento', 'DESC']]
        },
        limit: 50,
        offset: 0,
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
      });
    });
  });

  describe('crearLinkPago', () => {
    it('should create payment link successfully', async () => {
      req.body = {
        socioId: 'test-socio-id',
        cuotaId: 'test-cuota-id',
        monto: 15000
      };

      const mockSocio = global.testUtils.createTestMember({ id: 'test-socio-id' });
      const mockCuota = global.testUtils.createTestPayment({ id: 'test-cuota-id' });
      const mockPaymentLink = 'https://test-payment-link.com';

      Socio.findByPk.mockResolvedValue(mockSocio);
      Cuota.findByPk.mockResolvedValue(mockCuota);
      mercadoPagoService.crearLinkPago.mockResolvedValue({
        success: true,
        paymentLink: mockPaymentLink,
        preferenceId: 'test-preference-id'
      });

      await pagosController.crearLinkPago(req, res);

      expect(mercadoPagoService.crearLinkPago).toHaveBeenCalledWith(
        mockSocio,
        mockCuota,
        15000
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Link de pago creado exitosamente',
        data: {
          paymentLink: mockPaymentLink,
          preferenceId: 'test-preference-id'
        }
      });
    });

    it('should return 404 if socio not found', async () => {
      req.body = {
        socioId: 'non-existent-socio',
        cuotaId: 'test-cuota-id',
        monto: 15000
      };

      Socio.findByPk.mockResolvedValue(null);

      await expect(pagosController.crearLinkPago(req, res)).rejects.toThrow('Socio no encontrado');
    });

    it('should return 404 if cuota not found', async () => {
      req.body = {
        socioId: 'test-socio-id',
        cuotaId: 'non-existent-cuota',
        monto: 15000
      };

      const mockSocio = global.testUtils.createTestMember();
      Socio.findByPk.mockResolvedValue(mockSocio);
      Cuota.findByPk.mockResolvedValue(null);

      await expect(pagosController.crearLinkPago(req, res)).rejects.toThrow('Cuota no encontrada');
    });

    it('should handle MercadoPago service errors', async () => {
      req.body = {
        socioId: 'test-socio-id',
        cuotaId: 'test-cuota-id',
        monto: 15000
      };

      const mockSocio = global.testUtils.createTestMember();
      const mockCuota = global.testUtils.createTestPayment();

      Socio.findByPk.mockResolvedValue(mockSocio);
      Cuota.findByPk.mockResolvedValue(mockCuota);
      mercadoPagoService.crearLinkPago.mockRejectedValue(new Error('MercadoPago API error'));

      await expect(pagosController.crearLinkPago(req, res)).rejects.toThrow('MercadoPago API error');
    });
  });

  describe('procesarPago', () => {
    it('should process payment successfully', async () => {
      req.body = {
        cuotaId: 'test-cuota-id',
        metodoPago: 'mercadopago',
        numeroRecibo: 'REC-001'
      };

      const mockCuota = {
        id: 'test-cuota-id',
        estado: 'pendiente',
        update: jest.fn().mockResolvedValue(true),
        getSocio: jest.fn().mockResolvedValue(global.testUtils.createTestMember())
      };

      Cuota.findByPk.mockResolvedValue(mockCuota);

      await pagosController.procesarPago(req, res);

      expect(mockCuota.update).toHaveBeenCalledWith({
        estado: 'pagado',
        fechaPago: expect.any(Date),
        metodoPago: 'mercadopago',
        numeroRecibo: 'REC-001'
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pago procesado exitosamente',
        data: mockCuota
      });
    });

    it('should return 404 if cuota not found', async () => {
      req.body = {
        cuotaId: 'non-existent-cuota',
        metodoPago: 'efectivo'
      };

      Cuota.findByPk.mockResolvedValue(null);

      await expect(pagosController.procesarPago(req, res)).rejects.toThrow('Cuota no encontrada');
    });

    it('should handle already paid cuotas', async () => {
      req.body = {
        cuotaId: 'test-cuota-id',
        metodoPago: 'efectivo'
      };

      const mockCuota = {
        id: 'test-cuota-id',
        estado: 'pagado'
      };

      Cuota.findByPk.mockResolvedValue(mockCuota);

      await expect(pagosController.procesarPago(req, res)).rejects.toThrow('La cuota ya está pagada');
    });
  });

  describe('enviarRecordatorio', () => {
    it('should send payment reminder successfully', async () => {
      req.body = {
        socioId: 'test-socio-id',
        cuotaId: 'test-cuota-id',
        tipo: 'email'
      };

      const mockSocio = global.testUtils.createTestMember();
      const mockCuota = global.testUtils.createTestPayment();

      Socio.findByPk.mockResolvedValue(mockSocio);
      Cuota.findByPk.mockResolvedValue(mockCuota);

      await pagosController.enviarRecordatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recordatorio de pago enviado exitosamente'
      });
    });

    it('should return 404 if socio not found', async () => {
      req.body = {
        socioId: 'non-existent-socio',
        cuotaId: 'test-cuota-id',
        tipo: 'email'
      };

      Socio.findByPk.mockResolvedValue(null);

      await expect(pagosController.enviarRecordatorio(req, res)).rejects.toThrow('Socio no encontrado');
    });
  });
});