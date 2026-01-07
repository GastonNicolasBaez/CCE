#!/usr/bin/env node

/**
 * Script de Verificación del Backend
 *
 * Verifica que el backend esté corriendo y todos los servicios funcionen correctamente
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n🔍 Probando Health Check...', 'blue');

  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);

    if (response.statusCode === 200 && response.body.success) {
      log('✅ Health check exitoso', 'green');
      log(`   Server uptime: ${response.body.uptime?.toFixed(2)}s`);
      log(`   Database: ${response.body.services?.database}`);
      return true;
    } else {
      log('❌ Health check falló', 'red');
      log(`   Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    log('❌ No se pudo conectar al backend', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   ¿Está el servidor corriendo en ${BACKEND_URL}?`, 'yellow');
    return false;
  }
}

async function testSecurityHeaders() {
  log('\n🔒 Verificando Headers de Seguridad...', 'blue');

  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const headers = response.headers;

    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'x-xss-protection'
    ];

    let allPresent = true;

    for (const header of requiredHeaders) {
      if (headers[header]) {
        log(`   ✅ ${header}: ${headers[header]}`, 'green');
      } else {
        log(`   ❌ ${header}: No presente`, 'red');
        allPresent = false;
      }
    }

    return allPresent;
  } catch (error) {
    log('❌ Error al verificar headers', 'red');
    return false;
  }
}

async function testCORS() {
  log('\n🌐 Verificando CORS...', 'blue');

  try {
    const response = await makeRequest(`${BACKEND_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const corsHeader = response.headers['access-control-allow-origin'];

    if (corsHeader) {
      log(`   ✅ CORS configurado: ${corsHeader}`, 'green');
      return true;
    } else {
      log('   ❌ CORS no configurado', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Error al verificar CORS', 'red');
    return false;
  }
}

async function testAuthEndpoints() {
  log('\n🔐 Verificando Endpoints de Autenticación...', 'blue');

  // Test register endpoint (should fail validation but endpoint should be accessible)
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {}
    });

    // 400 is expected (validation error), 404 would mean endpoint doesn't exist
    if (response.statusCode === 400 || response.statusCode === 422) {
      log('   ✅ POST /api/auth/register - endpoint accesible', 'green');
    } else if (response.statusCode === 404) {
      log('   ❌ POST /api/auth/register - endpoint no encontrado', 'red');
      return false;
    } else {
      log(`   ⚠️  POST /api/auth/register - respuesta inesperada: ${response.statusCode}`, 'yellow');
    }
  } catch (error) {
    log('   ❌ Error al probar /api/auth/register', 'red');
    return false;
  }

  // Test login endpoint
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': 'test'
      },
      body: {}
    });

    // 400, 401, or 422 are expected
    if ([400, 401, 422].includes(response.statusCode)) {
      log('   ✅ POST /api/auth/login - endpoint accesible', 'green');
    } else if (response.statusCode === 404) {
      log('   ❌ POST /api/auth/login - endpoint no encontrado', 'red');
      return false;
    } else {
      log(`   ⚠️  POST /api/auth/login - respuesta inesperada: ${response.statusCode}`, 'yellow');
    }
  } catch (error) {
    log('   ❌ Error al probar /api/auth/login', 'red');
    return false;
  }

  return true;
}

async function runTests() {
  log('═══════════════════════════════════════════', 'blue');
  log('   🧪 VERIFICACIÓN DE BACKEND', 'blue');
  log('═══════════════════════════════════════════', 'blue');

  const results = {
    healthCheck: await testHealthCheck(),
    securityHeaders: await testSecurityHeaders(),
    cors: await testCORS(),
    authEndpoints: await testAuthEndpoints()
  };

  log('\n═══════════════════════════════════════════', 'blue');
  log('   📊 RESUMEN DE RESULTADOS', 'blue');
  log('═══════════════════════════════════════════', 'blue');

  const allPassed = Object.values(results).every(r => r === true);

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`   ${status} - ${test}`, color);
  });

  log('\n═══════════════════════════════════════════', 'blue');

  if (allPassed) {
    log('   ✅ TODAS LAS PRUEBAS PASARON', 'green');
    log('   Backend está funcionando correctamente!', 'green');
    process.exit(0);
  } else {
    log('   ❌ ALGUNAS PRUEBAS FALLARON', 'red');
    log('   Revisa los errores arriba', 'red');
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  log('\n❌ Error fatal durante las pruebas:', 'red');
  console.error(error);
  process.exit(1);
});
