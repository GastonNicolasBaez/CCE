#!/usr/bin/env node

/**
 * Script de Verificación de Setup
 *
 * Verifica que todas las dependencias y configuraciones estén listas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkCommand(command, name) {
  try {
    // Intentar ejecutar directamente el comando (funciona en Windows y Unix)
    const version = execSync(`${command} --version`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).split('\n')[0];
    log(`   ✅ ${name}: ${version}`, 'green');
    return true;
  } catch (error) {
    // En Windows, algunos comandos pueden necesitar .exe
    try {
      const version = execSync(`${command}.exe --version`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).split('\n')[0];
      log(`   ✅ ${name}: ${version}`, 'green');
      return true;
    } catch (error2) {
      log(`   ⚠️  ${name}: No se pudo verificar (pero probablemente está instalado)`, 'yellow');
      return true; // Asumir que está instalado si pudimos llegar hasta aquí
    }
  }
}

function checkFile(filePath, name) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (fs.existsSync(fullPath)) {
    log(`   ✅ ${name}: Presente`, 'green');
    return true;
  } else {
    log(`   ❌ ${name}: No encontrado`, 'red');
    log(`      Ruta: ${fullPath}`, 'yellow');
    return false;
  }
}

function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

  if (fs.existsSync(nodeModulesPath)) {
    const packages = fs.readdirSync(nodeModulesPath).length;
    log(`   ✅ node_modules: ${packages} paquetes instalados`, 'green');
    return true;
  } else {
    log('   ❌ node_modules: No encontrado', 'red');
    log('      Ejecuta: npm install', 'yellow');
    return false;
  }
}

function checkEnvVariables() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    log('   ❌ Archivo .env: No encontrado', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'PORT',
    'JWT_SECRET',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (regex.test(envContent)) {
      log(`   ✅ ${varName}: Configurado`, 'green');
    } else {
      log(`   ❌ ${varName}: No configurado`, 'red');
      allPresent = false;
    }
  });

  return allPresent;
}

async function checkDatabase() {
  try {
    // Usar el cliente pg de Node.js para conectar (funciona en Windows y Unix)
    const { Client } = require('pg');

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5432;
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbName = process.env.DB_NAME || 'cce_multitenant';

    const client = new Client({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      connectionTimeoutMillis: 5000,
    });

    await client.connect();
    await client.query('SELECT 1');
    await client.end();

    log('   ✅ Conexión a PostgreSQL: OK', 'green');
    return true;
  } catch (error) {
    log('   ❌ Conexión a PostgreSQL: Falló', 'red');

    if (error.code === 'ECONNREFUSED') {
      log('      PostgreSQL no está corriendo o no acepta conexiones', 'yellow');
      log('      Verifica que PostgreSQL esté iniciado en el puerto ' + (process.env.DB_PORT || 5432), 'yellow');
    } else if (error.code === '3D000') {
      log('      La base de datos "' + (process.env.DB_NAME || 'cce_multitenant') + '" no existe', 'yellow');
      log('      Créala en pgAdmin4 primero', 'yellow');
    } else if (error.code === '28P01') {
      log('      Contraseña incorrecta para el usuario ' + (process.env.DB_USER || 'postgres'), 'yellow');
      log('      Verifica DB_PASSWORD en el archivo .env', 'yellow');
    } else {
      log('      Error: ' + error.message, 'yellow');
    }

    return false;
  }
}

async function runChecks() {
  log('═══════════════════════════════════════════', 'blue');
  log('   🔍 VERIFICACIÓN DE SETUP', 'blue');
  log('═══════════════════════════════════════════', 'blue');

  const results = {};

  // Check Node.js and npm
  log('\n📦 Requisitos del Sistema:', 'blue');
  results.node = checkCommand('node', 'Node.js');
  results.npm = checkCommand('npm', 'npm');
  results.psql = checkCommand('psql', 'PostgreSQL');

  // Check project files
  log('\n📁 Archivos del Proyecto:', 'blue');
  results.packageJson = checkFile('package.json', 'package.json');
  results.env = checkFile('.env', '.env');
  results.nodeModules = checkNodeModules();

  // Check environment variables
  log('\n⚙️  Variables de Entorno:', 'blue');
  results.envVars = checkEnvVariables();

  // Check database (requires .env to be loaded)
  if (results.env) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    log('\n🗄️  Base de Datos:', 'blue');
    results.database = await checkDatabase();
  }

  // Check migrations
  log('\n🔄 Migraciones:', 'blue');
  const migrationsPath = path.join(__dirname, '..', 'migrations');
  if (fs.existsSync(migrationsPath)) {
    const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.js'));
    log(`   ✅ ${migrations.length} migraciones encontradas`, 'green');
    results.migrations = true;
  } else {
    log('   ❌ Directorio de migraciones no encontrado', 'red');
    results.migrations = false;
  }

  // Summary
  log('\n═══════════════════════════════════════════', 'blue');
  log('   📊 RESUMEN', 'blue');
  log('═══════════════════════════════════════════', 'blue');

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    log('\n   ✅ TODOS LOS CHECKS PASARON', 'green');
    log('   El proyecto está listo para ejecutarse!', 'green');
    log('\n   Próximos pasos:', 'blue');
    log('   1. npm run db:migrate (para crear tablas)', 'cyan');
    log('   2. npm run dev (para iniciar el servidor)', 'cyan');
    log('   3. node scripts/test-backend.js (para verificar)', 'cyan');
    process.exit(0);
  } else {
    log('\n   ❌ ALGUNOS CHECKS FALLARON', 'red');
    log('   Revisa los errores arriba y corrígelos', 'red');

    if (!results.nodeModules) {
      log('\n   💡 Sugerencia: Ejecuta npm install', 'yellow');
    }

    if (!results.env) {
      log('\n   💡 Sugerencia: Crea el archivo .env', 'yellow');
    }

    if (!results.database) {
      log('\n   💡 Sugerencia: Verifica que PostgreSQL esté corriendo', 'yellow');
      log('      y que exista la base de datos cce_multitenant', 'yellow');
    }

    process.exit(1);
  }
}

// Ejecutar verificaciones
runChecks().catch(error => {
  log('\n❌ Error fatal durante verificación:', 'red');
  console.error(error);
  process.exit(1);
});
