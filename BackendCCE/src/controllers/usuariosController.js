const { Usuario } = require('../models');
const { asyncHandler, NotFoundError, ValidationError, UnauthorizedError } = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');

const usuariosController = {
  // GET /usuarios - Get all users (admin only)
  obtenerTodos: asyncHandler(async (req, res) => {
    const usuarios = await Usuario.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] } // Don't send passwords
    });

    const usuariosData = usuarios.map(usuario => usuario.toSafeJSON());

    res.json({
      success: true,
      data: usuariosData
    });
  }),

  // GET /usuarios/:id - Get user by ID (admin only)
  obtenerPorId: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json({
      success: true,
      data: usuario.toSafeJSON()
    });
  }),

  // POST /usuarios - Create new user (admin only)
  crear: asyncHandler(async (req, res) => {
    const { email, password, nombre, apellido, rol, activo } = req.body;

    // Validate required fields
    if (!email || !password || !nombre || !apellido) {
      throw new ValidationError('Email, password, nombre y apellido son requeridos');
    }

    // Check if email already exists
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('El email ya está registrado');
    }

    // Validate password length
    if (password.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // Validate role
    if (rol && !['admin', 'staff'].includes(rol)) {
      throw new ValidationError('Rol inválido. Debe ser "admin" o "staff"');
    }

    // Create user
    const usuario = await Usuario.create({
      email,
      password, // Will be hashed by the model hook
      nombre,
      apellido,
      rol: rol || 'staff',
      activo: activo !== undefined ? activo : true
    });

    res.status(201).json({
      success: true,
      data: usuario.toSafeJSON(),
      message: 'Usuario creado exitosamente'
    });
  }),

  // PUT /usuarios/:id - Update user (admin only)
  actualizar: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, nombre, apellido, rol, activo } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Prevent updating your own role (admin protection)
    if (rol && usuario.id === req.user.id) {
      throw new ValidationError('No puedes cambiar tu propio rol');
    }

    // Check if new email already exists (if changing email)
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        throw new ValidationError('El email ya está registrado');
      }
    }

    // Validate role if provided
    if (rol && !['admin', 'staff'].includes(rol)) {
      throw new ValidationError('Rol inválido. Debe ser "admin" o "staff"');
    }

    // Update fields
    if (email) usuario.email = email;
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (rol) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;

    await usuario.save();

    res.json({
      success: true,
      data: usuario.toSafeJSON(),
      message: 'Usuario actualizado exitosamente'
    });
  }),

  // DELETE /usuarios/:id - Delete user (admin only)
  eliminar: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Prevent deleting yourself
    if (usuario.id === req.user.id) {
      throw new ValidationError('No puedes eliminar tu propia cuenta');
    }

    // Soft delete (set inactive) instead of hard delete
    usuario.activo = false;
    await usuario.save();

    // Or use hard delete if preferred:
    // await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  }),

  // PUT /usuarios/:id/toggle-active - Toggle user active status (admin only)
  toggleActivo: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Prevent deactivating yourself
    if (usuario.id === req.user.id && !activo) {
      throw new ValidationError('No puedes desactivar tu propia cuenta');
    }

    usuario.activo = activo;
    await usuario.save();

    res.json({
      success: true,
      data: usuario.toSafeJSON(),
      message: activo ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente'
    });
  })
};

module.exports = usuariosController;
