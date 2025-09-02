const { Op } = require('sequelize');
const { Socio, Cuota, sequelize } = require('../models');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');
const mercadoPagoService = require('../services/mercadoPagoService');
const emailService = require('../services/emailService');

const pagosController = {
  // GET /pagos - Get payment status for all socios
  obtenerEstadoPagos: asyncHandler(async (req, res) => {
    const {
      estado,
      actividad,
      fechaDesde,
      fechaHasta,
      page,
      limit
    } = req.query;

    // Build where conditions for cuotas
    const cuotaWhere = {};
    if (estado) {
      cuotaWhere.estado = estado;
    }
    if (fechaDesde) {
      cuotaWhere.fechaVencimiento = cuotaWhere.fechaVencimiento || {};
      cuotaWhere.fechaVencimiento[Op.gte] = fechaDesde;
    }
    if (fechaHasta) {
      cuotaWhere.fechaVencimiento = cuotaWhere.fechaVencimiento || {};
      cuotaWhere.fechaVencimiento[Op.lte] = fechaHasta;
    }

    // Build where conditions for socios
    const socioWhere = {};
    if (actividad) {
      socioWhere.actividad = actividad;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get cuotas with socio information
    const { count, rows: cuotas } = await Cuota.findAndCountAll({
      where: cuotaWhere,
      include: [{
        model: Socio,
        as: 'socio',
        where: socioWhere,
        required: true
      }],
      limit: limit,
      offset: offset,
      order: [['fechaVencimiento', 'DESC']],
      distinct: true
    });

    // Transform data
    const pagosData = cuotas.map(cuota => {
      const cuotaData = cuota.toJSON();
      cuotaData.socio.nombreCompleto = cuota.socio.getNombreCompleto();
      cuotaData.socio.edad = cuota.socio.getEdad();
      cuotaData.estaVencida = cuota.estaVencida();
      cuotaData.diasVencimiento = cuota.estaVencida() ? cuota.diasVencimiento() : 0;
      
      return cuotaData;
    });

    // Calculate pagination
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: pagosData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  }),

  // POST /pagos/enviar-link - Send payment links to selected socios
  enviarLinkPago: asyncHandler(async (req, res) => {
    const { sociosIds, incluirSMS = false, incluirEmail = true } = req.body;

    if (!incluirSMS && !incluirEmail) {
      throw new ValidationError('Debe incluir al menos un método de envío (SMS o Email)');
    }

    const resultados = [];
    const errores = [];

    // Process each socio
    for (const socioId of sociosIds) {
      try {
        // Get socio with pending cuotas
        const socio = await Socio.findByPk(socioId, {
          include: [{
            model: Cuota,
            as: 'cuotas',
            where: {
              estado: { [Op.in]: ['Pendiente', 'Vencida'] }
            },
            required: false,
            order: [['fechaVencimiento', 'ASC']]
          }]
        });

        if (!socio) {
          errores.push({
            socioId,
            error: 'Socio no encontrado'
          });
          continue;
        }

        if (!socio.cuotas || socio.cuotas.length === 0) {
          errores.push({
            socioId,
            error: 'No tiene cuotas pendientes'
          });
          continue;
        }

        // Process each pending cuota
        for (const cuota of socio.cuotas) {
          try {
            // Create MercadoPago payment link
            const mpResult = await mercadoPagoService.crearLinkPago(cuota, socio);
            
            // Update cuota with payment link
            await cuota.update({
              linkPago: mpResult.init_point,
              mercadoPagoId: mpResult.id
            });

            const envioResultados = {
              socioId: socio.id,
              cuotaId: cuota.id,
              nombreSocio: socio.getNombreCompleto(),
              periodo: cuota.periodo,
              linkPago: mpResult.init_point,
              email: null,
              sms: null
            };

            // Send email if requested
            if (incluirEmail) {
              try {
                const emailResult = await emailService.enviarEmailLinkPago(socio, cuota, mpResult.init_point);
                envioResultados.email = {
                  success: emailResult.success,
                  messageId: emailResult.messageId
                };
              } catch (emailError) {
                envioResultados.email = {
                  success: false,
                  error: emailError.message
                };
              }
            }

            // Send SMS if requested
            if (incluirSMS) {
              try {
                // SMS functionality removed
                envioResultados.sms = {
                  success: smsResult.success,
                  sid: smsResult.sid
                };
              } catch (smsError) {
                envioResultados.sms = {
                  success: false,
                  error: smsError.message
                };
              }
            }

            resultados.push(envioResultados);

          } catch (cuotaError) {
            errores.push({
              socioId,
              cuotaId: cuota.id,
              error: cuotaError.message
            });
          }
        }

      } catch (socioError) {
        errores.push({
          socioId,
          error: socioError.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        resultados,
        errores,
        resumen: {
          totalSocios: sociosIds.length,
          exitosos: resultados.length,
          conErrores: errores.length,
          emailsEnviados: resultados.filter(r => r.email?.success).length,
          smsEnviados: resultados.filter(r => r.sms?.success).length
        }
      },
      message: `Proceso completado. ${resultados.length} links enviados, ${errores.length} errores.`
    });
  }),

  // POST /pagos/webhook - MercadoPago webhook handler
  confirmarPago: asyncHandler(async (req, res) => {
    try {
      // Process webhook data
      const webhookResult = await mercadoPagoService.procesarWebhook(req.body);
      
      if (webhookResult.type !== 'payment') {
        return res.status(200).json({ success: true, message: 'Webhook processed but not a payment' });
      }

      const { payment } = webhookResult;

      if (!payment.external_reference) {
        return res.status(200).json({ success: true, message: 'No external reference found' });
      }

      // Extract cuota ID from external reference (format: CCE-{cuotaId}-{timestamp})
      const referenceMatch = payment.external_reference.match(/CCE-(\d+)-/);
      if (!referenceMatch) {
        return res.status(200).json({ success: true, message: 'Invalid external reference format' });
      }

      const cuotaId = parseInt(referenceMatch[1]);
      
      // Find the cuota
      const cuota = await Cuota.findByPk(cuotaId, {
        include: [{
          model: Socio,
          as: 'socio',
          required: true
        }]
      });

      if (!cuota) {
        return res.status(200).json({ success: true, message: 'Cuota not found' });
      }

      // Update cuota based on payment status
      if (webhookResult.isApproved) {
        await cuota.update({
          estado: 'Pagada',
          metodoPago: 'MercadoPago',
          fechaPago: new Date(),
          numeroRecibo: cuota.generarNumeroRecibo(),
          mercadoPagoId: payment.id
        });

        // Send confirmation email and SMS
        try {
          await emailService.enviarConfirmacionPago(cuota.socio, cuota, payment);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }

        try {
          // SMS confirmation removed
        } catch (smsError) {
          console.error('Error sending confirmation SMS:', smsError);
        }

      } else if (webhookResult.isRejected) {
        // Payment was rejected - keep cuota as pending/overdue
        console.log(`Payment rejected for cuota ${cuotaId}:`, payment.status_detail);
      }

      res.status(200).json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(200).json({ success: true, message: 'Webhook received but processing failed' });
    }
  }),

  // POST /pagos/programar-recordatorios - Setup payment reminders cron job
  programarRecordatorios: asyncHandler(async (req, res) => {
    // This endpoint will be used to manually trigger reminders
    // The actual cron job setup is in a separate service
    
    try {
      // Find overdue cuotas
      const today = new Date().toISOString().split('T')[0];
      
      const cuotasVencidas = await Cuota.findAll({
        where: {
          fechaVencimiento: { [Op.lt]: today },
          estado: { [Op.in]: ['Pendiente', 'Vencida'] },
          [Op.or]: [
            { fechaEnvioRecordatorio: null },
            { 
              fechaEnvioRecordatorio: { 
                [Op.lt]: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
              } 
            }
          ]
        },
        include: [{
          model: Socio,
          as: 'socio',
          where: { estado: 'Activo' },
          required: true
        }],
        limit: 50 // Process in batches
      });

      const resultados = [];
      const errores = [];

      for (const cuota of cuotasVencidas) {
        try {
          // Update cuota status to Vencida if it's still Pendiente
          if (cuota.estado === 'Pendiente') {
            await cuota.update({ estado: 'Vencida' });
          }

          const envioResultado = {
            cuotaId: cuota.id,
            socioId: cuota.socio.id,
            nombreSocio: cuota.socio.getNombreCompleto(),
            periodo: cuota.periodo,
            diasVencimiento: cuota.diasVencimiento(),
            email: null,
            sms: null
          };

          // Send email reminder
          try {
            const emailResult = await emailService.enviarRecordatorioPago(cuota.socio, cuota);
            envioResultado.email = {
              success: emailResult.success,
              messageId: emailResult.messageId
            };
          } catch (emailError) {
            envioResultado.email = {
              success: false,
              error: emailError.message
            };
          }

          // Send SMS reminder
          try {
            // SMS reminder removed
            envioResultado.sms = {
              success: smsResult.success,
              sid: smsResult.sid
            };
          } catch (smsError) {
            envioResultado.sms = {
              success: false,
              error: smsError.message
            };
          }

          // Update cuota reminder info
          await cuota.update({
            fechaEnvioRecordatorio: new Date(),
            cantidadRecordatorios: cuota.cantidadRecordatorios + 1
          });

          resultados.push(envioResultado);

        } catch (cuotaError) {
          errores.push({
            cuotaId: cuota.id,
            error: cuotaError.message
          });
        }
      }

      res.json({
        success: true,
        data: {
          resultados,
          errores,
          resumen: {
            totalCuotasProcesadas: cuotasVencidas.length,
            recordatoriosEnviados: resultados.length,
            errores: errores.length,
            emailsEnviados: resultados.filter(r => r.email?.success).length,
            smsEnviados: resultados.filter(r => r.sms?.success).length
          }
        },
        message: `Recordatorios procesados: ${resultados.length} enviados, ${errores.length} errores.`
      });

    } catch (error) {
      console.error('Error processing reminders:', error);
      throw error;
    }
  }),

  // GET /pagos/estadisticas - Get payment statistics
  obtenerEstadisticasPagos: asyncHandler(async (req, res) => {
    // Current month statistics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const estadisticasMes = await Cuota.findAll({
      attributes: [
        'estado',
        [Cuota.sequelize.fn('COUNT', Cuota.sequelize.col('id')), 'cantidad'],
        [Cuota.sequelize.fn('SUM', Cuota.sequelize.col('monto')), 'total']
      ],
      where: {
        periodo: currentMonth
      },
      group: ['estado']
    });

    // Overall statistics
    const estadisticasGenerales = await Cuota.findAll({
      attributes: [
        'estado',
        [Cuota.sequelize.fn('COUNT', Cuota.sequelize.col('id')), 'cantidad'],
        [Cuota.sequelize.fn('SUM', Cuota.sequelize.col('monto')), 'total']
      ],
      group: ['estado']
    });

    // Payment methods statistics
    const metodosPago = await Cuota.findAll({
      attributes: [
        'metodoPago',
        [Cuota.sequelize.fn('COUNT', Cuota.sequelize.col('id')), 'cantidad'],
        [Cuota.sequelize.fn('SUM', Cuota.sequelize.col('monto')), 'total']
      ],
      where: {
        estado: 'Pagada',
        metodoPago: { [Op.ne]: null }
      },
      group: ['metodoPago']
    });

    // Monthly trend (last 12 months)
    const tendenciaMensual = await Cuota.findAll({
      attributes: [
        'periodo',
        [Cuota.sequelize.fn('COUNT', Cuota.sequelize.col('id')), 'totalCuotas'],
        [
          Cuota.sequelize.fn('COUNT', 
            Cuota.sequelize.literal("CASE WHEN estado = 'Pagada' THEN 1 END")
          ), 'cuotasPagadas'
        ],
        [
          Cuota.sequelize.fn('SUM', 
            Cuota.sequelize.literal("CASE WHEN estado = 'Pagada' THEN monto ELSE 0 END")
          ), 'ingresoReal'
        ],
        [Cuota.sequelize.fn('SUM', Cuota.sequelize.col('monto')), 'ingresoEsperado']
      ],
      group: ['periodo'],
      order: [['periodo', 'DESC']],
      limit: 12
    });

    res.json({
      success: true,
      data: {
        mesActual: {
          periodo: currentMonth,
          estadisticas: estadisticasMes.map(item => ({
            estado: item.estado,
            cantidad: parseInt(item.dataValues.cantidad),
            total: parseFloat(item.dataValues.total || 0)
          }))
        },
        general: {
          estadisticas: estadisticasGenerales.map(item => ({
            estado: item.estado,
            cantidad: parseInt(item.dataValues.cantidad),
            total: parseFloat(item.dataValues.total || 0)
          }))
        },
        metodosPago: metodosPago.map(item => ({
          metodo: item.metodoPago,
          cantidad: parseInt(item.dataValues.cantidad),
          total: parseFloat(item.dataValues.total || 0)
        })),
        tendenciaMensual: tendenciaMensual.map(item => ({
          periodo: item.periodo,
          totalCuotas: parseInt(item.dataValues.totalCuotas),
          cuotasPagadas: parseInt(item.dataValues.cuotasPagadas),
          tasaCobranza: item.dataValues.totalCuotas > 0 ? 
            ((item.dataValues.cuotasPagadas / item.dataValues.totalCuotas) * 100).toFixed(2) : 0,
          ingresoReal: parseFloat(item.dataValues.ingresoReal || 0),
          ingresoEsperado: parseFloat(item.dataValues.ingresoEsperado || 0)
        }))
      }
    });
  })
};

module.exports = pagosController;