const { Tenant, Usuario, Socio, Cuota, TenantConfiguracion, sequelize } = require('../models');
const { asyncHandler, ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Tenants Controller - Super Admin Management
 *
 * Handles CRUD operations and management of all tenants in the system.
 * All routes are protected with requireSuperAdmin middleware.
 */

const tenantsController = {
  /**
   * GET /api/admin/tenants
   * Get all tenants with pagination, filters, and search
   *
   * Query params:
   * - page: number (default: 1)
   * - limit: number (default: 10, max: 100)
   * - status: 'active' | 'suspended' | 'trial' | 'cancelled'
   * - plan: 'free' | 'pro' | 'enterprise'
   * - search: string (searches name and slug)
   * - sortBy: 'created_at' | 'name' | 'members' (default: created_at)
   * - sortOrder: 'ASC' | 'DESC' (default: DESC)
   */
  obtenerTenants: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      plan,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Validate and sanitize inputs
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    const validSortFields = ['created_at', 'name', 'slug', 'status', 'plan'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get tenants with basic stats
    const { count, rows: tenants } = await Tenant.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [[orderField, orderDirection]],
      attributes: {
        include: [
          // Include member count as a subquery
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM socios
              WHERE socios.tenant_id = "Tenant"."id"
            )`),
            'memberCount'
          ],
          // Include active member count
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM socios
              WHERE socios.tenant_id = "Tenant"."id"
              AND socios.estado = 'Activo'
            )`),
            'activeMemberCount'
          ]
        ]
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        tenants: tenants.map(tenant => ({
          ...tenant.toJSON(),
          memberCount: parseInt(tenant.getDataValue('memberCount') || 0),
          activeMemberCount: parseInt(tenant.getDataValue('activeMemberCount') || 0),
          usagePercentage: ((parseInt(tenant.getDataValue('memberCount') || 0) / tenant.maxMembers) * 100).toFixed(1)
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  }),

  /**
   * GET /api/admin/tenants/:id
   * Get detailed information about a specific tenant
   */
  obtenerTenantPorId: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id, {
      include: [
        {
          model: TenantConfiguracion,
          as: 'configuracion'
        }
      ]
    });

    if (!tenant) {
      throw new NotFoundError(`Tenant con ID ${id} no encontrado`);
    }

    // Get detailed statistics
    const stats = await tenant.getStatistics();

    // Get user count
    const userCount = await Usuario.count({
      where: { tenantId: tenant.id }
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMembers = await Socio.count({
      where: {
        tenantId: tenant.id,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        tenant: tenant.toJSON(),
        statistics: {
          ...stats,
          userCount,
          recentMembers
        }
      }
    });
  }),

  /**
   * POST /api/admin/tenants
   * Create a new tenant with admin user and configuration
   *
   * Body:
   * - clubName: string
   * - slug: string
   * - phone: string (optional)
   * - plan: 'free' | 'pro' | 'enterprise'
   * - maxMembers: number (optional, auto-set by plan)
   * - adminName: string
   * - adminLastName: string
   * - adminEmail: string
   * - password: string
   * - configuracion: object (optional)
   */
  crearTenant: asyncHandler(async (req, res) => {
    const {
      clubName,
      slug,
      phone,
      plan = 'free',
      maxMembers,
      adminName,
      adminLastName,
      adminEmail,
      password,
      configuracion = {}
    } = req.body;

    // 1. Validate slug availability
    const slugExists = await Tenant.findOne({ where: { slug: slug.toLowerCase() } });
    if (slugExists) {
      throw new ConflictError('Este slug ya está en uso. Por favor elige otro.');
    }

    // 2. Validate email doesn't exist
    const emailExists = await Usuario.findOne({ where: { email: adminEmail.toLowerCase() } });
    if (emailExists) {
      throw new ConflictError('Este email ya está registrado.');
    }

    // 3. Create tenant and admin user in transaction
    const transaction = await sequelize.transaction();

    try {
      // Create tenant
      const tenant = await Tenant.create({
        slug: slug.toLowerCase().trim(),
        name: clubName,
        status: 'trial',
        plan,
        maxMembers: maxMembers || (plan === 'free' ? 50 : plan === 'pro' ? 500 : 999999),
        adminEmail: adminEmail.toLowerCase(),
        adminName: `${adminName} ${adminLastName}`,
        phone: phone || null,
        settings: {},
        metadata: {
          createdBy: req.user.email,
          createdAt: new Date()
        }
      }, { transaction });

      logger.success(`Tenant created by super admin: ${tenant.slug} (ID: ${tenant.id})`);

      // Create admin user for this tenant
      const adminUser = await Usuario.create({
        tenantId: tenant.id,
        nombre: adminName,
        apellido: adminLastName,
        email: adminEmail.toLowerCase(),
        password: password, // Will be hashed by model hook
        rol: 'admin',
        status: 'active',
        activo: true
      }, { transaction });

      logger.success(`Admin user created: ${adminUser.email} for tenant ${tenant.slug}`);

      // Create default configuration
      const defaultConfig = {
        tenantId: tenant.id,
        tipoCuota: configuracion.tipoCuota || 'por_actividad',
        montoBase: configuracion.montoBase || 0,
        multipleActividadesStrategy: configuracion.multipleActividadesStrategy || 'sumar',
        descuentoActividades: configuracion.descuentoActividades || 0,
        diaVencimiento: configuracion.diaVencimiento || 10,
        recordatorioDiasAntes: configuracion.recordatorioDiasAntes || 2,
        descuentoMenores: configuracion.descuentoMenores || 0,
        generarAutomaticamente: configuracion.generarAutomaticamente !== false,
        enviarRecordatorios: configuracion.enviarRecordatorios !== false
      };

      const config = await TenantConfiguracion.create(defaultConfig, { transaction });

      logger.success(`Configuration created for tenant ${tenant.slug}`);

      // Commit transaction
      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Tenant creado exitosamente',
        data: {
          tenant: tenant.toJSON(),
          admin: adminUser.toSafeJSON()
        }
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Transaction rolled back:', error.message);
      throw error;
    }
  }),

  /**
   * PUT /api/admin/tenants/:id
   * Update tenant information
   *
   * Body (all optional):
   * - name: string
   * - phone: string
   * - plan: 'free' | 'pro' | 'enterprise'
   * - maxMembers: number
   * - settings: object
   * - adminEmail: string
   * - adminName: string
   */
  actualizarTenant: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      name,
      phone,
      plan,
      maxMembers,
      settings,
      adminEmail,
      adminName
    } = req.body;

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      throw new NotFoundError(`Tenant con ID ${id} no encontrado`);
    }

    // Update only provided fields
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (plan) updates.plan = plan;
    if (maxMembers) updates.maxMembers = maxMembers;
    if (settings) updates.settings = { ...tenant.settings, ...settings };
    if (adminEmail) updates.adminEmail = adminEmail;
    if (adminName) updates.adminName = adminName;

    // Add to metadata history
    updates.metadata = {
      ...tenant.metadata,
      lastModified: {
        by: req.user.email,
        at: new Date(),
        changes: Object.keys(updates)
      }
    };

    await tenant.update(updates);

    logger.info(`Tenant ${tenant.slug} updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Tenant actualizado exitosamente',
      data: {
        tenant: tenant.toJSON()
      }
    });
  }),

  /**
   * PATCH /api/admin/tenants/:id/status
   * Change tenant status
   *
   * Body:
   * - status: 'active' | 'suspended' | 'trial' | 'cancelled'
   * - reason: string (optional, recommended for suspended/cancelled)
   */
  cambiarStatusTenant: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'suspended', 'trial', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      throw new NotFoundError(`Tenant con ID ${id} no encontrado`);
    }

    const oldStatus = tenant.status;

    // Use model methods for activate/suspend
    if (status === 'active') {
      await tenant.activate();
    } else if (status === 'suspended') {
      await tenant.suspend(reason);
    } else {
      // Manual status change
      tenant.status = status;

      // Add to metadata
      tenant.metadata = {
        ...tenant.metadata,
        statusHistory: [
          ...(tenant.metadata.statusHistory || []),
          {
            from: oldStatus,
            to: status,
            reason: reason || 'No reason provided',
            changedBy: req.user.email,
            changedAt: new Date()
          }
        ]
      };

      await tenant.save();
    }

    logger.info(`Tenant ${tenant.slug} status changed from ${oldStatus} to ${status} by ${req.user.email}`);

    res.json({
      success: true,
      message: `Status cambiado de ${oldStatus} a ${status}`,
      data: {
        tenant: tenant.toJSON()
      }
    });
  }),

  /**
   * GET /api/admin/tenants/:id/users
   * Get all users of a tenant
   */
  obtenerUsuariosTenant: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      throw new NotFoundError(`Tenant con ID ${id} no encontrado`);
    }

    const users = await Usuario.findAll({
      where: { tenantId: tenant.id },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug
        },
        users: users.map(user => user.toSafeJSON())
      }
    });
  }),

  /**
   * GET /api/admin/stats
   * Get global system statistics
   */
  obtenerEstadisticasGlobales: asyncHandler(async (req, res) => {
    // Get tenant counts by status
    const tenantsByStatus = await Tenant.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusCounts = tenantsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.getDataValue('count'));
      return acc;
    }, {});

    // Get tenant counts by plan
    const tenantsByPlan = await Tenant.findAll({
      attributes: [
        'plan',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['plan']
    });

    const planCounts = tenantsByPlan.reduce((acc, item) => {
      acc[item.plan] = parseInt(item.getDataValue('count'));
      return acc;
    }, {});

    // Total members across all tenants
    const totalMembers = await Socio.count();
    const activeMembers = await Socio.count({ where: { estado: 'Activo' } });

    // Total users
    const totalUsers = await Usuario.count();

    // Tenants created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTenants = await Tenant.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    // Tenants with expiring trials (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringTrials = await Tenant.count({
      where: {
        status: 'trial',
        trialEndsAt: {
          [Op.between]: [new Date(), sevenDaysFromNow]
        }
      }
    });

    // Top 5 tenants by member count
    const topTenants = await Tenant.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM socios
              WHERE socios.tenant_id = "Tenant"."id"
            )`),
            'memberCount'
          ]
        ]
      },
      order: [[sequelize.literal('memberCount'), 'DESC']],
      limit: 5
    });

    // Growth chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await Tenant.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalTenants: Object.values(statusCounts).reduce((a, b) => a + b, 0),
          tenantsByStatus: statusCounts,
          tenantsByPlan: planCounts,
          totalMembers,
          activeMembers,
          totalUsers
        },
        recent: {
          tenantsLast30Days: recentTenants,
          expiringTrialsNext7Days: expiringTrials
        },
        topTenants: topTenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          plan: t.plan,
          memberCount: parseInt(t.getDataValue('memberCount') || 0),
          maxMembers: t.maxMembers
        })),
        growth: monthlyGrowth.map(item => ({
          month: item.getDataValue('month'),
          count: parseInt(item.getDataValue('count'))
        }))
      }
    });
  })
};

module.exports = tenantsController;
