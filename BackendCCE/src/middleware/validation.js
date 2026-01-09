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
    actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio').required(),
    esJugador: Joi.boolean().required()
  }),

  socioUpdate: Joi.object({
    nombre: Joi.string().min(2).max(100),
    apellido: Joi.string().min(2).max(100),
    dni: Joi.string().pattern(/^\d{7,20}$/),
    fechaNacimiento: Joi.date().iso().max('now'),
    telefono: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/),
    email: Joi.string().email().max(150),
    actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'),
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
    estado: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Cancelada'),
    metodoPago: Joi.string().valid('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
    observaciones: Joi.string().max(500).allow('')
  }),

  // Actividad schemas
  actividad: Joi.object({
    nombre: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'El nombre de la actividad debe tener al menos 2 caracteres',
        'string.max': 'El nombre de la actividad no puede exceder 100 caracteres',
        'any.required': 'El nombre de la actividad es requerido'
      }),
    monto: Joi.number().min(0).precision(2).required()
      .messages({
        'number.min': 'El monto debe ser mayor o igual a 0',
        'any.required': 'El monto es requerido'
      }),
    descripcion: Joi.string().max(500).allow('').optional(),
    orden: Joi.number().integer().min(0).default(0)
  }),

  actividadUpdate: Joi.object({
    nombre: Joi.string().min(2).max(100),
    monto: Joi.number().min(0).precision(2),
    descripcion: Joi.string().max(500).allow('').optional(),
    orden: Joi.number().integer().min(0),
    activa: Joi.boolean()
  }),

  enviarLinkPago: Joi.object({
    sociosIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    incluirSMS: Joi.boolean().default(false),
    incluirEmail: Joi.boolean().default(true)
  }),

  // Authentication schemas
  register: Joi.object({
    // Tenant data
    clubName: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'El nombre del club debe tener al menos 3 caracteres',
        'string.max': 'El nombre del club no puede exceder 100 caracteres',
        'any.required': 'El nombre del club es requerido'
      }),
    slug: Joi.string().min(3).max(50).pattern(/^[a-z0-9-]+$/).required()
      .messages({
        'string.min': 'El slug debe tener al menos 3 caracteres',
        'string.max': 'El slug no puede exceder 50 caracteres',
        'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones',
        'any.required': 'El slug es requerido'
      }),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).allow('').optional()
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido'
      }),

    // Admin user data
    adminName: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre del administrador es requerido'
      }),
    adminLastName: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 100 caracteres',
        'any.required': 'El apellido del administrador es requerido'
      }),
    adminEmail: Joi.string().email().max(150).required()
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.max': 'El email no puede exceder 150 caracteres',
        'any.required': 'El email del administrador es requerido'
      }),
    password: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 100 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
        'any.required': 'La contraseña es requerida'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().max(150).required()
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.max': 'El email no puede exceder 150 caracteres',
        'any.required': 'El email es requerido'
      }),
    password: Joi.string().min(1).required()
      .messages({
        'any.required': 'La contraseña es requerida'
      })
  }),

  verifyToken: Joi.object({
    token: Joi.string().required()
      .messages({
        'any.required': 'El token es requerido'
      })
  }),

  params: {
    id: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  },

  query: {
    socios: Joi.object({
      actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'),
      estado: Joi.string().valid('Activo', 'Inactivo', 'Suspendido'),
      estadoCuota: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Cancelada'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().max(100).allow('')
    }),

    pagos: Joi.object({
      estado: Joi.string().valid('Pendiente', 'Pagada', 'Vencida', 'Cancelada'),
      actividad: Joi.string().valid('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'),
      fechaDesde: Joi.date().iso(),
      fechaHasta: Joi.date().iso(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    }),

    actividades: Joi.object({
      activa: Joi.string().valid('true', 'false', 'all').default('true'),
      search: Joi.string().max(100).allow(''),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(100),
      orderBy: Joi.string().valid('orden', 'nombre', 'monto', 'created_at').default('orden'),
      orderDir: Joi.string().valid('ASC', 'DESC').default('ASC')
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