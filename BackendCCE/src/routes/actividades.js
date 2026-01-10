const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');
const { validate, schemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenantResolver');
const { requireStaff, requireAdmin } = require('../middleware/permissions');

/**
 * ALL actividades routes require authentication and tenant resolution
 * Middleware chain: resolveTenant → authenticate → permissions → validate → controller
 *
 * Permissions:
 * - GET routes: Admin and Operador (requireStaff)
 * - POST/PUT/DELETE routes: Only Admin (requireAdmin)
 */

// Apply tenant resolution and authentication to ALL routes
router.use(resolveTenant);
router.use(authenticate);

// GET /api/actividades - Get all actividades with filtering and pagination
// Permission: Staff (admin and operador can view)
router.get('/',
  requireStaff,
  validate(schemas.query.actividades, 'query'),
  actividadesController.obtenerActividades
);

// GET /api/actividades/:id - Get single actividad by ID
// Permission: Staff (admin and operador can view)
router.get('/:id',
  requireStaff,
  validate(schemas.params.id, 'params'),
  actividadesController.obtenerActividadPorId
);

// POST /api/actividades - Create new actividad
// Permission: Only admin
router.post('/',
  requireAdmin,
  validate(schemas.actividad, 'body'),
  actividadesController.crearActividad
);

// PUT /api/actividades/:id - Update actividad
// Permission: Only admin
router.put('/:id',
  requireAdmin,
  validate(schemas.params.id, 'params'),
  validate(schemas.actividadUpdate, 'body'),
  actividadesController.actualizarActividad
);

// DELETE /api/actividades/:id - Delete (soft delete) actividad
// Permission: Only admin
router.delete('/:id',
  requireAdmin,
  validate(schemas.params.id, 'params'),
  actividadesController.eliminarActividad
);

module.exports = router;
