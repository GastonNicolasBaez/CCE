const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/sociosController');
const { validate, schemas } = require('../middleware/validation');

// GET /api/socios - Get all socios with filtering and pagination
router.get('/', 
  validate(schemas.query.socios, 'query'),
  sociosController.obtenerSocios
);

// GET /api/socios/estadisticas - Get general statistics
router.get('/estadisticas', sociosController.obtenerEstadisticas);

// GET /api/socios/:id - Get single socio by ID
router.get('/:id', 
  validate(schemas.params.id, 'params'),
  sociosController.obtenerSocioPorId
);

// POST /api/socios - Create new socio
router.post('/', 
  validate(schemas.socio, 'body'),
  sociosController.crearSocio
);

// PUT /api/socios/:id - Update socio
router.put('/:id', 
  validate(schemas.params.id, 'params'),
  validate(schemas.socioUpdate, 'body'),
  sociosController.actualizarSocio
);

// DELETE /api/socios/:id - Delete socio
router.delete('/:id', 
  validate(schemas.params.id, 'params'),
  sociosController.eliminarSocio
);

module.exports = router;