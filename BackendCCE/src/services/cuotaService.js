const { Socio, Actividad, Cuota, TenantConfiguracion, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Cuota Service - Automatic Quota Generation and Calculation
 *
 * Handles:
 * - Calculating quota amounts based on tenant configuration
 * - Generating monthly quotas for socios
 * - Batch generation for all socios in a tenant
 */

/**
 * Calculate the quota amount for a socio based on tenant configuration
 *
 * @param {Object} socio - Socio instance (must include actividades)
 * @param {Object} configuracion - TenantConfiguracion instance
 * @returns {number} - Calculated amount (0 if exempt)
 */
async function calcularMontoCuota(socio, configuracion) {
  try {
    // 1. Check if socio has permanent exemption
    if (socio.exentoCuota === true) {
      console.log(`  ℹ️  Socio ${socio.id} exento permanentemente`);
      return 0;
    }

    // 2. Check if socio is in grace period
    if (socio.mesGraciaHasta) {
      const today = new Date();
      const graciaHasta = new Date(socio.mesGraciaHasta);
      if (today <= graciaHasta) {
        console.log(`  ℹ️  Socio ${socio.id} en período de gracia hasta ${socio.mesGraciaHasta}`);
        return 0;
      }
    }

    // 3. Get actividades for this socio
    let actividades;
    if (socio.actividades && Array.isArray(socio.actividades)) {
      // Already loaded via include
      actividades = socio.actividades;
    } else {
      // Load actividades
      actividades = await socio.getActividades();
    }

    let monto = 0;

    // 4. Calculate based on tipo_cuota
    if (configuracion.tipoCuota === 'unica') {
      // Fixed amount for all socios
      monto = parseFloat(configuracion.montoBase);
    } else if (configuracion.tipoCuota === 'por_actividad') {
      // Based on activities

      // If no activities, return 0
      if (!actividades || actividades.length === 0) {
        console.log(`  ℹ️  Socio ${socio.id} sin actividades asignadas`);
        return 0;
      }

      // Filter only active activities
      const actividadesActivas = actividades.filter(a => a.activa === true);

      if (actividadesActivas.length === 0) {
        console.log(`  ℹ️  Socio ${socio.id} sin actividades activas`);
        return 0;
      }

      // If only one activity, return its amount
      if (actividadesActivas.length === 1) {
        monto = parseFloat(actividadesActivas[0].monto);
      } else {
        // Multiple activities: apply strategy
        const strategy = configuracion.multipleActividadesStrategy;

        if (strategy === 'sumar') {
          // Sum all activity amounts
          monto = actividadesActivas.reduce((sum, act) => {
            return sum + parseFloat(act.monto);
          }, 0);
        } else if (strategy === 'maximo') {
          // Use highest amount
          monto = Math.max(...actividadesActivas.map(act => parseFloat(act.monto)));
        } else if (strategy === 'descuento') {
          // Primary activity + discount on additional activities
          // Sort by amount descending
          const sorted = actividadesActivas
            .map(act => parseFloat(act.monto))
            .sort((a, b) => b - a);

          // Highest price (primary)
          monto = sorted[0];

          // Add discounted additional activities
          const descuento = parseFloat(configuracion.descuentoActividades) / 100;
          for (let i = 1; i < sorted.length; i++) {
            monto += sorted[i] * (1 - descuento);
          }
        }
      }
    }

    // 6. Apply discount for minors (< 18 years old)
    if (socio.esMenor && socio.esMenor() && configuracion.descuentoMenores > 0) {
      const descuento = parseFloat(configuracion.descuentoMenores) / 100;
      const montoDescuento = monto * descuento;
      monto = monto - montoDescuento;
      console.log(`  ℹ️  Descuento de ${configuracion.descuentoMenores}% aplicado (menor de edad): -$${montoDescuento.toFixed(2)}`);
    }

    // 7. Round to 2 decimals
    return Math.round(monto * 100) / 100;
  } catch (error) {
    console.error('Error calculando monto de cuota:', error);
    throw error;
  }
}

/**
 * Generate a monthly quota for a socio
 *
 * @param {Object} socio - Socio instance
 * @param {string} periodo - Period in format YYYY-MM
 * @param {Object} configuracion - TenantConfiguracion instance
 * @returns {Promise<Object|null>} - Created cuota or null if monto is 0
 */
async function generarCuotaMensual(socio, periodo, configuracion) {
  try {
    // 1. Check if socio is active
    if (socio.estado !== 'Activo') {
      console.log(`  ⏭️  Socio ${socio.id} (${socio.getNombreCompleto()}) no está activo`);
      return null;
    }

    // 2. Calculate amount
    const monto = await calcularMontoCuota(socio, configuracion);

    // 3. If amount is 0, don't create quota
    if (monto === 0) {
      console.log(`  ⏭️  No se genera cuota para socio ${socio.id} (monto = 0)`);
      return null;
    }

    // 4. Calculate due date: dia_vencimiento of the period month
    const [year, month] = periodo.split('-').map(Number);
    const diaVencimiento = configuracion.diaVencimiento;
    const fechaVencimiento = new Date(year, month - 1, diaVencimiento);

    // 5. Check if quota already exists for this socio + period
    const existing = await Cuota.findOne({
      where: {
        tenantId: socio.tenantId,
        socioId: socio.id,
        periodo
      }
    });

    if (existing) {
      console.log(`  ℹ️  Cuota ya existe para socio ${socio.id} periodo ${periodo}`);
      return existing;
    }

    // 6. Create quota
    const cuota = await Cuota.create({
      tenantId: socio.tenantId,
      socioId: socio.id,
      periodo,
      monto,
      fechaVencimiento,
      estado: 'Pendiente'
    });

    console.log(`  ✅ Cuota generada: ${socio.getNombreCompleto()} | ${periodo} | $${monto}`);

    return cuota;
  } catch (error) {
    // Handle unique constraint violation (quota already exists)
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log(`  ℹ️  Cuota ya existe para socio ${socio.id} periodo ${periodo}`);
      return null;
    }

    console.error(`Error generando cuota para socio ${socio.id}:`, error);
    throw error;
  }
}

