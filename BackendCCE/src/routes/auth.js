const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const Joi = require('joi');

// Custom password validator for strong passwords
const strongPasswordValidator = (value, helpers) => {
  // Minimum 12 characters
  if (value.length < 12) {
    return helpers.error('password.minLength');
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(value)) {
    return helpers.error('password.uppercase');
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(value)) {
    return helpers.error('password.lowercase');
  }

  // Check for at least one number
  if (!/[0-9]/.test(value)) {
    return helpers.error('password.number');
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return helpers.error('password.special');
  }

  return value;
};

// Define auth-specific validation schemas
const authSchemas = {
  register: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().max(255).required().custom(strongPasswordValidator).messages({
      'password.minLength': 'Password must be at least 12 characters long',
      'password.uppercase': 'Password must contain at least one uppercase letter',
      'password.lowercase': 'Password must contain at least one lowercase letter',
      'password.number': 'Password must contain at least one number',
      'password.special': 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
    }),
    rol: Joi.string().valid('admin', 'staff').default('staff')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required()
  }),

  updateProfile: Joi.object({
    nombre: Joi.string().min(2).max(100),
    apellido: Joi.string().min(2).max(100),
    email: Joi.string().email().max(150)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().max(255).required().custom(strongPasswordValidator).messages({
      'password.minLength': 'Password must be at least 12 characters long',
      'password.uppercase': 'Password must contain at least one uppercase letter',
      'password.lowercase': 'Password must contain at least one lowercase letter',
      'password.number': 'Password must contain at least one number',
      'password.special': 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
    })
  })
};

// Public routes
router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);
router.post('/refresh', validate(authSchemas.refresh), authController.refresh);

// Protected routes (require authentication)
router.get('/me', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, validate(authSchemas.updateProfile), authController.updateProfile);
router.put('/change-password', requireAuth, validate(authSchemas.changePassword), authController.changePassword);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
