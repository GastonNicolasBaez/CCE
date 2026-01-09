const { Op } = require('sequelize');
const { Socio, Cuota, Actividad, TenantConfiguracion } = require('../models');
const { asyncHandler, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const cuotaService = require('../services/cuotaService');

const sociosController = {
  // GET /socios - Get all socios with filtering and pagination
  obtenerSocios: asyncHandler(async (req, res) => {
    try {
      const {
        actividad,
        estado,
        estadoCuota,
        page = '1',
        limit = '20',
        search
      } = req.query;

    // Build where conditions
    const whereConditions = {
      tenantId: req.tenant.id // CRITICAL: Filter by tenant
    };

    if (actividad) {
      whereConditions.actividad = actividad;
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    if (search) {
      whereConditions[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { apellido: { [Op.like]: `%${search}%` } },
        { dni: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Build include conditions for cuotas filtering
    const includeConditions = {
      model: Cuota,
      as: 'cuotas',
      required: false
    };

    if (estadoCuota) {
      includeConditions.where = { estado: estadoCuota };
      includeConditions.required = true;
    }

    // Parse and validate pagination parameters
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit) || 20));
    
    // Calculate offset
    const offset = (pageNumber - 1) * limitNumber;

    // Get socios with pagination
    const { count, rows: socios } = await Socio.findAndCountAll({
      where: whereConditions,
      include: [includeConditions],
      limit: limitNumber,
      offset: offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    // Transform socios data
    const sociosData = socios.map(socio => {
      try {
        const socioData = socio.toJSON();
        
        // Add computed fields
        socioData.nombreCompleto = socio.getNombreCompleto();
        socioData.edad = socio.getEdad();
        
        // Add payment summary
        const cuotas = socioData.cuotas || [];
        socioData.resumenPagos = {
          total: cuotas.length,
          pendientes: cuotas.filter(c => c.estado === 'Pendiente').length,
          pagadas: cuotas.filter(c => c.estado === 'Pagada').length,
          vencidas: cuotas.filter(c => c.estado === 'Vencida').length,
          ultimaCuota: cuotas.length > 0 ? cuotas[cuotas.length - 1] : null
        };

        return socioData;
      } catch (error) {
        console.error('Error processing socio:', socio.id, error);
        throw error;
      }
    });

    res.json({
      success: true,
      data: sociosData,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNumber,
        hasNextPage,
        hasPreviousPage
      }
    });
    } catch (error) {
      console.error('Error in obtenerSocios:', error);
      throw error;
    }
  }),

  // GET /socios/:id - Get single socio by ID
  obtenerSocioPorId: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const socio = await Socio.findOne({
      where: {
        id,
        tenantId: req.tenant.id // CRITICAL: Verify socio belongs to tenant
      },
      include: [{
        model: Cuota,
        as: 'cuotas',
        order: [['fechaVencimiento', 'DESC']]
      }]
    });

    if (!socio) {
      throw new NotFoundError('Socio no encontrado');
    }

    const socioData = socio.toJSON();
    socioData.nombreCompleto = socio.getNombreCompleto();
    socioData.edad = socio.getEdad();

    // Add payment statistics
    const cuotas = socioData.cuotas || [];
    socioData.estadisticasPago = {
      totalCuotas: cuotas.length,
      cuotasPagadas: cuotas.filter(c => c.estado === 'Pagada').length,
      cuotasPendientes: cuotas.filter(c => c.estado === 'Pendiente').length,
      cuotasVencidas: cuotas.filter(c => c.estado === 'Vencida').length,
      montoTotal: cuotas.reduce((sum, c) => sum + parseFloat(c.monto), 0),
      montoPagado: cuotas.filter(c => c.estado === 'Pagada').reduce((sum, c) => sum + parseFloat(c.monto), 0),
      montoPendiente: cuotas.filter(c => c.estado !== 'Pagada').reduce((sum, c) => sum + parseFloat(c.monto), 0)
    };

    res.json({
      success: true,
      data: socioData
    });
  }),

  // POST /socios - Create new socio
  crearSocio: asyncHandler(async (req, res) => {
    const socioData = req.body;
    const { actividades: actividadesIds } = req.body; // Array of actividad IDs

    // CRITICAL: Check tenant member limit
    const hasReachedLimit = await req.tenant.hasReachedMemberLimit();
    if (hasReachedLimit) {
      throw new ConflictError(`Has alcanzado el límite de ${req.tenant.maxMembers} miembros para tu plan ${req.tenant.plan}. Actualiza tu plan para agregar más miembros.`);
    }

    // Check if DNI already exists within tenant
    const existingSocio = await Socio.findOne({
      where: {
        dni: socioData.dni,
        tenantId: req.tenant.id
      }
    });
    if (existingSocio) {
      throw new ConflictError('Ya existe un socio con este DNI');
    }

    // Check if email already exists within tenant
    const existingEmail = await Socio.findOne({
      where: {
        email: socioData.email,
        tenantId: req.tenant.id
      }
    });
    if (existingEmail) {
      throw new ConflictError('Ya existe un socio con este email');
    }

    // Add tenant ID to socio data
    socioData.tenantId = req.tenant.id;

    // Remove actividades from socioData (will be added via association)
    delete socioData.actividades;

    const socio = await Socio.create(socioData);

    // Assign actividades to socio (if provided)
    if (actividadesIds && Array.isArray(actividadesIds) && actividadesIds.length > 0) {
      // Verify all activities belong to this tenant
      const actividades = await Actividad.findAll({
        where: {
          id: actividadesIds,
          tenantId: req.tenant.id,
          activa: true
        }
      });

      if (actividades.length !== actividadesIds.length) {
        throw new NotFoundError('Una o más actividades no son válidas para este club');
      }

      // Associate actividades with socio
      await socio.setActividades(actividades);
    }

    // Generate initial quota (if not in grace period)
    try {
      // Get tenant configuration
      const configuracion = await TenantConfiguracion.getOrCreateDefault(req.tenant.id);

      // Check if socio should have a quota generated
      if (!socio.exentoCuota && !socio.mesGraciaHasta) {
        // Load actividades for calculation
        await socio.reload({
          include: [{ model: Actividad, as: 'actividades' }]
        });

        // Generate quota for current month
        const currentPeriodo = cuotaService.getCurrentPeriodo();
        const cuota = await cuotaService.generarCuotaMensual(
          socio,
          currentPeriodo,
          configuracion
        );

        if (cuota) {
          console.log(`✅ Cuota inicial generada para socio ${socio.id}: $${cuota.monto} (${currentPeriodo})`);
        }
      } else {
        console.log(`ℹ️  No se genera cuota inicial para socio ${socio.id} (exento o en gracia)`);
      }
    } catch (cuotaError) {
      // Don't fail the socio creation if quota generation fails
      console.error('⚠️  Error generando cuota inicial:', cuotaError.message);
    }

    // Reload socio with actividades for response
    await socio.reload({
      include: [{ model: Actividad, as: 'actividades' }]
    });

    const socioResponse = socio.toJSON();
    socioResponse.nombreCompleto = socio.getNombreCompleto();
    socioResponse.edad = socio.getEdad();

    res.status(201).json({
      success: true,
      data: socioResponse,
      message: 'Socio creado exitosamente'
    });
  }),

  // PUT /socios/:id - Update socio
  actualizarSocio: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const socio = await Socio.findOne({
      where: {
        id,
        tenantId: req.tenant.id // CRITICAL: Verify socio belongs to tenant
      }
    });
    if (!socio) {
      throw new NotFoundError('Socio no encontrado');
    }

    // Check for DNI conflicts within tenant (if DNI is being updated)
    if (updateData.dni && updateData.dni !== socio.dni) {
      const existingSocio = await Socio.findOne({
        where: {
          dni: updateData.dni,
          tenantId: req.tenant.id
        }
      });
      if (existingSocio) {
        throw new ConflictError('Ya existe un socio con este DNI');
      }
    }

    // Check for email conflicts within tenant (if email is being updated)
    if (updateData.email && updateData.email !== socio.email) {
      const existingEmail = await Socio.findOne({
        where: {
          email: updateData.email,
          tenantId: req.tenant.id
        }
      });
      if (existingEmail) {
        throw new ConflictError('Ya existe un socio con este email');
      }
    }

    await socio.update(updateData);
    await socio.reload();

    const socioResponse = socio.toJSON();
    socioResponse.nombreCompleto = socio.getNombreCompleto();
    socioResponse.edad = socio.getEdad();

    res.json({
      success: true,
      data: socioResponse,
      message: 'Socio actualizado exitosamente'
    });
  }),

  // DELETE /socios/:id - Delete socio
  eliminarSocio: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { force } = req.query; // Add force parameter from query string

    const socio = await Socio.findOne({
      where: {
        id,
        tenantId: req.tenant.id // CRITICAL: Verify socio belongs to tenant
      },
      include: [{
        model: Cuota,
        as: 'cuotas'
      }]
    });

    if (!socio) {
      throw new NotFoundError('Socio no encontrado');
    }

    // Check if socio has pending payments
    const cuotasPendientes = socio.cuotas?.filter(c => c.estado === 'Pendiente' || c.estado === 'Vencida') || [];
    
    if (cuotasPendientes.length > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el socio porque tiene cuotas pendientes',
        data: {
          cuotasPendientes: cuotasPendientes.length,
          montoTotal: cuotasPendientes.reduce((sum, c) => sum + parseFloat(c.monto), 0)
        }
      });
    }

    // If force=true, delete all associated cuotas first
    if (force === 'true' && cuotasPendientes.length > 0) {
      await Cuota.destroy({
        where: {
          socioId: id,
          tenantId: req.tenant.id // CRITICAL: Only delete cuotas from this tenant
        }
      });
    }

    await socio.destroy();

    res.json({
      success: true,
      message: force === 'true' && cuotasPendientes.length > 0 
        ? 'Socio y sus cuotas eliminados exitosamente'
        : 'Socio eliminado exitosamente'
    });
  }),

  // GET /socios/estadisticas - Get general statistics
  obtenerEstadisticas: asyncHandler(async (req, res) => {
    const tenantId = req.tenant.id;

    // Get total counts (filtered by tenant)
    const totalSocios = await Socio.count({ where: { tenantId } });
    const sociosActivos = await Socio.count({ where: { estado: 'Activo', tenantId } });
    const sociosInactivos = await Socio.count({ where: { estado: 'Inactivo', tenantId } });
    const sociosSuspendidos = await Socio.count({ where: { estado: 'Suspendido', tenantId } });

    // Get counts by activity (filtered by tenant)
    const porActividad = await Socio.findAll({
      attributes: [
        'actividad',
        [Socio.sequelize.fn('COUNT', Socio.sequelize.col('id')), 'cantidad']
      ],
      where: { tenantId },
      group: ['actividad']
    });

    // Get payment statistics (filtered by tenant)
    const totalCuotas = await Cuota.count({ where: { tenantId } });
    const cuotasPagadas = await Cuota.count({ where: { estado: 'Pagada', tenantId } });
    const cuotasPendientes = await Cuota.count({ where: { estado: 'Pendiente', tenantId } });
    const cuotasVencidas = await Cuota.count({ where: { estado: 'Vencida', tenantId } });

    // Get monthly revenue (filtered by tenant)
    const ingresosMensuales = await Cuota.findAll({
      attributes: [
        'periodo',
        [Cuota.sequelize.fn('SUM', Cuota.sequelize.col('monto')), 'total']
      ],
      where: { estado: 'Pagada', tenantId },
      group: ['periodo'],
      order: [['periodo', 'DESC']],
      limit: 12
    });

    res.json({
      success: true,
      data: {
        socios: {
          total: totalSocios,
          activos: sociosActivos,
          inactivos: sociosInactivos,
          suspendidos: sociosSuspendidos,
          porActividad: porActividad.map(item => ({
            actividad: item.actividad,
            cantidad: parseInt(item.dataValues.cantidad)
          }))
        },
        pagos: {
          totalCuotas,
          pagadas: cuotasPagadas,
          pendientes: cuotasPendientes,
          vencidas: cuotasVencidas,
          tasaCobranza: totalCuotas > 0 ? ((cuotasPagadas / totalCuotas) * 100).toFixed(2) : 0
        },
        ingresos: {
          mensuales: ingresosMensuales.map(item => ({
            periodo: item.periodo,
            total: parseFloat(item.dataValues.total)
          }))
        }
      }
    });
  }),

  // POST /send-payment-email - Send payment information email
  enviarEmailPago: asyncHandler(async (req, res) => {
    const { memberData } = req.body;

    try {
      // Usar el servicio de email real
      const result = await emailService.enviarInformacionPago(memberData);

      res.json({
        success: true,
        message: 'Email de información de pago enviado exitosamente',
        data: {
          email: memberData.email,
          membershipType: memberData.membershipType,
          trialMonth: memberData.trialMonth,
          messageId: result.messageId
        }
      });
    } catch (error) {
      console.error('Error enviando email:', error);
      
      // Fallback response si el email falla
      res.json({
        success: true,
        message: 'Inscripción procesada. Email pendiente de envío.',
        data: {
          email: memberData.email,
          membershipType: memberData.membershipType,
          trialMonth: memberData.trialMonth,
          emailError: error.message
        }
      });
    }
  })
};

module.exports = sociosController;