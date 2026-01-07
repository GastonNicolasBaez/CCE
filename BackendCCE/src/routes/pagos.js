const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { validate, schemas } = require('../middleware/validation');
const { paymentLimiter, webhookLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenantResolver');

/**
 * Payment routes with multi-tenant support
 *
 * IMPORTANT: Webhook routes (/webhook, /notifications) do NOT have authentication
 * because they come from external services (MercadoPago). All other routes require
 * tenant resolution and authentication.
 */

// PUBLIC ROUTES (no auth required)
// ================================

// POST /api/pagos/webhook - MercadoPago webhook handler
// This endpoint is called by MercadoPago servers, so no auth is required
router.post('/webhook',
  webhookLimiter,
  pagosController.confirmarPago
);

// Alternative webhook endpoint (some services expect /notifications)
router.post('/notifications',
  webhookLimiter,
  pagosController.confirmarPago
);

// PROTECTED ROUTES (require auth and tenant)
// ===========================================

// Apply tenant resolution and authentication to remaining routes
router.use(resolveTenant);
router.use(authenticate);

// GET /api/pagos - Get payment status for all socios
router.get('/',
  validate(schemas.query.pagos, 'query'),
  pagosController.obtenerEstadoPagos
);

// GET /api/pagos/estadisticas - Get payment statistics
router.get('/estadisticas', pagosController.obtenerEstadisticasPagos);

// POST /api/pagos/enviar-link - Send payment links to selected socios
router.post('/enviar-link',
  paymentLimiter,
  validate(schemas.enviarLinkPago, 'body'),
  pagosController.enviarLinkPago
);

// POST /api/pagos/programar-recordatorios - Setup/trigger payment reminders
router.post('/programar-recordatorios',
  pagosController.programarRecordatorios
);

module.exports = router;