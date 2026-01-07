const { Tenant } = require('../models');
const { NotFoundError } = require('./errorHandler');

/**
 * Tenant Resolution Middleware
 *
 * Extracts tenant from:
 * 1. Subdomain (espora.zeclogic.net.ar → 'espora')
 * 2. Header X-Tenant-Slug (for testing/API)
 * 3. Query param ?tenant=slug (fallback for development)
 *
 * Attaches resolved tenant to req.tenant
 */

/**
 * Extract subdomain from hostname
 *
 * Examples:
 * - espora.zeclogic.net.ar → 'espora'
 * - demo.localhost → 'demo'
 * - localhost → null
 * - zeclogic.net.ar → null
 */
const extractSubdomain = (hostname) => {
  if (!hostname) return null;

  // Remove port if present
  const host = hostname.split(':')[0];

  // Split by dots
  const parts = host.split('.');

  // Development (localhost)
  if (host === 'localhost' || host === '127.0.0.1') {
    return null; // No subdomain
  }

  // Development with subdomain (espora.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // Production (subdomain.domain.tld)
  if (parts.length >= 3) {
    const subdomain = parts[0];

    // Ignore common prefixes
    if (['www', 'api'].includes(subdomain.toLowerCase())) {
      return null;
    }

    return subdomain;
  }

  // No subdomain
  return null;
};

/**
 * Resolve tenant middleware
 *
 * Required for ALL tenant-specific routes
 * Skipped for public routes (landing page, registration)
 */
const resolveTenant = async (req, res, next) => {
  try {
    let tenantSlug = null;

    // 1. Try from subdomain (primary method)
    const hostname = req.headers.host || req.hostname;
    tenantSlug = extractSubdomain(hostname);

    // 2. Try from header (for testing/API)
    if (!tenantSlug && req.headers['x-tenant-slug']) {
      tenantSlug = req.headers['x-tenant-slug'];
      console.log(`ℹ️  Tenant from header: ${tenantSlug}`);
    }

    // 3. Try from query param (fallback for development)
    if (!tenantSlug && req.query.tenant) {
      tenantSlug = req.query.tenant;
      console.log(`ℹ️  Tenant from query: ${tenantSlug}`);
    }

    // 4. If still no tenant, this might be landing page or public route
    if (!tenantSlug) {
      console.log(`ℹ️  No tenant in request: ${hostname} → Landing page or public route`);
      // Don't set req.tenant, let route handlers decide if that's ok
      return next();
    }

    // 5. Find tenant in database
    const tenant = await Tenant.findBySlug(tenantSlug);

    if (!tenant) {
      throw new NotFoundError(
        `Tenant "${tenantSlug}" no encontrado. Verifica el subdominio o contacta al soporte.`
      );
    }

    // 6. Check if tenant is accessible
    if (tenant.status === 'cancelled') {
      return res.status(410).json({
        success: false,
        error: 'Este club ha sido eliminado.',
        code: 'TENANT_CANCELLED'
      });
    }

    if (tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Este club está suspendido. Contacta al administrador.',
        code: 'TENANT_SUSPENDED'
      });
    }

    // 7. Check if trial has expired
    if (tenant.isOnTrial() && tenant.isTrialExpired()) {
      return res.status(402).json({
        success: false,
        error: 'El período de prueba ha expirado. Por favor actualiza tu plan.',
        code: 'TRIAL_EXPIRED',
        data: {
          trialEndsAt: tenant.trialEndsAt
        }
      });
    }

    // 8. Attach tenant to request
    req.tenant = tenant;

    console.log(`✅ Tenant resolved: ${tenant.slug} (ID: ${tenant.id}, Status: ${tenant.status})`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional tenant resolution
 * Doesn't fail if no tenant found, just doesn't set req.tenant
 */
const optionalTenantResolver = async (req, res, next) => {
  try {
    const hostname = req.headers.host || req.hostname;
    const tenantSlug = extractSubdomain(hostname) ||
                       req.headers['x-tenant-slug'] ||
                       req.query.tenant;

    if (!tenantSlug) {
      return next();
    }

    const tenant = await Tenant.findBySlug(tenantSlug);

    if (tenant && tenant.status !== 'cancelled' && tenant.status !== 'suspended') {
      req.tenant = tenant;
    }

    next();
  } catch (error) {
    // Don't fail on optional resolution
    console.error('Optional tenant resolution error:', error);
    next();
  }
};

/**
 * Require tenant middleware
 * Must be used AFTER resolveTenant
 * Fails if no tenant was resolved
 */
const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    throw new NotFoundError(
      'Tenant requerido. Accede a través de un subdominio (ej: espora.zeclogic.net.ar)'
    );
  }
  next();
};

module.exports = {
  resolveTenant,
  optionalTenantResolver,
  requireTenant,
  extractSubdomain // Export for testing
};
