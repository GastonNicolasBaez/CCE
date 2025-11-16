const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Socio } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/search?q={query}&limit={limit}
 * Global search across members
 */
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim() === '') {
    return res.json({
      success: true,
      data: {
        socios: [],
        total: 0
      }
    });
  }

  const searchTerm = q.trim();
  const searchLimit = Math.min(parseInt(limit, 10) || 10, 50); // Max 50 results

  // Search in socios (members)
  const socios = await Socio.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${searchTerm}%` } },
        { apellido: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { dni: { [Op.iLike]: `%${searchTerm}%` } },
        { telefono: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    limit: searchLimit,
    attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'actividad', 'estado'],
    order: [['nombre', 'ASC']]
  });

  const results = socios.map(socio => ({
    type: 'member',
    id: socio.id,
    name: socio.getNombreCompleto(),
    email: socio.email,
    phone: socio.telefono,
    activity: socio.actividad,
    status: socio.estado
  }));

  res.json({
    success: true,
    data: {
      socios: results,
      total: results.length
    }
  });
}));

module.exports = router;
