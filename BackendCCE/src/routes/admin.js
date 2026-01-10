const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenantsController');
const { authenticate } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/permissions');

/**
 * Admin Routes - Super Admin Only
 *
 * ALL routes in this file require:
 * 1. Authentication (valid JWT token)
 * 2. Super Admin role (rol = 'super_admin')
 *
 * Base path: /api/admin
 */

// Apply authentication and super admin requirement to ALL routes
router.use(authenticate);
router.use(requireSuperAdmin);

// ==========================================
// Global Statistics
// ==========================================

// GET /api/admin/stats - Get global system statistics
router.get('/stats', tenantsController.obtenerEstadisticasGlobales);

// ==========================================
// Tenants Management
// ==========================================

// GET /api/admin/tenants - Get all tenants with pagination and filters
router.get('/tenants', tenantsController.obtenerTenants);

// GET /api/admin/tenants/:id - Get specific tenant details
router.get('/tenants/:id', tenantsController.obtenerTenantPorId);

// POST /api/admin/tenants - Create new tenant
router.post('/tenants', tenantsController.crearTenant);

// PUT /api/admin/tenants/:id - Update tenant
router.put('/tenants/:id', tenantsController.actualizarTenant);

// PATCH /api/admin/tenants/:id/status - Change tenant status
router.patch('/tenants/:id/status', tenantsController.cambiarStatusTenant);

// GET /api/admin/tenants/:id/users - Get all users of a tenant
router.get('/tenants/:id/users', tenantsController.obtenerUsuariosTenant);

module.exports = router;
