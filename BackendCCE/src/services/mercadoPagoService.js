const { MercadoPagoConfig, Preference } = require('mercadopago');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class MercadoPagoService {
  constructor() {
    if (!config.mercadoPago.accessToken) {
      console.warn('MercadoPago access token not configured');
      this.client = null;
      return;
    }

    this.client = new MercadoPagoConfig({
      accessToken: config.mercadoPago.accessToken,
    });
    
    this.preference = new Preference(this.client);
  }

  async crearLinkPago(cuota, socio) {
    try {
      if (!config.mercadoPago.accessToken) {
        throw new Error('MercadoPago not configured');
      }

      const preference = {
        items: [{
          title: `Cuota ${cuota.periodo} - ${socio.getNombreCompleto()}`,
          description: `Cuota mensual - Actividad: ${socio.actividad}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: parseFloat(cuota.monto)
        }],
        payer: {
          name: socio.nombre,
          surname: socio.apellido,
          email: socio.email,
          phone: {
            number: socio.telefono.replace(/[^\d]/g, '')
          }
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        back_urls: {
          success: `${config.mercadoPago.successUrl}?cuota_id=${cuota.id}`,
          failure: `${config.mercadoPago.failureUrl}?cuota_id=${cuota.id}`,
          pending: `${config.mercadoPago.pendingUrl}?cuota_id=${cuota.id}`
        },
        auto_return: 'approved',
        external_reference: `CCE-${cuota.id}-${Date.now()}`,
        notification_url: `${config.server.frontendUrl.replace('3000', '3001')}/api/pagos/webhook`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      if (!this.preference) {
        throw new Error('MercadoPago not initialized');
      }

      const response = await this.preference.create({ body: preference });
      
      if (response && response.init_point) {
        return {
          id: response.id,
          init_point: response.init_point,
          sandbox_init_point: response.sandbox_init_point
        };
      }
      
      throw new Error('Error creating MercadoPago preference');
    } catch (error) {
      console.error('Error creating MercadoPago link:', error);
      throw error;
    }
  }

  async verificarPago(paymentId) {
    try {
      if (!config.mercadoPago.accessToken) {
        throw new Error('MercadoPago not configured');
      }

      const payment = await mercadopago.payment.findById(paymentId);
      
      return {
        id: payment.body.id,
        status: payment.body.status,
        status_detail: payment.body.status_detail,
        transaction_amount: payment.body.transaction_amount,
        external_reference: payment.body.external_reference,
        payer: payment.body.payer,
        payment_method_id: payment.body.payment_method_id,
        date_created: payment.body.date_created,
        date_approved: payment.body.date_approved
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async procesarWebhook(data) {
    try {
      if (!data.type || !data.data) {
        throw new Error('Invalid webhook data');
      }

      if (data.type === 'payment') {
        const paymentInfo = await this.verificarPago(data.data.id);
        
        return {
          type: 'payment',
          payment: paymentInfo,
          isApproved: paymentInfo.status === 'approved',
          isPending: paymentInfo.status === 'pending',
          isRejected: paymentInfo.status === 'rejected'
        };
      }

      return { type: data.type, processed: false };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  generarIdempotencyKey() {
    return uuidv4();
  }
}

module.exports = new MercadoPagoService();