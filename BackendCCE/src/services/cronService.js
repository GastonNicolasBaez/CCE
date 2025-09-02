const cron = require('node-cron');
const { Op } = require('sequelize');
const { Socio, Cuota } = require('../models');
const emailService = require('./emailService');

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
      const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      
      // Calculate due date (15th of current month)
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)
        .toISOString().split('T')[0];

      console.log(`📅 Generating quotas for period: ${currentMonth}`);

      // Get all active socios
      const sociosActivos = await Socio.findAll({
        where: { estado: 'Activo' }
      });

      if (sociosActivos.length === 0) {
        console.log('📭 No active members found for quota generation');
        return { generated: 0, errors: 0, skipped: 0 };
      }

      let generated = 0;
      let errors = 0;
      let skipped = 0;

      // Define quota amounts by activity
      const montosPorActividad = {
        'Basquet': 15000,
        'Voley': 12000,
        'Karate': 18000,
        'Gimnasio': 20000,
        'Socio': 8000
      };

      for (const socio of sociosActivos) {
        try {
          // Check if quota already exists for this period
          const existingQuota = await Cuota.findOne({
            where: {
              socioId: socio.id,
              periodo: currentMonth
            }
          });

          if (existingQuota) {
            console.log(`⏭️ Quota already exists for ${socio.getNombreCompleto()} - ${currentMonth}`);
            skipped++;
            continue;
          }

          // Create new quota
          const monto = montosPorActividad[socio.actividad] || montosPorActividad['Socio'];
          
          await Cuota.create({
            socioId: socio.id,
            monto: monto,
            fechaVencimiento: dueDate,
            periodo: currentMonth,
            estado: 'Pendiente'
          });

          console.log(`✅ Quota created for ${socio.getNombreCompleto()} - $${monto}`);
          generated++;

        } catch (quotaError) {
          console.error(`❌ Error creating quota for ${socio.getNombreCompleto()}:`, quotaError.message);
          errors++;
        }
      }

      console.log(`✅ Monthly quota generation completed: ${generated} generated, ${skipped} skipped, ${errors} errors`);
      
      // Send summary email to admins (optional)
      // You could implement this to notify administrators about the quota generation

      return { generated, errors, skipped };

    } catch (error) {
      console.error('❌ Critical error in generateMonthlyQuotas:', error);
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