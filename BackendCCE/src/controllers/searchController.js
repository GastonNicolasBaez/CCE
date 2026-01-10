const { Socio, Cuota } = require('../models');
const { Op } = require('sequelize');

/**
 * Búsqueda Global Controller
 *
 * Proporciona búsqueda unificada en socios y cuotas
 */

/**
 * Búsqueda global - Busca en socios y cuotas
 * GET /api/search?q=juan
 */
exports.busquedaGlobal = async (req, res) => {
  try {
    const { q } = req.query;
    const tenantId = req.tenantId;

    // Validar que hay un término de búsqueda
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = q.trim();

    // Búsqueda en Socios (nombre, apellido, dni, email)
    const socios = await Socio.findAll({
      where: {
        tenantId,
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm}%` } },
          { apellido: { [Op.iLike]: `%${searchTerm}%` } },
          { dni: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado'],
      limit: 5,
      order: [
        ['nombre', 'ASC'],
        ['apellido', 'ASC']
      ]
    });

    // Búsqueda en Cuotas (numero_recibo)
    const cuotas = await Cuota.findAll({
      where: {
        tenantId,
        numeroRecibo: { [Op.iLike]: `%${searchTerm}%` }
      },
      include: [{
        model: Socio,
        attributes: ['id', 'nombre', 'apellido']
      }],
      attributes: ['id', 'periodo', 'monto', 'estado', 'numeroRecibo', 'fechaVencimiento'],
      limit: 5,
      order: [['fechaVencimiento', 'DESC']]
    });

    // Transformar resultados
    const sociosResult = socios.map(socio => ({
      type: 'socio',
      id: socio.id,
      nombre: `${socio.nombre} ${socio.apellido}`,
      dni: socio.dni,
      email: socio.email,
      telefono: socio.telefono,
      estado: socio.estado
    }));

    const cuotasResult = cuotas.map(cuota => ({
      type: 'cuota',
      id: cuota.id,
      numeroRecibo: cuota.numeroRecibo,
      periodo: cuota.periodo,
      monto: cuota.monto,
      estado: cuota.estado,
      fechaVencimiento: cuota.fechaVencimiento,
      socio: cuota.Socio ? {
        id: cuota.Socio.id,
        nombre: `${cuota.Socio.nombre} ${cuota.Socio.apellido}`
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: {
        query: searchTerm,
        results: {
          socios: sociosResult,
          cuotas: cuotasResult
        },
        totalResults: sociosResult.length + cuotasResult.length
      }
    });

  } catch (error) {
    console.error('Error en búsqueda global:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda',
      error: error.message
    });
  }
};
