const twilio = require('twilio');
const config = require('../config');

class SMSService {
  constructor() {
    this.client = null;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      if (!config.sms.twilio.accountSid || !config.sms.twilio.authToken) {
        console.warn('SMS service not configured - missing Twilio credentials');
        return;
      }

      this.client = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
      console.log('SMS service initialized successfully');
    } catch (error) {
      console.error('Error initializing SMS service:', error);
    }
  }

  async enviarSMSLinkPago(socio, cuota, linkPago) {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      const mensaje = `🏀 Club Comandante Espora

Hola ${socio.nombre}!
Tu link de pago está listo:

📋 Cuota: ${cuota.periodo}
💰 Monto: $${cuota.monto}
📅 Vencimiento: ${cuota.fechaVencimiento}

💳 Pagar ahora: ${linkPago}

Link válido por 30 días.
¿Consultas? WhatsApp: +54 11 1234-5678`;

      const message = await this.client.messages.create({
        body: mensaje,
        from: config.sms.twilio.phoneNumber,
        to: this.formatPhoneNumber(socio.telefono)
      });

      return {
        success: true,
        sid: message.sid,
        recipient: socio.telefono,
        status: message.status
      };
    } catch (error) {
      console.error('Error sending payment link SMS:', error);
      throw error;
    }
  }

  async enviarSMSRecordatorio(socio, cuota) {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      const diasVencimiento = cuota.diasVencimiento();
      const isVencida = cuota.estaVencida();

      const mensaje = isVencida 
        ? `🏀 Club Comandante Espora

⚠️ CUOTA VENCIDA
Hola ${socio.nombre}!

Tu cuota está vencida desde hace ${diasVencimiento} días.

📋 Período: ${cuota.periodo}
💰 Monto: $${cuota.monto}
📅 Vencía: ${cuota.fechaVencimiento}

Por favor regulariza tu situación.
Contactanos: +54 11 1234-5678`
        : `🏀 Club Comandante Espora

🔔 RECORDATORIO DE PAGO
Hola ${socio.nombre}!

📋 Cuota: ${cuota.periodo}
💰 Monto: $${cuota.monto}
📅 Vencimiento: ${cuota.fechaVencimiento}

Evita recargos. Paga antes del vencimiento.
Consultas: +54 11 1234-5678`;

      const message = await this.client.messages.create({
        body: mensaje,
        from: config.sms.twilio.phoneNumber,
        to: this.formatPhoneNumber(socio.telefono)
      });

      return {
        success: true,
        sid: message.sid,
        recipient: socio.telefono,
        status: message.status,
        type: isVencida ? 'overdue_reminder' : 'payment_reminder'
      };
    } catch (error) {
      console.error('Error sending payment reminder SMS:', error);
      throw error;
    }
  }

  async enviarSMSConfirmacionPago(socio, cuota) {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      const mensaje = `🏀 Club Comandante Espora

✅ PAGO CONFIRMADO
¡Gracias ${socio.nombre}!

Tu pago fue procesado exitosamente:

📋 Cuota: ${cuota.periodo}
💰 Monto: $${cuota.monto}
📅 Pagado: ${new Date().toLocaleDateString('es-AR')}
${cuota.numeroRecibo ? `📄 Recibo: ${cuota.numeroRecibo}` : ''}

¡Gracias por estar al día!`;

      const message = await this.client.messages.create({
        body: mensaje,
        from: config.sms.twilio.phoneNumber,
        to: this.formatPhoneNumber(socio.telefono)
      });

      return {
        success: true,
        sid: message.sid,
        recipient: socio.telefono,
        status: message.status,
        type: 'payment_confirmation'
      };
    } catch (error) {
      console.error('Error sending payment confirmation SMS:', error);
      throw error;
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/[^\d]/g, '');
    
    // If it starts with 54 (Argentina country code), keep as is
    if (cleanPhone.startsWith('54')) {
      return `+${cleanPhone}`;
    }
    
    // If it starts with 9 (mobile indicator), add Argentina country code
    if (cleanPhone.startsWith('9')) {
      return `+54${cleanPhone}`;
    }
    
    // If it's a local number (11 digits), add country code and mobile indicator
    if (cleanPhone.length === 10) {
      return `+549${cleanPhone}`;
    }
    
    // If it's a local number with area code (10 digits), add country code
    if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
      return `+549${cleanPhone}`;
    }
    
    // Default: assume it needs full Argentina formatting
    return `+549${cleanPhone}`;
  }

  async verificarEstadoSMS(sid) {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      const message = await this.client.messages(sid).fetch();
      
      return {
        sid: message.sid,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('Error checking SMS status:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();