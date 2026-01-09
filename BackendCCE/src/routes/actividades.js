const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');
const { validate, schemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenantResolver');

/**
 * ALL actividades routes require authentication and tenant resolution
 * Middleware chain: resolveTenant → authenticate → validate → controller
 */

// Apply tenant resolution and authentication to ALL routes
router.use(resolveTenant);
router.use(authenticate);

// GET /api/actividades - Get all actividades with filtering and pagination
router.get('/',
  validate(schemas.query.actividades, 'query'),
  actividadesController.obtenerActividades
);

// GET /api/actividades/:id - Get single actividad by ID
router.get('/:id',
  validate(schemas.params.id, 'params'),
  actividadesController.obtenerActividadPorId
);

// POST /api/actividades - Create new actividad
router.post('/',
  validate(schemas.actividad, 'body'),
  actividadesController.crearActividad
);

// PUT /api/actividades/:id - Update actividad
router.put('/:id',
  validate(schemas.params.id, 'params'),
  validate(schemas.actividadUpdate, 'body'),
  actividadesController.actualizarActividad
);

// DELETE /api/actividades/:id - Delete (soft delete) actividad
router.delete('/:id',
  validate(schemas.params.id, 'params'),
  actividadesController.eliminarActividad
);

module.exports = router;
