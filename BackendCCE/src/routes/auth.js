const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { resolveTenant, optionalTenantResolver } = require('../middleware/tenantResolver');

/**
 * Auth Routes - Multi-Tenant Authentication
 *
 * Public routes:
 * - POST /api/auth/register - Register new club (no tenant needed)
 * - POST /api/auth/verify-token - Verify JWT token
 *
 * Tenant-scoped routes:
 * - POST /api/auth/login - Login within tenant context
 *
 * Protected routes:
 * - POST /api/auth/logout - Logout (requires authentication)
 * - GET /api/auth/me - Get current user info (requires authentication)
 */

// POST /api/auth/register
// Register a new club (tenant) with admin user
// Public endpoint - no tenant or authentication required
router.post('/register',
  validate(schemas.register, 'body'),
  authController.register
);

// POST /api/auth/login
// Login user within a tenant
// Requires tenant resolution (from subdomain/header/query)
router.post('/login',
  resolveTenant, // Resolve tenant first
  validate(schemas.login, 'body'),
  authController.login
);

// POST /api/auth/logout
// Logout current user
// Protected endpoint - requires authentication
router.post('/logout',
  optionalTenantResolver, // Optional tenant resolution
  authenticate,
  authController.logout
);

// GET /api/auth/me
// Get current authenticated user info with tenant
// Protected endpoint - requires authentication
router.get('/me',
  optionalTenantResolver, // Optional tenant resolution
  authenticate,
  authController.me
);

// POST /api/auth/verify-token
// Verify if a JWT token is valid
// Public endpoint for client-side validation
router.post('/verify-token',
  validate(schemas.verifyToken, 'body'),
  authController.verifyToken
);

module.exports = router;
