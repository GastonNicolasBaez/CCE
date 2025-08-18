const Joi = require('joi');

// Validation schemas
const schemas = {
  socio: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    dni: Joi.string().pattern(/^\d{7,20}$/).required(),
    fechaNacimiento: Joi.date().iso().max('now').required(),
    telefono: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).required(),
    email: Joi.string().email().max(150).required(),
    actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio').required(),
    esJugador: Joi.boolean().required()
  }),

  socioUpdate: Joi.object({
    nombre: Joi.string().min(2).max(100),
    apellido: Joi.string().min(2).max(100),
    dni: Joi.string().pattern(/^\d{7,20}$/),
    fechaNacimiento: Joi.date().iso().max('now'),
    telefono: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/),
    email: Joi.string().email().max(150),
    actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio'),
    esJugador: Joi.boolean(),
    estado: Joi.string().valid('Activo', 'Inactivo', 'Suspendido')
  }),

  cuota: Joi.object({
    socioId: Joi.number().integer().positive().required(),
    monto: Joi.number().positive().precision(2).required(),
    fechaVencimiento: Joi.date().iso().required(),
    periodo: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    observaciones: Joi.string().max(500).allow('')
  }),

  cuotaUpdate: Joi.object({
    monto: Joi.number().positive().precision(2),
    fechaVencimiento: Joi.date().iso(),
    estado: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Anulada'),
    metodoPago: Joi.string().valid('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
    observaciones: Joi.string().max(500).allow('')
  }),

  enviarLinkPago: Joi.object({
    sociosIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    incluirSMS: Joi.boolean().default(false),
    incluirEmail: Joi.boolean().default(true)
  }),

  params: {
    id: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  },

  query: {
    socios: Joi.object({
      actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio'),
      estado: Joi.string().valid('Activo', 'Inactivo', 'Suspendido'),
      estadoCuota: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Anulada'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().max(100).allow('')
    }),
    
    pagos: Joi.object({
      estado: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Anulada'),
      actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio'),
      fechaDesde: Joi.date().iso(),
      fechaHasta: Joi.date().iso(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  }
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let data;
    
    switch (source) {
      case 'body':
        data = req.body;
        break;
      case 'params':
        data = req.params;
        break;
      case 'query':
        data = req.query;
        break;
      default:
        data = req.body;
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace the original data with validated/sanitized data
    switch (source) {
      case 'body':
        req.body = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'query':
        req.query = value;
        break;
    }

    next();
  };
};

module.exports = {
  schemas,
  validate
};