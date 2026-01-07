const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');
const config = require('../config');

/**
 * Authentication Middleware - JWT Verification
 *
 * Verifies JWT tokens and attaches user info to req.user
 * Also validates that token's tenantId matches the resolved tenant
 */

/**
 * Authenticate user via JWT token
 *
 * Usage:
 *   router.get('/protected', authenticate, (req, res) => {
 *     // req.user is available here
 *   })
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado. Por favor inicia sesión.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // 2. Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expirado. Por favor inicia sesión nuevamente.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Token inválido.');
      }
      throw error;
    }

    // 3. Verify user still exists and is active
    const user = await Usuario.findByPk(decoded.userId, {
      attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'status', 'activo', 'tenantId']
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado.');
    }

    if (!user.isActive()) {
      throw new UnauthorizedError('Usuario inactivo. Contacta al administrador.');
    }

    // 4. CRITICAL: Verify token's tenantId matches the resolved tenant
    // This prevents users from accessing other tenants' data
    if (req.tenant && user.tenantId !== req.tenant.id) {
      console.error(
        `⚠️  SECURITY: Tenant mismatch! Token tenant: ${user.tenantId}, Subdomain tenant: ${req.tenant.id}`
      );
      throw new ForbiddenError('No tienes permiso para acceder a este tenant.');
    }

    // 5. Also verify token's tenantId matches user's current tenantId
    if (decoded.tenantId !== user.tenantId) {
      throw new UnauthorizedError('Token inválido para este tenant.');
    }

    // 6. Attach user info to request
    req.user = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.rol,
      fullName: user.getNombreCompleto(),
      isAdmin: user.isAdmin()
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token, but populates req.user if valid token present
 *
 * Usage:
 *   router.get('/public-or-protected', optionalAuth, (req, res) => {
 *     if (req.user) {
 *       // User is authenticated
 *     } else {
 *       // User is not authenticated (but that's ok)
 *     }
 *   })
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token present, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      const user = await Usuario.findByPk(decoded.userId, {
        attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'status', 'activo', 'tenantId']
      });

      if (user && user.isActive()) {
        req.user = {
          userId: user.id,
          tenantId: user.tenantId,
          email: user.email,
          role: user.rol,
          fullName: user.getNombreCompleto(),
          isAdmin: user.isAdmin()
        };
      }
    } catch (error) {
      // Invalid token, but that's ok for optional auth
      console.log('Optional auth: Invalid token, continuing without user');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require admin role middleware
 * Must be used AFTER authenticate middleware
 *
 * Usage:
 *   router.delete('/admin-only', authenticate, requireAdmin, (req, res) => {
 *     // Only admins can access
 *   })
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Autenticación requerida');
  }

  if (!req.user.isAdmin) {
    throw new ForbiddenError('Acceso denegado. Se requieren permisos de administrador.');
  }

  next();
};

/**
 * Require specific role middleware
 *
 * Usage:
 *   router.post('/payments', authenticate, requireRole('admin', 'tesorero'), (req, res) => {
 *     // Only admins and tesoreros can access
 *   })
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Autenticación requerida');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireRole
};
