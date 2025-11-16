const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const Joi = require('joi');

// Define auth-specific validation schemas
const authSchemas = {
  register: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(6).max(255).required(),
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
    newPassword: Joi.string().min(6).max(255).required()
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
