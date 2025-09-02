/**
 * Tests for Socios Controller
 */

const sociosController = require('../../controllers/sociosController');
const { Socio, Cuota } = require('../../models');

// Mock the models
jest.mock('../../models', () => ({
  Socio: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  Cuota: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}));

// Mock email service
jest.mock('../../services/emailService', () => ({
  enviarInformacionPago: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id'
  })
}));

describe('Socios Controller', () => {
  let req, res;

  beforeEach(() => {
    req = global.testUtils.createMockReq();
    res = global.testUtils.createMockRes();
    jest.clearAllMocks();
  });

  describe('obtenerSocios', () => {
    it('should return all socios without filters', async () => {
      const mockSocios = [
        global.testUtils.createTestMember({ id: '1', nombre: 'Juan' }),
        global.testUtils.createTestMember({ id: '2', nombre: 'María' })
      ];

      Socio.findAll.mockResolvedValue(mockSocios);
      Socio.count.mockResolvedValue(2);

      await sociosController.obtenerSocios(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith({
        where: {},
        include: {
          model: Cuota,
          as: 'cuotas',
          required: false
        },
        limit: 50,
        offset: 0,
        order: [['fechaRegistro', 'DESC']]
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSocios,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 50
        }
      });
    });

    it('should filter socios by activity', async () => {
      req.query.actividad = 'basketball';
      
      const mockSocios = [
        global.testUtils.createTestMember({ actividad: 'basketball' })
      ];

      Socio.findAll.mockResolvedValue(mockSocios);
      Socio.count.mockResolvedValue(1);

      await sociosController.obtenerSocios(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith({
        where: { actividad: 'basketball' },
        include: {
          model: Cuota,
          as: 'cuotas',
          required: false
        },
        limit: 50,
        offset: 0,
        order: [['fechaRegistro', 'DESC']]
      });
    });

    it('should search socios by name', async () => {
      req.query.search = 'Juan';
      
      const mockSocios = [
        global.testUtils.createTestMember({ nombre: 'Juan' })
      ];

      Socio.findAll.mockResolvedValue(mockSocios);
      Socio.count.mockResolvedValue(1);

      await sociosController.obtenerSocios(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [require('sequelize').Op.or]: expect.any(Array)
          })
        })
      );
    });

    it('should handle pagination', async () => {
      req.query.page = '2';
      req.query.limit = '10';

      Socio.findAll.mockResolvedValue([]);
      Socio.count.mockResolvedValue(25);

      await sociosController.obtenerSocios(req, res);

      expect(Socio.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10
        })
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            currentPage: 2,
            totalPages: 3,
            totalItems: 25,
            itemsPerPage: 10
          }
        })
      );
    });
  });

  describe('obtenerSocio', () => {
    it('should return a specific socio', async () => {
      req.params.id = 'test-id';
      const mockSocio = global.testUtils.createTestMember({ id: 'test-id' });

      Socio.findByPk.mockResolvedValue(mockSocio);

      await sociosController.obtenerSocio(req, res);

      expect(Socio.findByPk).toHaveBeenCalledWith('test-id', {
        include: {
          model: Cuota,
          as: 'cuotas',
          order: [['fechaVencimiento', 'DESC']]
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSocio
      });
    });

    it('should return 404 if socio not found', async () => {
      req.params.id = 'non-existent-id';
      Socio.findByPk.mockResolvedValue(null);

      await expect(sociosController.obtenerSocio(req, res)).rejects.toThrow('Socio no encontrado');
    });
  });

  describe('crearSocio', () => {
    it('should create a new socio successfully', async () => {
      const socioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '+54 11 1234-5678',
        actividad: 'basketball'
      };

      req.body = socioData;
      
      const mockCreatedSocio = { 
        id: 'new-socio-id', 
        ...socioData,
        dataValues: socioData
      };

      Socio.create.mockResolvedValue(mockCreatedSocio);

      await sociosController.crearSocio(req, res);

      expect(Socio.create).toHaveBeenCalledWith(socioData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Socio registrado exitosamente',
        data: mockCreatedSocio
      });
    });

    it('should handle email service errors gracefully', async () => {
      const socioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com'
      };

      req.body = socioData;
      
      const mockCreatedSocio = { 
        id: 'new-socio-id', 
        ...socioData,
        dataValues: socioData
      };

      Socio.create.mockResolvedValue(mockCreatedSocio);
      
      // Mock email service to throw error
      const emailService = require('../../services/emailService');
      emailService.enviarInformacionPago.mockRejectedValue(new Error('Email service error'));

      await sociosController.crearSocio(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Socio registrado exitosamente'
        })
      );
    });
  });

  describe('actualizarSocio', () => {
    it('should update socio successfully', async () => {
      req.params.id = 'test-id';
      req.body = { nombre: 'Juan Carlos' };

      const mockSocio = { 
        id: 'test-id', 
        nombre: 'Juan',
        update: jest.fn().mockResolvedValue(true)
      };

      Socio.findByPk.mockResolvedValue(mockSocio);

      await sociosController.actualizarSocio(req, res);

      expect(mockSocio.update).toHaveBeenCalledWith({ nombre: 'Juan Carlos' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Socio actualizado exitosamente',
        data: mockSocio
      });
    });

    it('should return 404 if socio not found for update', async () => {
      req.params.id = 'non-existent-id';
      req.body = { nombre: 'New Name' };

      Socio.findByPk.mockResolvedValue(null);

      await expect(sociosController.actualizarSocio(req, res)).rejects.toThrow('Socio no encontrado');
    });
  });

  describe('eliminarSocio', () => {
    it('should delete socio successfully', async () => {
      req.params.id = 'test-id';

      const mockSocio = {
        id: 'test-id',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Socio.findByPk.mockResolvedValue(mockSocio);

      await sociosController.eliminarSocio(req, res);

      expect(mockSocio.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Socio eliminado exitosamente'
      });
    });

    it('should return 404 if socio not found for deletion', async () => {
      req.params.id = 'non-existent-id';

      Socio.findByPk.mockResolvedValue(null);

      await expect(sociosController.eliminarSocio(req, res)).rejects.toThrow('Socio no encontrado');
    });
  });
});