/**
 * Generate quotas for all active socios in a tenant
 *
 * @param {number} tenantId - Tenant ID
 * @param {string} periodo - Period in format YYYY-MM
 * @returns {Promise<Object>} - Summary of generation
 */
async function generarCuotasMasivas(tenantId, periodo) {
  const transaction = await sequelize.transaction();

  try {
    console.log(`\n📊 Generando cuotas masivas para tenant ${tenantId} - Periodo ${periodo}`);

    // 1. Get tenant configuration
    const configuracion = await TenantConfiguracion.findOne({
      where: { tenantId }
    });

    if (!configuracion) {
      throw new Error(`No se encontró configuración para tenant ${tenantId}`);
    }

    console.log(`  ✅ Configuración cargada: tipo=${configuracion.tipoCuota}, strategy=${configuracion.multipleActividadesStrategy}`);

    // 2. Get all active socios with their actividades
    const socios = await Socio.findAll({
      where: {
        tenantId,
        estado: 'Activo'
      },
      include: [
        {
          model: Actividad,
          as: 'actividades',
          through: { attributes: [] },
          required: false
        }
      ],
      transaction
    });

    console.log(`  ✅ Encontrados ${socios.length} socios activos`);

    // 3. Generate quota for each socio
    const results = {
      total: socios.length,
      generadas: 0,
      exentos: 0,
      sinActividades: 0,
      duplicadas: 0,
      errores: 0,
      montoTotal: 0
    };

    for (const socio of socios) {
      try {
        const cuota = await generarCuotaMensual(socio, periodo, configuracion);

        if (cuota) {
          results.generadas++;
          results.montoTotal += parseFloat(cuota.monto);
        } else {
          // Check reason for not generating
          if (socio.exentoCuota || socio.isExento()) {
            results.exentos++;
          } else if (!socio.actividades || socio.actividades.length === 0) {
            results.sinActividades++;
          } else {
            results.duplicadas++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error con socio ${socio.id}:`, error.message);
        results.errores++;
      }
    }

    await transaction.commit();

    console.log(`\n✅ Generación completada:`);
    console.log(`   - Total socios: ${results.total}`);
    console.log(`   - Cuotas generadas: ${results.generadas}`);
    console.log(`   - Socios exentos: ${results.exentos}`);
    console.log(`   - Sin actividades: ${results.sinActividades}`);
    console.log(`   - Duplicadas (ya existían): ${results.duplicadas}`);
    console.log(`   - Errores: ${results.errores}`);
    console.log(`   - Monto total: $${results.montoTotal.toFixed(2)}\n`);

    return results;
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en generación masiva:', error);
    throw error;
  }
}

/**
 * Get next period (YYYY-MM format)
 * @param {Date} date - Base date (default: today)
 * @returns {string} - Next month in YYYY-MM format
 */
function getNextPeriodo(date = new Date()) {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

/**
 * Get current period (YYYY-MM format)
 * @param {Date} date - Base date (default: today)
 * @returns {string} - Current month in YYYY-MM format
 */
function getCurrentPeriodo(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

module.exports = {
  calcularMontoCuota,
  generarCuotaMensual,
  generarCuotasMasivas,
  getNextPeriodo,
  getCurrentPeriodo
};
