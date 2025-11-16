const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/usuarios - Get all users
router.get('/', usuariosController.obtenerTodos);

// GET /api/usuarios/:id - Get user by ID
router.get('/:id', usuariosController.obtenerPorId);

// POST /api/usuarios - Create new user
router.post('/', usuariosController.crear);

// PUT /api/usuarios/:id - Update user
router.put('/:id', usuariosController.actualizar);

// DELETE /api/usuarios/:id - Delete user
router.delete('/:id', usuariosController.eliminar);

// PUT /api/usuarios/:id/toggle-active - Toggle user active status
router.put('/:id/toggle-active', usuariosController.toggleActivo);

module.exports = router;
