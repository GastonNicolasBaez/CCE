const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const config = require('../config');
const { asyncHandler, UnauthorizedError, ValidationError, ConflictError } = require('../middleware/errorHandler');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate refresh token for user
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: '7d' } // Refresh tokens last 7 days
  );
};

const authController = {
  /**
   * POST /api/auth/register - Register new user (admin only in production)
   */
  register: asyncHandler(async (req, res) => {
    const { nombre, apellido, email, password, rol } = req.body;

    // Check if user already exists
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Only allow admin creation by existing admins
    // For first admin, check if any users exist
    const userCount = await Usuario.count();
    const assignedRole = userCount === 0 ? 'admin' : (rol || 'staff');

    // If not first user and trying to create admin, must be authenticated admin
    if (userCount > 0 && assignedRole === 'admin') {
      if (!req.user || req.user.rol !== 'admin') {
        throw new UnauthorizedError('Only administrators can create admin users');
      }
    }

    // Create user
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password, // Will be hashed by model hook
      rol: assignedRole,
      activo: true
    });

    // Generate tokens
    const token = generateToken(usuario.id);
    const refreshToken = generateRefreshToken(usuario.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: usuario.toSafeJSON(),
        token,
        refreshToken
      }
    });
  }),

  /**
   * POST /api/auth/login - Login user
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!usuario.activo) {
      throw new UnauthorizedError('Account is deactivated. Contact administrator.');
    }

    // Verify password
    const isValidPassword = await usuario.verificarPassword(password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(usuario.id);
    const refreshToken = generateRefreshToken(usuario.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: usuario.toSafeJSON(),
        token,
        refreshToken
      }
    });
  }),

  /**
   * POST /api/auth/refresh - Refresh access token
   */
  refresh: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Get user
    const usuario = await Usuario.findByPk(decoded.userId);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Generate new tokens
    const newToken = generateToken(usuario.id);
    const newRefreshToken = generateRefreshToken(usuario.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  }),

  /**
   * GET /api/auth/me - Get current user profile
   */
  getProfile: asyncHandler(async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);

    if (!usuario) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: usuario.toSafeJSON()
    });
  }),

  /**
   * PUT /api/auth/profile - Update current user profile
   */
  updateProfile: asyncHandler(async (req, res) => {
    const { nombre, apellido, email } = req.body;

    const usuario = await Usuario.findByPk(req.user.id);

    if (!usuario) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update user
    await usuario.update({
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: usuario.toSafeJSON()
    });
  }),

  /**
   * PUT /api/auth/change-password - Change user password
   */
  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    const usuario = await Usuario.findByPk(req.user.id);

    if (!usuario) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await usuario.verificarPassword(currentPassword);

    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password (will be hashed by model hook)
    await usuario.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  }),

  /**
   * POST /api/auth/logout - Logout user
   * Note: With JWT, logout is handled client-side by removing the token
   * This endpoint is optional and can be used for logging purposes
   */
  logout: asyncHandler(async (req, res) => {
    // In a more complex system, you might:
    // - Add the token to a blacklist
    // - Clear session data
    // - Log the logout event

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
};

module.exports = authController;
