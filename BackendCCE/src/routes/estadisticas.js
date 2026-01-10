const express = require('express');
const router = express.Router();
const { authenticate, requireStaff } = require('../middleware/auth');
const estadisticasController = require('../controllers/estadisticasController');

/**
 * Estadisticas Routes - Tenant Statistics
 *
 * All routes are protected with:
 * - authenticate: Verify JWT token
 * - requireStaff: Only admin and operador can access
 */

router.use(authenticate);
router.use(requireStaff);

/**
 * GET /api/estadisticas/dashboard
 * Get general statistics for tenant dashboard
 */
router.get('/dashboard', estadisticasController.obtenerEstadisticasDashboard);

/**
 * GET /api/estadisticas/actividades
 * Get statistics grouped by activity
 */
router.get('/actividades', estadisticasController.obtenerEstadisticasPorActividad);

/**
 * GET /api/estadisticas/crecimiento
 * Get growth statistics (last 6 months)
 */
router.get('/crecimiento', estadisticasController.obtenerCrecimiento);

/**
 * GET /api/estadisticas/cuotas
 * Get detailed payment statistics
 */
router.get('/cuotas', estadisticasController.obtenerEstadisticasCuotas);

module.exports = router;
