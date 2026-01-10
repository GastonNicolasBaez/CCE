/**
 * Middleware de Permisos y Roles
 *
 * Proporciona middlewares para controlar el acceso basado en roles de usuario:
 * - super_admin: Acceso global a todos los tenants
 * - admin: Administrador del club (acceso completo a su tenant)
 * - operador: Staff del club (acceso limitado a su tenant)
 */

/**
 * Middleware para requerir roles específicos
 *
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/config', authenticate, requireRole('admin'), getConfig)
 * router.get('/socios', authenticate, requireRole(['admin', 'operador']), getSocios)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado. Por favor inicia sesión.'
        });
      }

      // Convertir a array si es un string
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Super admin tiene acceso a todo
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Verificar si el usuario tiene uno de los roles permitidos
      if (!rolesArray.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso.',
          requiredRoles: rolesArray,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para requerir permiso específico
 *
 * @param {string} permission - Nombre del permiso requerido
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/config', authenticate, requirePermission('configuracion'), getConfig)
 * router.get('/reportes', authenticate, requirePermission('reportes'), getReportes)
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado. Por favor inicia sesión.'
        });
      }

      // Verificar si el usuario tiene el permiso
      if (!req.user.hasPermission || !req.user.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: `No tienes permisos para acceder a ${permission}.`,
          requiredPermission: permission,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware requirePermission:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware solo para super admin
 *
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin/tenants', authenticate, requireSuperAdmin, getTenants)
 */
const requireSuperAdmin = (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Por favor inicia sesión.'
      });
    }

    // Verificar que sea super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo super administradores pueden acceder a este recurso.',
        userRole: req.user.role
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware requireSuperAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

/**
 * Middleware solo para admin (incluye super_admin)
 *
 * @returns {Function} Express middleware
 *
 * @example
 * router.put('/config', authenticate, requireAdmin, updateConfig)
 */
const requireAdmin = (req, res, next) => {
  return requireRole(['super_admin', 'admin'])(req, res, next);
};

/**
 * Middleware que permite admin y operador
 *
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/socios', authenticate, requireStaff, getSocios)
 */
const requireStaff = (req, res, next) => {
  return requireRole(['super_admin', 'admin', 'operador'])(req, res, next);
};

/**
 * Middleware para verificar que el usuario pertenece al mismo tenant del recurso
 * Solo se aplica si el usuario NO es super_admin
 *
 * @param {string} tenantIdField - Campo del req que contiene el tenantId del recurso
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/socios/:id', authenticate, verifySameTenant('tenantId'), getSocio)
 */
const verifySameTenant = (tenantIdField = 'tenantId') => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado. Por favor inicia sesión.'
        });
      }

      // Super admin puede acceder a cualquier tenant
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Obtener tenant ID del recurso
      const resourceTenantId = req[tenantIdField] || req.params[tenantIdField] || req.body[tenantIdField];

      // Verificar que el usuario pertenece al mismo tenant
      if (req.user.tenantId !== resourceTenantId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a recursos de otro club.'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware verifySameTenant:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos de tenant'
      });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireAdmin,
  requireStaff,
  verifySameTenant
};
