const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      if (!config.email.auth.user || !config.email.auth.pass) {
        console.warn('Email service not configured - missing credentials');
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: config.email.service,
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: config.email.auth,
        tls: {
          // Only disable TLS validation if explicitly set in environment
          // For self-signed certificates, set EMAIL_TLS_REJECT_UNAUTHORIZED=false
          rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error);
        } else {
          console.log('Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('Error initializing email service:', error);
    }
  }

  async enviarEmailLinkPago(socio, cuota, linkPago) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002C6F, #FFA500); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #FFA500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Club Comandante Espora</h1>
              <p>Sistema de Pagos Online</p>
            </div>
            <div class="content">
              <h2>Hola ${socio.getNombreCompleto()},</h2>
              <p>Te enviamos el link para abonar tu cuota de forma rápida y segura a través de MercadoPago.</p>
              
              <div class="details">
                <h3>📋 Detalle de la Cuota</h3>
                <p><strong>Período:</strong> ${cuota.periodo}</p>
                <p><strong>Actividad:</strong> ${socio.actividad}</p>
                <p><strong>Monto:</strong> $${cuota.monto}</p>
                <p><strong>Vencimiento:</strong> ${cuota.fechaVencimiento}</p>
              </div>

              <div style="text-align: center;">
                <a href="${linkPago}" class="button">💳 Pagar Ahora</a>
              </div>

              <p><small>⚠️ Este link tiene una validez de 30 días. Métodos de pago disponibles: tarjetas de débito/crédito, transferencia bancaria, efectivo en puntos de pago.</small></p>
              
              <hr style="margin: 30px 0; border: 1px solid #ddd;">
              
              <h3>📞 ¿Necesitas ayuda?</h3>
              <p>Si tienes alguna consulta, no dudes en contactarnos:</p>
              <p>📧 Email: info@clubcomandanteespora.com</p>
              <p>📱 WhatsApp: +54 11 1234-5678</p>
            </div>
            <div class="footer">
              <p>Club Comandante Espora - Sistema de Gestión</p>
              <p>Este es un email automático, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: config.email.from,
        to: socio.email,
        subject: `🏀 Link de Pago - Cuota ${cuota.periodo} - Club Comandante Espora`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: socio.email
      };
    } catch (error) {
      console.error('Error sending payment link email:', error);
      throw error;
    }
  }

  async enviarRecordatorioPago(socio, cuota) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const diasVencimiento = cuota.diasVencimiento();
      const isVencida = cuota.estaVencida();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isVencida ? '#dc3545' : '#ffc107'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert { background: ${isVencida ? '#f8d7da' : '#fff3cd'}; border: 1px solid ${isVencida ? '#f5c6cb' : '#ffeeba'}; color: ${isVencida ? '#721c24' : '#856404'}; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Club Comandante Espora</h1>
              <p>${isVencida ? '⚠️ Recordatorio de Pago Vencido' : '🔔 Recordatorio de Pago'}</p>
            </div>
            <div class="content">
              <h2>Hola ${socio.getNombreCompleto()},</h2>
              
              <div class="alert">
                ${isVencida 
                  ? `<strong>Tu cuota está vencida desde hace ${diasVencimiento} días.</strong> Te pedimos que regularices tu situación lo antes posible.`
                  : '<strong>Tu cuota está próxima a vencer.</strong> Te recordamos que puedes abonarla para evitar recargos.'
                }
              </div>
              
              <div class="details">
                <h3>📋 Detalle de la Cuota</h3>
                <p><strong>Período:</strong> ${cuota.periodo}</p>
                <p><strong>Actividad:</strong> ${socio.actividad}</p>
                <p><strong>Monto:</strong> $${cuota.monto}</p>
                <p><strong>Vencimiento:</strong> ${cuota.fechaVencimiento}</p>
                <p><strong>Estado:</strong> <span style="color: ${isVencida ? '#dc3545' : '#ffc107'};">${cuota.estado}</span></p>
              </div>

              <h3>💰 Formas de Pago</h3>
              <ul>
                <li>💳 Online con MercadoPago (solicita tu link de pago)</li>
                <li>🏛️ Transferencia bancaria</li>
                <li>💵 Efectivo en la sede del club</li>
              </ul>
              
              <hr style="margin: 30px 0; border: 1px solid #ddd;">
              
              <h3>📞 Contactanos</h3>
              <p>Para solicitar tu link de pago o cualquier consulta:</p>
              <p>📧 Email: info@clubcomandanteespora.com</p>
              <p>📱 WhatsApp: +54 11 1234-5678</p>
              <p>🏠 Sede: Dirección del Club, Ciudad</p>
            </div>
            <div class="footer">
              <p>Club Comandante Espora - Sistema de Gestión</p>
              <p>Este es un email automático, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: config.email.from,
        to: socio.email,
        subject: `${isVencida ? '⚠️' : '🔔'} Recordatorio de Pago - Cuota ${cuota.periodo} - Club Comandante Espora`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: socio.email,
        type: isVencida ? 'overdue_reminder' : 'payment_reminder'
      };
    } catch (error) {
      console.error('Error sending payment reminder email:', error);
      throw error;
    }
  }

  async enviarConfirmacionPago(socio, cuota, datosPago) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Club Comandante Espora</h1>
              <p>✅ Pago Confirmado</p>
            </div>
            <div class="content">
              <h2>¡Gracias ${socio.getNombreCompleto()}!</h2>
              
              <div class="success">
                <h3>✅ Tu pago ha sido procesado exitosamente</h3>
                <p>Tu cuota ya está registrada como pagada en nuestro sistema.</p>
              </div>
              
              <div class="details">
                <h3>📋 Detalle del Pago</h3>
                <p><strong>Cuota:</strong> ${cuota.periodo}</p>
                <p><strong>Actividad:</strong> ${socio.actividad}</p>
                <p><strong>Monto:</strong> $${cuota.monto}</p>
                <p><strong>Fecha de Pago:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
                <p><strong>Método:</strong> ${cuota.metodoPago}</p>
                ${cuota.numeroRecibo ? `<p><strong>Nº Recibo:</strong> ${cuota.numeroRecibo}</p>` : ''}
              </div>

              <p>🎉 ¡Gracias por mantenerte al día con tus pagos! Tu compromiso nos ayuda a seguir brindando el mejor servicio.</p>
              
              <hr style="margin: 30px 0; border: 1px solid #ddd;">
              
              <h3>📞 ¿Necesitas el comprobante físico?</h3>
              <p>Puedes solicitar tu comprobante impreso en la sede del club:</p>
              <p>🏠 Dirección del Club, Ciudad</p>
              <p>📧 Email: info@clubcomandanteespora.com</p>
            </div>
            <div class="footer">
              <p>Club Comandante Espora - Sistema de Gestión</p>
              <p>Este es un email automático, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: config.email.from,
        to: socio.email,
        subject: `✅ Pago Confirmado - Cuota ${cuota.periodo} - Club Comandante Espora`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: socio.email,
        type: 'payment_confirmation'
      };
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  async enviarInformacionPago(memberData) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const tipoMembership = memberData.membershipType === 'socio' ? 'Socio' : 'Jugador';
      const actividad = memberData.activity ? 
        (memberData.activity === 'basketball' ? 'Básquet' :
         memberData.activity === 'volleyball' ? 'Vóley' :
         memberData.activity === 'karate' ? 'Karate' : 'Gimnasio') : '';

      const montoBase = {
        'socio': 8000,
        'basketball': 15000,
        'volleyball': 12000,
        'karate': 18000,
        'gym': 10000
      };

      const monto = memberData.membershipType === 'socio' ? 
        montoBase['socio'] : 
        montoBase[memberData.activity] || 12000;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002C6F, #FFA500); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .welcome { background: #e3f2fd; border: 1px solid #bbdefb; color: #1976d2; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .payment-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA500; }
            .method { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #dee2e6; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Club Comandante Espora</h1>
              <p>¡Bienvenido a nuestra comunidad deportiva!</p>
            </div>
            <div class="content">
              <h2>¡Hola ${memberData.name}!</h2>
              
              <div class="welcome">
                <h3>✅ Tu inscripción ha sido registrada exitosamente</h3>
                <p>Ya formas parte del Club Comandante Espora como <strong>${tipoMembership}</strong>${actividad ? ` en ${actividad}` : ''}.</p>
              </div>
              
              <div class="payment-info">
                <h3>💳 Información para completar tu pago</h3>
                <p><strong>Monto a pagar:</strong> $${monto.toLocaleString('es-AR')}</p>
                <p><strong>Concepto:</strong> Cuota mensual - ${tipoMembership}${actividad ? ` (${actividad})` : ''}</p>
              </div>

              <h3>💰 Métodos de Pago Disponibles:</h3>
              
              <div class="method">
                <h4>🏛️ Transferencia Bancaria</h4>
                <p><strong>Banco:</strong> Banco Nación</p>
                <p><strong>CBU:</strong> 0110593930000932817295</p>
                <p><strong>Alias:</strong> CLUB.ESPORA.CCE</p>
                <p><strong>Titular:</strong> Club Comandante Espora</p>
                <p><strong>CUIT:</strong> 30-12345678-9</p>
              </div>

              <div class="method">
                <h4>📱 MercadoPago</h4>
                <p>Escaneá el código QR o ingresá a:</p>
                <p><strong>Alias:</strong> club.comandante.espora</p>
                <p><strong>Link directo:</strong> <a href="https://mercadopago.com.ar/checkout/v1/redirect?pref_id=ejemplo">Pagar con MercadoPago</a></p>
              </div>

              <div class="method">
                <h4>💵 Efectivo</h4>
                <p><strong>Sede del Club:</strong></p>
                <p>📍 Av. Comandante Espora 1234, Villa Ejemplo</p>
                <p>🕐 <strong>Horarios de atención:</strong></p>
                <p>Lunes a Viernes: 9:00 - 13:00 y 17:00 - 21:00</p>
                <p>Sábados: 9:00 - 13:00</p>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📝 Importante:</strong> Una vez realizado el pago, envía el comprobante por WhatsApp al +54 11 1234-5678 o por email para activar tu membresía inmediatamente.</p>
              </div>
              
              <hr style="margin: 30px 0; border: 1px solid #ddd;">
              
              <h3>📞 ¿Necesitas ayuda?</h3>
              <p>Estamos aquí para ayudarte:</p>
              <p>📧 <strong>Email:</strong> info@clubcomandanteespora.com</p>
              <p>📱 <strong>WhatsApp:</strong> +54 11 1234-5678</p>
              <p>🏠 <strong>Sede:</strong> Av. Comandante Espora 1234</p>
            </div>
            <div class="footer">
              <p>Club Comandante Espora - Sistema de Gestión</p>
              <p>¡Gracias por elegirnos para tu actividad deportiva!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: config.email.from,
        to: memberData.email,
        subject: `🏀 Información de Pago - ${tipoMembership} - Club Comandante Espora`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: memberData.email,
        type: 'payment_info'
      };
    } catch (error) {
      console.error('Error sending payment info email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();