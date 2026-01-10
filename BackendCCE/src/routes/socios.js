const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/sociosController');
const { validate, schemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenantResolver');
const { requireStaff } = require('../middleware/permissions');

/**
 * ALL socios routes require authentication, tenant resolution, and staff permissions
 * Middleware chain: resolveTenant → authenticate → requireStaff → validate → controller
 *
 * Permissions: Admin and Operador can access socios routes
 */

// Apply tenant resolution, authentication, and permissions to ALL routes
router.use(resolveTenant);
router.use(authenticate);
router.use(requireStaff); // Only admin and operador can access

// GET /api/socios - Get all socios with filtering and pagination
router.get('/',
  validate(schemas.query.socios, 'query'),
  sociosController.obtenerSocios
);

// GET /api/socios/estadisticas - Get general statistics
router.get('/estadisticas', sociosController.obtenerEstadisticas);

// POST /api/socios/send-payment-email - Send payment email
// IMPORTANT: This must be BEFORE /:id routes to avoid matching 'send-payment-email' as an id
router.post('/send-payment-email',
  sociosController.enviarEmailPago
);

// GET /api/socios/:id - Get single socio by ID
router.get('/:id',
  validate(schemas.params.id, 'params'),
  sociosController.obtenerSocioPorId
);

// POST /api/socios - Create new socio
router.post('/',
  validate(schemas.socio, 'body'),
  sociosController.crearSocio
);

// PUT /api/socios/:id - Update socio
router.put('/:id',
  validate(schemas.params.id, 'params'),
  validate(schemas.socioUpdate, 'body'),
  sociosController.actualizarSocio
);

// DELETE /api/socios/:id - Delete socio
router.delete('/:id',
  validate(schemas.params.id, 'params'),
  sociosController.eliminarSocio
);

module.exports = router;