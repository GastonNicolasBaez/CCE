const jwt = require('jsonwebtoken');
const { Tenant, Usuario } = require('../models');
const { asyncHandler, ValidationError, UnauthorizedError, ConflictError, NotFoundError } = require('../middleware/errorHandler');
const config = require('../config');

/**
 * Auth Controller - Multi-Tenant Authentication
 *
 * Handles authentication for multi-tenant system:
 * - Club registration (creates tenant + admin user)
 * - User login (validates tenant + credentials)
 * - User logout
 * - Current user info
 */

const authController = {
  /**
   * POST /api/auth/register
   * Register a new club (tenant) with admin user
   *
   * Public endpoint - creates new tenant + first admin user
   */
  register: asyncHandler(async (req, res) => {
    const {
      // Tenant data
      clubName,
      slug,
      phone,

      // Admin user data
      adminName,
      adminLastName,
      adminEmail,
      password
    } = req.body;

    // 1. Validate slug availability
    const slugExists = await Tenant.findOne({ where: { slug: slug.toLowerCase() } });
    if (slugExists) {
      throw new ConflictError('Este slug ya está en uso. Por favor elige otro.');
    }

    // 2. Validate email doesn't exist globally (for security)
    const emailExists = await Usuario.findOne({ where: { email: adminEmail.toLowerCase() } });
    if (emailExists) {
      throw new ConflictError('Este email ya está registrado.');
    }

    // 3. Create tenant
    const tenant = await Tenant.create({
      slug: slug.toLowerCase().trim(),
      name: clubName,
      status: 'trial', // 14 days trial
      plan: 'free',
      maxMembers: 50,
      adminEmail: adminEmail.toLowerCase(),
      adminName: `${adminName} ${adminLastName}`,
      phone: phone || null,
      settings: {},
      metadata: {
        registeredAt: new Date(),
        source: 'web'
      }
    });

    console.log(`✅ Tenant created: ${tenant.slug} (ID: ${tenant.id})`);

    // 4. Create admin user for this tenant
    const adminUser = await Usuario.create({
      tenantId: tenant.id,
      nombre: adminName,
      apellido: adminLastName,
      email: adminEmail.toLowerCase(),
      password: password, // Will be hashed by model hook
      rol: 'admin',
      status: 'active',
      activo: true
    });

    console.log(`✅ Admin user created: ${adminUser.email} for tenant ${tenant.slug}`);

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: adminUser.id,
        tenantId: tenant.id,
        email: adminUser.email,
        role: adminUser.rol
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 6. Return success response
    res.status(201).json({
      success: true,
      message: 'Club registrado exitosamente',
      data: {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          status: tenant.status,
          plan: tenant.plan,
          trialEndsAt: tenant.trialEndsAt,
          subdomain: tenant.getSubdomainUrl(process.env.BASE_DOMAIN || 'zeclogic.net.ar')
        },
        user: adminUser.toSafeJSON(),
        token
      }
    });
  }),

  /**
   * POST /api/auth/login
   * Login user within a tenant
   *
   * Requires tenant resolution middleware to run first
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const tenant = req.tenant; // Set by tenant resolution middleware

    if (!tenant) {
      throw new UnauthorizedError('Tenant no encontrado. Verifica el subdominio.');
    }

    // 1. Find user by email within this tenant
    const user = await Usuario.findByEmailAndTenant(email, tenant.id);

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 2. Check if user is active
    if (!user.isActive()) {
      throw new UnauthorizedError('Usuario inactivo. Contacta al administrador.');
    }

    // 3. Check if tenant is active
    if (!tenant.isActive() && !tenant.isOnTrial()) {
      throw new UnauthorizedError('El club está suspendido. Contacta al administrador.');
    }

    // 4. Verify password
    const passwordValid = await user.verificarPassword(password);

    if (!passwordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 5. Update last login
    await user.updateLastLogin();

    // 6. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        email: user.email,
        role: user.rol
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log(`✅ User logged in: ${user.email} (tenant: ${tenant.slug})`);

    // 7. Return success response
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toSafeJSON(),
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          status: tenant.status,
          plan: tenant.plan
        },
        token
      }
    });
  }),

  /**
   * POST /api/auth/logout
   * Logout user (client-side token deletion)
   *
   * Protected endpoint - requires authentication
   */
  logout: asyncHandler(async (req, res) => {
    // In JWT, logout is handled client-side by removing the token
    // We can add token blacklisting here in the future if needed

    console.log(`✅ User logged out: ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  }),

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   *
   * Protected endpoint - requires authentication
   */
  me: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    // 1. Get user with tenant info
    const user = await Usuario.findByPk(userId, {
      include: [{
        model: Tenant,
        as: 'tenant',
        attributes: ['id', 'slug', 'name', 'status', 'plan', 'maxMembers', 'trialEndsAt']
      }]
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // 2. Get tenant statistics
    const tenantStats = await user.tenant.getStatistics();

    res.json({
      success: true,
      data: {
        user: user.toSafeJSON(),
        tenant: {
          ...user.tenant.toJSON(),
          statistics: tenantStats,
          subdomain: user.tenant.getSubdomainUrl(process.env.BASE_DOMAIN || 'zeclogic.net.ar')
        }
      }
    });
  }),

  /**
   * POST /api/auth/verify-token
   * Verify if a JWT token is valid
   *
   * Public endpoint for client-side token validation
   */
  verifyToken: asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Token es requerido');
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Check if user still exists and is active
      const user = await Usuario.findByPk(decoded.userId);

      if (!user || !user.isActive()) {
        throw new UnauthorizedError('Token inválido o usuario inactivo');
      }

      res.json({
        success: true,
        valid: true,
        data: {
          userId: decoded.userId,
          tenantId: decoded.tenantId,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        res.json({
          success: false,
          valid: false,
          message: 'Token inválido o expirado'
        });
      } else {
        throw error;
      }
    }
  })
};

module.exports = authController;
