const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { validate, schemas } = require('../middleware/validation');
const { paymentLimiter, webhookLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/',
  requireAuth,
  validate(schemas.query.pagos, 'query'),
  pagosController.obtenerEstadoPagos
);

router.get('/estadisticas',
  requireAuth,
  pagosController.obtenerEstadisticasPagos
);

router.post('/enviar-link',
  requireAuth,
  paymentLimiter,
  validate(schemas.enviarLinkPago, 'body'),
  pagosController.enviarLinkPago
);

router.post('/programar-recordatorios',
  requireAuth,
  pagosController.programarRecordatorios
);

// Public routes (webhooks - no authentication required)
// These are called by MercadoPago service
router.post('/webhook',
  webhookLimiter,
  pagosController.confirmarPago
);

router.post('/notifications',
  webhookLimiter,
  pagosController.confirmarPago
);

module.exports = router;