const { Actividad, Socio } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller for Actividades (Sports Activities)
 *
 * Handles CRUD operations for club activities with tenant isolation.
 * Each club can create and manage their own activities with custom pricing.
 */

/**
 * GET /api/actividades
 * Get all actividades for the current tenant
 *
 * Query params:
 * - activa: boolean (filter by active status, default: true)
 * - search: string (search by name)
 * - page: number (pagination)
 * - limit: number (pagination)
 */
exports.obtenerActividades = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      activa = 'true',
      search = '',
      page = 1,
      limit = 100,
      orderBy = 'orden',
      orderDir = 'ASC'
    } = req.query;

    // Build where clause
    const where = { tenantId };

    // Filter by active status (default: only active)
    if (activa !== 'all') {
      where.activa = activa === 'true';
    }

    // Search by name
    if (search) {
      where.nombre = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query
    const { rows: actividades, count } = await Actividad.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [
        [orderBy, orderDir.toUpperCase()],
        ['nombre', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      data: actividades,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obtenerActividades:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

/**
 * GET /api/actividades/:id
 * Get a single actividad by ID
 */
exports.obtenerActividadPorId = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const actividad = await Actividad.findOne({
      where: {
        id,
        tenantId
      },
      include: [
        {
          model: Socio,
          as: 'socios',
          through: { attributes: ['fecha_inicio'] },
          attributes: ['id', 'nombre', 'apellido', 'estado']
        }
      ]
    });

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Add socios count
    const sociosCount = await actividad.getSociosCount();

    return res.status(200).json({
      success: true,
      data: {
        ...actividad.toJSON(),
        sociosCount
      }
    });
  } catch (error) {
    console.error('Error obtenerActividadPorId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener actividad',
      error: error.message
    });
  }
};

/**
 * POST /api/actividades
 * Create a new actividad
 */
exports.crearActividad = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { nombre, monto, descripcion, orden = 0 } = req.body;

    // Check if activity with same name already exists for this tenant
    const existing = await Actividad.findOne({
      where: {
        tenantId,
        nombre: {
          [Op.iLike]: nombre.trim()
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una actividad con el nombre "${nombre}" en este club`
      });
    }

    // Create actividad
    const actividad = await Actividad.create({
      tenantId,
      nombre: nombre.trim(),
      monto,
      descripcion: descripcion || null,
      orden,
      activa: true
    });

    return res.status(201).json({
      success: true,
      message: 'Actividad creada exitosamente',
      data: actividad
    });
  } catch (error) {
    console.error('Error crearActividad:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de actividad inválidos',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear actividad',
      error: error.message
    });
  }
};

/**
 * PUT /api/actividades/:id
 * Update an actividad
 *
 * NOTE: Changing the monto only affects future quotas, not existing ones.
 */
exports.actualizarActividad = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const { nombre, monto, descripcion, orden, activa } = req.body;

    // Find actividad
    const actividad = await Actividad.findOne({
      where: {
        id,
        tenantId
      }
    });

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Check if name is being changed and if it conflicts
    if (nombre && nombre.trim() !== actividad.nombre) {
      const existing = await Actividad.findOne({
        where: {
          tenantId,
          nombre: {
            [Op.iLike]: nombre.trim()
          },
          id: {
            [Op.ne]: id
          }
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otra actividad con el nombre "${nombre}" en este club`
        });
      }
    }

    // Update fields
    if (nombre) actividad.nombre = nombre.trim();
    if (monto !== undefined) actividad.monto = monto;
    if (descripcion !== undefined) actividad.descripcion = descripcion;
    if (orden !== undefined) actividad.orden = orden;
    if (activa !== undefined) actividad.activa = activa;

    await actividad.save();

    return res.status(200).json({
      success: true,
      message: 'Actividad actualizada exitosamente',
      data: actividad
    });
  } catch (error) {
    console.error('Error actualizarActividad:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de actividad inválidos',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar actividad',
      error: error.message
    });
  }
};

/**
 * DELETE /api/actividades/:id
 * Soft delete - marks actividad as inactive
 *
 * Warns if there are active socios with this activity.
 */
exports.eliminarActividad = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const { force = 'false' } = req.query;

    // Find actividad
    const actividad = await Actividad.findOne({
      where: {
        id,
        tenantId
      }
    });

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Check if there are active socios with this activity
    const sociosCount = await actividad.getSociosCount();

    if (sociosCount > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `No se puede desactivar esta actividad porque tiene ${sociosCount} socio(s) activo(s)`,
        warning: true,
        sociosCount,
        hint: 'Usa ?force=true para desactivar de todos modos'
      });
    }

    // Soft delete: mark as inactive
    actividad.activa = false;
    await actividad.save();

    return res.status(200).json({
      success: true,
      message: 'Actividad desactivada exitosamente',
      data: actividad,
      info: sociosCount > 0 ? `${sociosCount} socio(s) tenían esta actividad` : null
    });
  } catch (error) {
    console.error('Error eliminarActividad:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al desactivar actividad',
      error: error.message
    });
  }
};
