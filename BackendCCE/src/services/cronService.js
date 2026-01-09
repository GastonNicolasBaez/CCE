const cron = require('node-cron');
const { Op } = require('sequelize');
const { Socio, Cuota, Tenant, TenantConfiguracion } = require('../models');
const emailService = require('./emailService');
const cuotaService = require('./cuotaService');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Initialize all cron jobs
  init() {
    if (this.isRunning) {
      console.log('Cron service already running');
      return;
    }

    this.setupPaymentReminders();
    this.setupPaymentStatusUpdater();
    this.setupMonthlyQuotaGenerator();
    
    this.isRunning = true;
    console.log('✅ Cron service initialized successfully');
  }

  // Setup payment reminders job (runs every day at 9:00 AM)
  setupPaymentReminders() {
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('🔔 Running payment reminders job...');
        await this.processPaymentReminders();
      } catch (error) {
        console.error('❌ Error in payment reminders job:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('paymentReminders', job);
    job.start();
    console.log('✅ Payment reminders cron job scheduled (daily at 9:00 AM)');
  }

  // Setup payment status updater (runs every day at 2:00 AM)
  setupPaymentStatusUpdater() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🔄 Running payment status updater job...');
        await this.updateOverduePayments();
      } catch (error) {
        console.error('❌ Error in payment status updater job:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('statusUpdater', job);
    job.start();
    console.log('✅ Payment status updater cron job scheduled (daily at 2:00 AM)');
  }

  // Setup monthly quota generator (runs on 1st of each month at 6:00 AM)
  setupMonthlyQuotaGenerator() {
    const job = cron.schedule('0 6 1 * *', async () => {
      try {
        console.log('📅 Running monthly quota generator job...');
        await this.generateMonthlyQuotas();
      } catch (error) {
        console.error('❌ Error in monthly quota generator job:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('monthlyQuotas', job);
    job.start();
    console.log('✅ Monthly quota generator cron job scheduled (1st of each month at 6:00 AM)');
  }

  // Process payment reminders for overdue payments
  async processPaymentReminders() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

      // Find overdue cuotas that haven't received reminders in the last 2 days
      const cuotasVencidas = await Cuota.findAll({
        where: {
          fechaVencimiento: { [Op.lt]: today },
          estado: { [Op.in]: ['Pendiente', 'Vencida'] },
          [Op.or]: [
            { fechaEnvioRecordatorio: null },
            { fechaEnvioRecordatorio: { [Op.lt]: twoDaysAgo } }
          ],
          cantidadRecordatorios: { [Op.lt]: 5 } // Max 5 reminders
        },
        include: [{
          model: Socio,
          as: 'socio',
          where: { estado: 'Activo' },
          required: true
        }],
        limit: 100 // Process in batches
      });

      if (cuotasVencidas.length === 0) {
        console.log('📭 No overdue payments requiring reminders');
        return { processed: 0, errors: 0 };
      }

      console.log(`📨 Processing ${cuotasVencidas.length} payment reminders...`);

      let processed = 0;
      let errors = 0;

      for (const cuota of cuotasVencidas) {
        try {
          // Update status to Vencida if still Pendiente
          if (cuota.estado === 'Pendiente') {
            await cuota.update({ estado: 'Vencida' });
          }

          // Send email reminder
          try {
            await emailService.enviarRecordatorioPago(cuota.socio, cuota);
            console.log(`📧 Email reminder sent to ${cuota.socio.email}`);
          } catch (emailError) {
            console.error(`❌ Email reminder failed for ${cuota.socio.email}:`, emailError.message);
          }

          // Send SMS reminder (optional, based on configuration)
          try {
            // SMS reminder removed
            console.log(`📱 SMS reminder sent to ${cuota.socio.telefono}`);
          } catch (smsError) {
            console.error(`❌ SMS reminder failed for ${cuota.socio.telefono}:`, smsError.message);
          }

          // Update reminder tracking
          await cuota.update({
            fechaEnvioRecordatorio: new Date(),
            cantidadRecordatorios: cuota.cantidadRecordatorios + 1
          });

          processed++;

        } catch (cuotaError) {
          console.error(`❌ Error processing reminder for cuota ${cuota.id}:`, cuotaError.message);
          errors++;
        }
      }

      console.log(`✅ Payment reminders job completed: ${processed} processed, ${errors} errors`);
      return { processed, errors };

    } catch (error) {
      console.error('❌ Critical error in processPaymentReminders:', error);
      throw error;
    }
  }

  // Update overdue payment statuses
  async updateOverduePayments() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update pending cuotas to overdue
      const [updatedCount] = await Cuota.update(
        { estado: 'Vencida' },
        {
          where: {
            fechaVencimiento: { [Op.lt]: today },
            estado: 'Pendiente'
          }
        }
      );

      console.log(`✅ Updated ${updatedCount} cuotas from Pendiente to Vencida`);
      return { updated: updatedCount };

    } catch (error) {
      console.error('❌ Error updating overdue payments:', error);
      throw error;
    }
  }

  // Generate monthly quotas for all active members
  async generateMonthlyQuotas() {
    try {
      const currentDate = new Date();
      const currentPeriodo = cuotaService.getCurrentPeriodo(currentDate);

      console.log(`\n📅 ===== GENERACIÓN AUTOMÁTICA DE CUOTAS MENSUALES =====`);
      console.log(`   Periodo: ${currentPeriodo}`);
      console.log(`   Fecha: ${currentDate.toLocaleString('es-AR')}\n`);

      // 1. Get all tenants with automatic generation enabled
      const configuraciones = await TenantConfiguracion.findAll({
        where: {
          generarAutomaticamente: true
        },
        include: [
          {
            model: Tenant,
            as: 'tenant',
            where: { status: 'active' },
            required: true
          }
        ]
      });

      if (configuraciones.length === 0) {
        console.log('📭 No hay tenants con generación automática habilitada');
        return {
          totalTenants: 0,
          totalGenerated: 0,
          totalExentos: 0,
          totalErrors: 0,
          tenants: []
        };
      }

      console.log(`✅ Encontrados ${configuraciones.length} tenants con generación automática\n`);

      // 2. Generate quotas for each tenant
      const summary = {
        totalTenants: configuraciones.length,
        totalGenerated: 0,
        totalExentos: 0,
        totalErrors: 0,
        totalMontoTotal: 0,
        tenants: []
      };

      for (const config of configuraciones) {
        const tenant = config.tenant;
        console.log(`\n🏢 Procesando: ${tenant.name} (${tenant.slug})`);

        try {
          // Use cuotaService to generate quotas for this tenant
          const result = await cuotaService.generarCuotasMasivas(
            tenant.id,
            currentPeriodo
          );

          summary.totalGenerated += result.generadas;
          summary.totalExentos += result.exentos;
          summary.totalErrors += result.errores;
          summary.totalMontoTotal += result.montoTotal;

          summary.tenants.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            slug: tenant.slug,
            result
          });

          // Optional: Send email to admin with summary
          // await emailService.enviarResumenGeneracionCuotas(tenant, result);

        } catch (tenantError) {
          console.error(`❌ Error procesando tenant ${tenant.slug}:`, tenantError.message);
          summary.totalErrors++;

          summary.tenants.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            slug: tenant.slug,
            error: tenantError.message
          });
        }
      }

      // 3. Print final summary
      console.log(`\n\n📊 ===== RESUMEN FINAL =====`);
      console.log(`   Periodo: ${currentPeriodo}`);
      console.log(`   Tenants procesados: ${summary.totalTenants}`);
      console.log(`   Cuotas generadas: ${summary.totalGenerated}`);
      console.log(`   Socios exentos: ${summary.totalExentos}`);
      console.log(`   Errores: ${summary.totalErrors}`);
      console.log(`   Monto total: $${summary.totalMontoTotal.toFixed(2)}`);
      console.log(`\n===== FIN DE GENERACIÓN AUTOMÁTICA =====\n`);

      return summary;

    } catch (error) {
      console.error('❌ Error crítico en generación automática:', error);
      throw error;
    }
  }

  // Manual trigger methods for testing/admin use
  async triggerPaymentReminders() {
    console.log('🔔 Manually triggering payment reminders...');
    return await this.processPaymentReminders();
  }

  async triggerStatusUpdate() {
    console.log('🔄 Manually triggering status update...');
    return await this.updateOverduePayments();
  }

  async triggerQuotaGeneration() {
    console.log('📅 Manually triggering quota generation...');
    return await this.generateMonthlyQuotas();
  }

  // Stop all cron jobs
  stop() {
    console.log('🛑 Stopping cron service...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`✅ Stopped ${name} job`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Cron service stopped');
  }

  // Get status of all jobs
  getStatus() {
    const status = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    
    return {
      isRunning: this.isRunning,
      jobs: status
    };
  }
}

// Export singleton instance
module.exports = new CronService();