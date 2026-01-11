const { Socio, Actividad, Cuota, SocioActividad, sequelize } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Estadisticas Controller - Tenant Statistics
 *
 * Handles statistics and analytics for tenant dashboard.
 * All routes are protected with requireStaff (admin and operador can access)
 */

const estadisticasController = {
  /**
   * GET /api/estadisticas/dashboard
   * Get general statistics for tenant dashboard
   */
  obtenerEstadisticasDashboard: asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    // Get total socios count
    const totalSocios = await Socio.count({
      where: { tenantId }
    });

    // Get active socios
    const sociosActivos = await Socio.count({
      where: { tenantId, estado: 'Activo' }
    });

    // Get socios by esJugador (jugadores vs solo socios)
    const jugadores = await Socio.count({
      where: { tenantId, esJugador: true }
    });

    const soloSocios = await Socio.count({
      where: { tenantId, esJugador: false }
    });

    // Get total actividades
    const totalActividades = await Actividad.count({
      where: { tenantId }
    });

    // Get cuotas statistics
    const totalCuotas = await Cuota.count({
      where: { tenantId }
    });

    const cuotasPagadas = await Cuota.count({
      where: { tenantId, estado: 'Pagada' }
    });

    const cuotasPendientes = await Cuota.count({
      where: { tenantId, estado: 'Pendiente' }
    });

    const cuotasVencidas = await Cuota.count({
      where: { tenantId, estado: 'Vencida' }
    });

    // Calculate total income (sum of paid cuotas)
    const ingresoTotal = await Cuota.sum('monto', {
      where: { tenantId, estado: 'Pagada' }
    }) || 0;

    // Calculate pending income
    const ingresoPendiente = await Cuota.sum('monto', {
      where: { tenantId, estado: { [Op.in]: ['Pendiente', 'Vencida'] } }
    }) || 0;

    res.json({
      success: true,
      data: {
        socios: {
          total: totalSocios,
          activos: sociosActivos,
          inactivos: totalSocios - sociosActivos,
          porTipo: {
            jugadores: jugadores,
            soloSocios: soloSocios
          }
        },
        actividades: {
          total: totalActividades
        },
        cuotas: {
          total: totalCuotas,
          pagadas: cuotasPagadas,
          pendientes: cuotasPendientes,
          vencidas: cuotasVencidas,
          tasaPago: totalCuotas > 0 ? ((cuotasPagadas / totalCuotas) * 100).toFixed(1) : '0'
        },
        ingresos: {
          total: parseFloat(ingresoTotal.toFixed(2)),
          pendiente: parseFloat(ingresoPendiente.toFixed(2))
        }
      }
    });
  }),

  /**
   * GET /api/estadisticas/actividades
   * Get statistics by activity
   */
  obtenerEstadisticasPorActividad: asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    // Get all activities with socio count
    const actividades = await Actividad.findAll({
      where: { tenantId },
      attributes: [
        'id',
        'nombre',
        'monto',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM socio_actividades
            WHERE socio_actividades.actividad_id = "Actividad"."id"
          )`),
          'cantidadSocios'
        ]
      ],
      order: [[sequelize.literal('"cantidadSocios"'), 'DESC']],
      raw: true
    });

    // Calculate total monthly income per activity
    const actividadesConIngresos = actividades.map((actividad) => {
      const ingresoMensual = actividad.monto * parseInt(actividad.cantidadSocios || 0);

      return {
        id: actividad.id,
        nombre: actividad.nombre,
        monto: parseFloat(actividad.monto),
        cantidadSocios: parseInt(actividad.cantidadSocios || 0),
        ingresoMensualEstimado: parseFloat(ingresoMensual.toFixed(2))
      };
    });

    res.json({
      success: true,
      data: {
        actividades: actividadesConIngresos
      }
    });
  }),

  /**
   * GET /api/estadisticas/crecimiento
   * Get growth statistics (last 6 months)
   */
  obtenerCrecimiento: asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    // Get socios created in last 6 months grouped by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const crecimientoSocios = await Socio.findAll({
      where: {
        tenantId,
        [Op.and]: [
          sequelize.where(
            sequelize.col('created_at'),
            Op.gte,
            sixMonthsAgo
          )
        ]
      },
      attributes: [
        [sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM'), 'mes'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: [sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM')],
      order: [[sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    // Get cuotas paid in last 6 months grouped by month
    const ingresosMensuales = await Cuota.findAll({
      where: {
        tenantId,
        estado: 'Pagada',
        [Op.and]: [
          sequelize.where(
            sequelize.col('fecha_pago'),
            Op.gte,
            sixMonthsAgo
          )
        ]
      },
      attributes: [
        [sequelize.fn('to_char', sequelize.col('fecha_pago'), 'YYYY-MM'), 'mes'],
        [sequelize.fn('SUM', sequelize.col('monto')), 'ingresos'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: [sequelize.fn('to_char', sequelize.col('fecha_pago'), 'YYYY-MM')],
      order: [[sequelize.fn('to_char', sequelize.col('fecha_pago'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        crecimientoSocios: crecimientoSocios.map(item => ({
          mes: item.mes,
          cantidad: parseInt(item.cantidad)
        })),
        ingresosMensuales: ingresosMensuales.map(item => ({
          mes: item.mes,
          ingresos: parseFloat(parseFloat(item.ingresos).toFixed(2)),
          cantidadCuotas: parseInt(item.cantidad)
        }))
      }
    });
  }),

  /**
   * GET /api/estadisticas/cuotas
   * Get detailed cuotas statistics
   */
  obtenerEstadisticasCuotas: asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    // Get current month's period (formato: YYYY-MM)
    const now = new Date();
    const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const cuotasMesActual = await Cuota.count({
      where: {
        tenantId,
        periodo: periodoActual
      }
    });

    const cuotasPagadasMesActual = await Cuota.count({
      where: {
        tenantId,
        periodo: periodoActual,
        estado: 'Pagada'
      }
    });

    const ingresoMesActual = await Cuota.sum('monto', {
      where: {
        tenantId,
        periodo: periodoActual,
        estado: 'Pagada'
      }
    }) || 0;

    // Get cuotas by status
    const cuotasPorEstado = await Cuota.findAll({
      where: { tenantId },
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('monto')), 'monto_total']
      ],
      group: ['estado'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        mesActual: {
          periodo: periodoActual,
          mes: now.getMonth() + 1,
          anio: now.getFullYear(),
          total: cuotasMesActual,
          pagadas: cuotasPagadasMesActual,
          ingresos: parseFloat(ingresoMesActual.toFixed(2)),
          tasaCobro: cuotasMesActual > 0 ? ((cuotasPagadasMesActual / cuotasMesActual) * 100).toFixed(1) : '0'
        },
        porEstado: cuotasPorEstado.map(item => ({
          estado: item.estado,
          cantidad: parseInt(item.cantidad),
          montoTotal: parseFloat(parseFloat(item.monto_total || 0).toFixed(2))
        }))
      }
    });
  })
};

module.exports = estadisticasController;
