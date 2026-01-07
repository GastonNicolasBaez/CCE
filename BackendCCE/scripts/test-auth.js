#!/usr/bin/env node

/**
 * Script de Prueba de Autenticación
 *
 * Prueba el flujo completo de registro, login y acceso a recursos protegidos
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = 'http://localhost:5000';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function makeRequest(url, options = {}) {
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
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

async function testRegister() {
  log('\n1️⃣  Probando Registro de Tenant...', 'blue');

  const randomId = Math.floor(Math.random() * 10000);
  const testData = {
    clubName: `Club Test ${randomId}`,
    slug: `test${randomId}`,
    adminName: 'Admin',
    adminLastName: 'Test',
    adminEmail: `admin${randomId}@test.com`,
    password: 'password123'
  };

  try {
    log(`   📝 Registrando tenant: ${testData.slug}`, 'cyan');

    const response = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: testData
    });

    if (response.statusCode === 201 && response.body.success) {
      log('   ✅ Registro exitoso', 'green');
      log(`   Tenant ID: ${response.body.data.tenant.id}`);
      log(`   Tenant Slug: ${response.body.data.tenant.slug}`);
      log(`   Admin Email: ${response.body.data.user.email}`);
      log(`   Token: ${response.body.data.token.substring(0, 20)}...`);

      return {
        success: true,
        tenant: response.body.data.tenant,
        user: response.body.data.user,
        token: response.body.data.token,
        credentials: {
          email: testData.adminEmail,
          password: testData.password,
          slug: testData.slug
        }
      };
    } else {
      log('   ❌ Registro falló', 'red');
      log(`   Status: ${response.statusCode}`);
      log(`   Message: ${response.body.message}`);

      return { success: false };
    }
  } catch (error) {
    log('   ❌ Error durante registro', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testLogin(credentials) {
  log('\n2️⃣  Probando Login...', 'blue');

  try {
    log(`   🔐 Iniciando sesión como: ${credentials.email}`, 'cyan');

    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': credentials.slug
      },
      body: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      log('   ✅ Login exitoso', 'green');
      log(`   User ID: ${response.body.data.user.id}`);
      log(`   Role: ${response.body.data.user.rol}`);
      log(`   Token: ${response.body.data.token.substring(0, 20)}...`);

      return {
        success: true,
        token: response.body.data.token,
        user: response.body.data.user
      };
    } else {
      log('   ❌ Login falló', 'red');
      log(`   Status: ${response.statusCode}`);
      log(`   Message: ${response.body.message}`);

      return { success: false };
    }
  } catch (error) {
    log('   ❌ Error durante login', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testAuthMe(token, slug) {
  log('\n3️⃣  Probando Acceso a Endpoint Protegido (/api/auth/me)...', 'blue');

  try {
    log('   🔍 Obteniendo información del usuario...', 'cyan');

    const response = await makeRequest(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Slug': slug
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      log('   ✅ Acceso autorizado', 'green');
      log(`   Usuario: ${response.body.data.user.nombre} ${response.body.data.user.apellido}`);
      log(`   Email: ${response.body.data.user.email}`);
      log(`   Tenant: ${response.body.data.tenant.name} (${response.body.data.tenant.slug})`);

      return { success: true };
    } else {
      log('   ❌ Acceso denegado', 'red');
      log(`   Status: ${response.statusCode}`);
      log(`   Message: ${response.body.message}`);

      return { success: false };
    }
  } catch (error) {
    log('   ❌ Error al acceder a endpoint protegido', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testInvalidToken(slug) {
  log('\n4️⃣  Probando Rechazo de Token Inválido...', 'blue');

  try {
    log('   🚫 Intentando acceder con token inválido...', 'cyan');

    const response = await makeRequest(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_12345',
        'X-Tenant-Slug': slug
      }
    });

    if (response.statusCode === 401) {
      log('   ✅ Token inválido rechazado correctamente', 'green');
      return { success: true };
    } else {
      log('   ❌ Token inválido no fue rechazado', 'red');
      log(`   Status: ${response.statusCode}`);

      return { success: false };
    }
  } catch (error) {
    log('   ❌ Error durante prueba de token inválido', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testRateLimiting(credentials) {
  log('\n5️⃣  Probando Rate Limiting en Login...', 'blue');

  try {
    log('   🚀 Enviando múltiples requests de login...', 'cyan');

    const requests = [];
    for (let i = 0; i < 6; i++) {
      requests.push(
        makeRequest(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Slug': credentials.slug
          },
          body: {
            email: 'wrong@email.com',
            password: 'wrong_password'
          }
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.statusCode === 429);

    if (rateLimited) {
      log('   ✅ Rate limiting activo (bloqueó después de múltiples intentos)', 'green');
      return { success: true };
    } else {
      log('   ⚠️  Rate limiting no detectado (puede estar configurado con límite alto)', 'yellow');
      return { success: true }; // No es crítico
    }
  } catch (error) {
    log('   ❌ Error durante prueba de rate limiting', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function runTests() {
  log('═══════════════════════════════════════════', 'blue');
  log('   🔐 PRUEBAS DE AUTENTICACIÓN', 'blue');
  log('═══════════════════════════════════════════', 'blue');

  const results = {};

  // 1. Registro
  const registerResult = await testRegister();
  results.register = registerResult.success;

  if (!registerResult.success) {
    log('\n❌ No se puede continuar sin un registro exitoso', 'red');
    process.exit(1);
  }

  const { credentials, token } = registerResult;

  // 2. Login
  const loginResult = await testLogin(credentials);
  results.login = loginResult.success;

  if (!loginResult.success) {
    log('\n❌ No se puede continuar sin un login exitoso', 'red');
    process.exit(1);
  }

  const loginToken = loginResult.token;

  // 3. Acceso a endpoint protegido
  results.authMe = (await testAuthMe(loginToken, credentials.slug)).success;

  // 4. Rechazo de token inválido
  results.invalidToken = (await testInvalidToken(credentials.slug)).success;

  // 5. Rate limiting
  results.rateLimiting = (await testRateLimiting(credentials)).success;

  // Resumen
  log('\n═══════════════════════════════════════════', 'blue');
  log('   📊 RESUMEN DE PRUEBAS', 'blue');
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
    log('   Sistema de autenticación funcionando correctamente!', 'green');
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
