/**
 * Tests for Email Service
 */

const emailService = require('../../services/emailService');
const config = require('../../config');
const { testDataFactory } = require('../testDatabase');

// Mock nodemailer
const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify
  }))
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({
      messageId: 'test-message-id-123',
      response: '250 OK'
    });
    mockVerify.mockResolvedValue(true);
    
    // Mock transporter for tests
    emailService.transporter = {
      sendMail: mockSendMail,
      verify: mockVerify
    };
  });

  describe('enviarInformacionPago', () => {
    it('should send payment information email successfully', async () => {
      const memberData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        membershipType: 'jugador',
        activity: 'basketball'
      };

      const result = await emailService.enviarInformacionPago(memberData);

      expect(result).toEqual({
        success: true,
        messageId: 'test-message-id-123',
        recipient: 'juan@test.com',
        type: 'payment_info'
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: 'juan@test.com',
        subject: '🏀 Información de Pago - Jugador - Club Comandante Espora',
        html: expect.stringContaining('Juan Pérez')
      });
    });

    it('should calculate correct amount for different activities', async () => {
      const testCases = [
        { activity: 'basketball', membershipType: 'jugador', expectedAmount: 15000 },
        { activity: 'volleyball', membershipType: 'jugador', expectedAmount: 12000 },
        { activity: 'karate', membershipType: 'jugador', expectedAmount: 18000 },
        { activity: 'gym', membershipType: 'jugador', expectedAmount: 10000 },
        { membershipType: 'socio', expectedAmount: 8000 }
      ];

      for (const testCase of testCases) {
        const memberData = {
          name: 'Test Member',
          email: 'test@test.com',
          membershipType: testCase.membershipType,
          activity: testCase.activity
        };

        await emailService.enviarInformacionPago(memberData);

        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(`$${testCase.expectedAmount.toLocaleString('es-AR')}`)
          })
        );

        mockSendMail.mockClear();
      }
    });

    it('should handle transporter not configured', async () => {
      // Mock transporter as null
      emailService.transporter = null;

      const memberData = {
        name: 'Test',
        email: 'test@test.com',
        membershipType: 'socio'
      };

      await expect(emailService.enviarInformacionPago(memberData))
        .rejects.toThrow('Email service not configured');
    });
  });

  describe('enviarRecordatorioPago', () => {
    it('should send payment reminder for pending payment', async () => {
      const socio = {
        getNombreCompleto: () => 'Juan Pérez',
        email: 'juan@test.com',
        actividad: 'basketball'
      };

      const cuota = {
        periodo: '2024-01',
        monto: 15000,
        fechaVencimiento: '2024-02-01',
        estado: 'pendiente',
        estaVencida: () => false,
        diasVencimiento: () => 5
      };

      const result = await emailService.enviarRecordatorioPago(socio, cuota);

      expect(result).toEqual({
        success: true,
        messageId: 'test-message-id-123',
        recipient: 'juan@test.com',
        type: 'payment_reminder'
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: 'juan@test.com',
        subject: '🔔 Recordatorio de Pago - Cuota 2024-01 - Club Comandante Espora',
        html: expect.stringContaining('Juan Pérez')
      });
    });

    it('should send overdue payment reminder', async () => {
      const socio = {
        getNombreCompleto: () => 'María García',
        email: 'maria@test.com',
        actividad: 'volleyball'
      };

      const cuota = {
        periodo: '2024-01',
        monto: 12000,
        fechaVencimiento: '2024-01-15',
        estado: 'vencido',
        estaVencida: () => true,
        diasVencimiento: () => 10
      };

      const result = await emailService.enviarRecordatorioPago(socio, cuota);

      expect(result.type).toBe('overdue_reminder');
      
      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: 'maria@test.com',
        subject: '⚠️ Recordatorio de Pago - Cuota 2024-01 - Club Comandante Espora',
        html: expect.stringContaining('vencida desde hace 10 días')
      });
    });
  });

  describe('enviarConfirmacionPago', () => {
    it('should send payment confirmation email', async () => {
      const socio = {
        getNombreCompleto: () => 'Carlos López',
        email: 'carlos@test.com',
        actividad: 'karate'
      };

      const cuota = {
        periodo: '2024-01',
        monto: 18000,
        metodoPago: 'mercadopago',
        numeroRecibo: 'REC-001'
      };

      const datosPago = {
        paymentId: 'mp-payment-123',
        status: 'approved'
      };

      const result = await emailService.enviarConfirmacionPago(socio, cuota, datosPago);

      expect(result).toEqual({
        success: true,
        messageId: 'test-message-id-123',
        recipient: 'carlos@test.com',
        type: 'payment_confirmation'
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: 'carlos@test.com',
        subject: '✅ Pago Confirmado - Cuota 2024-01 - Club Comandante Espora',
        html: expect.stringContaining('Carlos López')
      });
    });
  });

  describe('enviarEmailLinkPago', () => {
    it('should send payment link email', async () => {
      const socio = {
        getNombreCompleto: () => 'Ana Martínez',
        email: 'ana@test.com',
        actividad: 'gym'
      };

      const cuota = {
        periodo: '2024-01',
        monto: 10000,
        fechaVencimiento: '2024-02-01'
      };

      const linkPago = 'https://mercadopago.com/checkout/test-link';

      const result = await emailService.enviarEmailLinkPago(socio, cuota, linkPago);

      expect(result).toEqual({
        success: true,
        messageId: 'test-message-id-123',
        recipient: 'ana@test.com'
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: 'ana@test.com',
        subject: '🏀 Link de Pago - Cuota 2024-01 - Club Comandante Espora',
        html: expect.stringContaining(linkPago)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle email sending errors', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const memberData = {
        name: 'Test',
        email: 'test@test.com',
        membershipType: 'socio'
      };

      await expect(emailService.enviarInformacionPago(memberData))
        .rejects.toThrow('SMTP connection failed');
    });

    it('should handle invalid email addresses', async () => {
      mockSendMail.mockRejectedValue(new Error('Invalid email address'));

      const memberData = {
        name: 'Test',
        email: 'invalid-email',
        membershipType: 'socio'
      };

      await expect(emailService.enviarInformacionPago(memberData))
        .rejects.toThrow('Invalid email address');
    });
  });

  describe('Email Template Content', () => {
    it('should include all required elements in payment info email', async () => {
      const memberData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        membershipType: 'jugador',
        activity: 'basketball'
      };

      await emailService.enviarInformacionPago(memberData);

      const emailHtml = mockSendMail.mock.calls[0][0].html;

      // Check for essential elements
      expect(emailHtml).toContain('Club Comandante Espora');
      expect(emailHtml).toContain('Juan Pérez');
      expect(emailHtml).toContain('Jugador');
      expect(emailHtml).toContain('Básquet');
      expect(emailHtml).toContain('$15.000'); // Basketball fee
      expect(emailHtml).toContain('Transferencia Bancaria');
      expect(emailHtml).toContain('MercadoPago');
      expect(emailHtml).toContain('Efectivo');
      expect(emailHtml).toContain('info@clubcomandanteespora.com');
    });

    it('should generate responsive HTML templates', async () => {
      const memberData = {
        name: 'Test',
        email: 'test@test.com',
        membershipType: 'socio'
      };

      await emailService.enviarInformacionPago(memberData);

      const emailHtml = mockSendMail.mock.calls[0][0].html;

      // Check for responsive design elements
      expect(emailHtml).toContain('DOCTYPE html');
      expect(emailHtml).toContain('max-width: 600px');
      expect(emailHtml).toContain('font-family: Arial');
      expect(emailHtml).toContain('margin: 0 auto');
    });
  });
});