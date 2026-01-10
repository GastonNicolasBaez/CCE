const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenantResolver');
const { requireStaff } = require('../middleware/permissions');

/**
 * Search routes with multi-tenant support
 *
 * All routes require authentication, tenant resolution, and staff permissions
 * Middleware chain: resolveTenant → authenticate → requireStaff → controller
 */

// Apply tenant resolution, authentication, and permissions to ALL routes
router.use(resolveTenant);
router.use(authenticate);
router.use(requireStaff); // Only admin and operador can search

// GET /api/search?q=term - Global search across socios and cuotas
router.get('/', searchController.busquedaGlobal);

module.exports = router;
