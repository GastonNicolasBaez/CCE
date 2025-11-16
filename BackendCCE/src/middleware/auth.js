const jwt = require('jsonwebtoken');
const config = require('../config');
const { Usuario } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');

/**
 * Middleware to verify JWT token and authenticate user
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Please login.');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired. Please login again.');
      }
      throw new UnauthorizedError('Invalid token. Please login again.');
    }

    // Get user from database
    const usuario = await Usuario.findByPk(decoded.userId);

    if (!usuario) {
      throw new UnauthorizedError('User not found. Please login again.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedError('User account is deactivated. Contact administrator.');
    }

    // Attach user to request object
    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      nombreCompleto: usuario.getNombreCompleto()
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.rol)) {
      return next(new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`));
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Optional authentication - adds user to request if token is valid
 * but doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const usuario = await Usuario.findByPk(decoded.userId);

    if (usuario && usuario.activo) {
      req.user = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        nombreCompleto: usuario.getNombreCompleto()
      };
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
  }

  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  optionalAuth
};
