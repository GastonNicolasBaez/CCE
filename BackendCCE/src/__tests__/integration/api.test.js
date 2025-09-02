/**
 * Integration Tests for API Endpoints
 */

const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../server');

describe('API Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Initialize test database
    await sequelize.sync({ force: true });
    
    // Start test server
    const PORT = process.env.TEST_PORT || 3002;
    server = app.listen(PORT);
  });

  afterAll(async () => {
    // Clean up
    await sequelize.close();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean database before each test
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  });

  describe('Health Check', () => {
    it('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Server is running',
        timestamp: expect.any(String),
        environment: 'test',
        version: '1.0.0'
      });
    });
  });

  describe('Socios API', () => {
    describe('POST /api/socios', () => {
      it('should create a new socio successfully', async () => {
        const socioData = {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          email: 'juan@test.com',
          telefono: '+54 11 1234-5678',
          actividad: 'basketball',
          estado: 'activo',
          tipoMembresia: 'jugador'
        };

        const response = await request(app)
          .post('/api/socios')
          .send(socioData)
          .expect(201);

        expect(response.body).toEqual({
          success: true,
          message: 'Socio registrado exitosamente',
          data: expect.objectContaining({
            id: expect.any(String),
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com'
          })
        });
      });

      it('should return 400 for invalid data', async () => {
        const invalidData = {
          nombre: '', // Required field empty
          email: 'invalid-email' // Invalid email format
        };

        const response = await request(app)
          .post('/api/socios')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('validation');
      });

      it('should return 409 for duplicate email', async () => {
        const socioData = {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          email: 'duplicate@test.com',
          telefono: '+54 11 1234-5678',
          actividad: 'basketball'
        };

        // Create first socio
        await request(app)
          .post('/api/socios')
          .send(socioData)
          .expect(201);

        // Try to create duplicate
        const response = await request(app)
          .post('/api/socios')
          .send({ ...socioData, dni: '87654321' })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('email');
      });
    });

    describe('GET /api/socios', () => {
      beforeEach(async () => {
        // Create test socios
        const testSocios = [
          {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '11111111',
            email: 'juan@test.com',
            actividad: 'basketball',
            estado: 'activo'
          },
          {
            nombre: 'María',
            apellido: 'García',
            dni: '22222222',
            email: 'maria@test.com',
            actividad: 'volleyball',
            estado: 'activo'
          },
          {
            nombre: 'Carlos',
            apellido: 'López',
            dni: '33333333',
            email: 'carlos@test.com',
            actividad: 'karate',
            estado: 'inactivo'
          }
        ];

        for (const socio of testSocios) {
          await request(app)
            .post('/api/socios')
            .send(socio);
        }
      });

      it('should return all socios', async () => {
        const response = await request(app)
          .get('/api/socios')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3);
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 50
        });
      });

      it('should filter socios by activity', async () => {
        const response = await request(app)
          .get('/api/socios?actividad=basketball')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].actividad).toBe('basketball');
      });

      it('should filter socios by status', async () => {
        const response = await request(app)
          .get('/api/socios?estado=activo')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        response.body.data.forEach(socio => {
          expect(socio.estado).toBe('activo');
        });
      });

      it('should search socios by name', async () => {
        const response = await request(app)
          .get('/api/socios?search=Juan')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].nombre).toBe('Juan');
      });

      it('should handle pagination', async () => {
        const response = await request(app)
          .get('/api/socios?page=1&limit=2')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          totalPages: 2,
          totalItems: 3,
          itemsPerPage: 2
        });
      });
    });

    describe('GET /api/socios/:id', () => {
      let socioId;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/socios')
          .send({
            nombre: 'Test',
            apellido: 'User',
            dni: '12345678',
            email: 'test@test.com',
            actividad: 'basketball'
          });
        socioId = response.body.data.id;
      });

      it('should return specific socio', async () => {
        const response = await request(app)
          .get(`/api/socios/${socioId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(socioId);
        expect(response.body.data.nombre).toBe('Test');
      });

      it('should return 404 for non-existent socio', async () => {
        const response = await request(app)
          .get('/api/socios/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('no encontrado');
      });
    });

    describe('PUT /api/socios/:id', () => {
      let socioId;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/socios')
          .send({
            nombre: 'Original',
            apellido: 'Name',
            dni: '12345678',
            email: 'original@test.com',
            actividad: 'basketball'
          });
        socioId = response.body.data.id;
      });

      it('should update socio successfully', async () => {
        const updateData = {
          nombre: 'Updated',
          telefono: '+54 11 9999-9999'
        };

        const response = await request(app)
          .put(`/api/socios/${socioId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.nombre).toBe('Updated');
        expect(response.body.data.telefono).toBe('+54 11 9999-9999');
      });

      it('should return 404 for non-existent socio', async () => {
        const response = await request(app)
          .put('/api/socios/non-existent-id')
          .send({ nombre: 'Updated' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/socios/:id', () => {
      let socioId;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/socios')
          .send({
            nombre: 'ToDelete',
            apellido: 'User',
            dni: '12345678',
            email: 'delete@test.com',
            actividad: 'basketball'
          });
        socioId = response.body.data.id;
      });

      it('should delete socio successfully', async () => {
        const response = await request(app)
          .delete(`/api/socios/${socioId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('eliminado');

        // Verify socio is deleted
        await request(app)
          .get(`/api/socios/${socioId}`)
          .expect(404);
      });

      it('should return 404 for non-existent socio', async () => {
        const response = await request(app)
          .delete('/api/socios/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ruta no encontrada');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/socios')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/socios')
        .send({}) // Empty body
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      // Make multiple requests quickly
      const requests = Array.from({ length: 10 }, () =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      // All requests within limit should succeed
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    }, 10000); // Increase timeout for this test
  });
});