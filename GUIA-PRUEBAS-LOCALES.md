# 🧪 Guía de Pruebas Locales - Sistema Multi-Tenant

Esta guía te ayudará a configurar y probar el sistema multi-tenant completo en tu entorno local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior)
- **npm** o **yarn**
- **PostgreSQL** (v12 o superior)
- **Git**

Verificación rápida:
```bash
node --version    # Debe mostrar v16+
npm --version     # Cualquier versión reciente
psql --version    # Debe mostrar PostgreSQL 12+
```

## 🚀 Parte 1: Configuración del Backend

### 1.1 Configurar PostgreSQL

```bash
# Iniciar PostgreSQL (depende de tu sistema)
# macOS con Homebrew:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Usar pgAdmin o servicios de Windows
```

```bash
# Crear la base de datos
createdb cce_multitenant

# O usando psql:
psql -U postgres
CREATE DATABASE cce_multitenant;
\q
```

### 1.2 Configurar Variables de Entorno

El archivo `.env` ya fue creado en `BackendCCE/.env`. Verifica que contenga:

```bash
# Revisar contenido
cat BackendCCE/.env

# Deberías ver:
# - DB_NAME=cce_multitenant
# - DB_USER=postgres
# - DB_PASSWORD=postgres (ajusta según tu configuración)
# - PORT=5000
# - JWT_SECRET=[secreto generado]
```

**IMPORTANTE**: Actualiza `DB_USER` y `DB_PASSWORD` con tus credenciales de PostgreSQL.

```bash
# Editar .env si es necesario
nano BackendCCE/.env

# O usar cualquier editor:
code BackendCCE/.env
```

### 1.3 Instalar Dependencias del Backend

```bash
cd BackendCCE
npm install
```

### 1.4 Ejecutar Migraciones

```bash
# Crear las tablas en la base de datos
npm run db:migrate

# Deberías ver:
# ✅ Migración 1: create-initial-schema
# ✅ Migración 2: create-tenants
# ✅ Migración 3: add-tenant-to-usuarios
# ✅ Migración 4: add-tenant-to-socios
# ✅ Migración 5: add-tenant-to-cuotas
# ✅ Migración 6: add-performance-indexes
```

### 1.5 (Opcional) Cargar Datos de Prueba

```bash
# Ejecutar seeders para datos de prueba
npm run db:seed

# Esto creará:
# - Tenant de prueba: "espora"
# - Usuario admin: admin@espora.com / password123
# - Algunos socios de ejemplo
```

### 1.6 Iniciar el Servidor Backend

```bash
# En modo desarrollo (con hot reload)
npm run dev

# O en modo producción:
npm start
```

**Verificación**: Deberías ver en la consola:
```
✅ [SUCCESS] Database connection established successfully
🚀 Server running on port 5000
🌐 Environment: development
📱 Frontend URL: http://localhost:3000
📊 Health check: http://localhost:5000/health
```

**Probar Health Check**:
```bash
curl http://localhost:5000/health

# Respuesta esperada:
# {
#   "success": true,
#   "message": "Server is healthy",
#   "uptime": 1.234,
#   "timestamp": "2026-01-07T...",
#   "services": {
#     "server": "up",
#     "database": "up"
#   }
# }
```

## 🖥️ Parte 2: Configuración del Frontend

### 2.1 Instalar Dependencias del Frontend

```bash
# En otra terminal (mantén el backend corriendo)
cd FrontendCCE
npm install
```

### 2.2 Verificar Variables de Entorno

```bash
# Revisar que .env.local exista
cat .env.local

# Debe contener:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2.3 Configurar /etc/hosts para Subdominios Locales

Para probar multi-tenant con subdominios en localhost, necesitas configurar `/etc/hosts`:

```bash
# En macOS/Linux
sudo nano /etc/hosts

# Agregar estas líneas:
127.0.0.1   espora.localhost
127.0.0.1   demo.localhost
127.0.0.1   test.localhost

# Guardar (Ctrl+X, Y, Enter)

# En Windows (como administrador)
# Editar: C:\Windows\System32\drivers\etc\hosts
# Agregar las mismas líneas
```

### 2.4 Iniciar el Servidor Frontend

```bash
npm run dev
```

**Verificación**: Deberías ver:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## ✅ Parte 3: Verificación del Sistema

### 3.1 Verificar Backend (Health Check)

```bash
# Ejecutar script de verificación
node BackendCCE/scripts/test-backend.js

# O manualmente:
curl http://localhost:5000/health
```

### 3.2 Verificar Conexión Frontend-Backend

Abre tu navegador en: http://localhost:3000

Deberías ver:
- **Landing Page** con información del sistema
- Botones de "Registrar Club" y "Iniciar Sesión"

### 3.3 Probar Registro de Nuevo Tenant

**Opción 1: Usando el Script de Prueba**
```bash
node BackendCCE/scripts/test-auth.js
```

**Opción 2: Manualmente en el Navegador**

1. Ir a: http://localhost:3000/register
2. Completar el formulario:
   - Nombre del Club: "Club Espora"
   - Slug: "espora" (será el subdominio)
   - Nombre Admin: "Juan"
   - Apellido Admin: "Pérez"
   - Email: "admin@espora.com"
   - Contraseña: "password123"
3. Click en "Registrar"

**Resultado esperado**:
- Redirección automática a: http://espora.localhost:3000/dashboard
- Sesión iniciada como administrador

### 3.4 Probar Login en Tenant Existente

1. Ir a: http://espora.localhost:3000/login
2. Ingresar credenciales:
   - Email: admin@espora.com
   - Contraseña: password123
3. Click en "Iniciar Sesión"

**Resultado esperado**:
- Dashboard del tenant "espora"
- Nombre de usuario visible en el header

### 3.5 Probar Multi-Tenant (Múltiples Clubs)

**Crear segundo tenant:**

1. Ir a: http://localhost:3000/register (sin subdominio)
2. Registrar otro club:
   - Nombre del Club: "Club Demo"
   - Slug: "demo"
   - Email: "admin@demo.com"
   - etc.

3. Verificar que puedas acceder a:
   - http://espora.localhost:3000 → Club Espora
   - http://demo.localhost:3000 → Club Demo
   - Cada uno con sus propios datos aislados

## 🧪 Parte 4: Pruebas de API (cURL)

### 4.1 Verificar Health Check
```bash
curl http://localhost:5000/health
```

### 4.2 Registrar Nuevo Tenant
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "Club Test",
    "slug": "test",
    "adminName": "Test",
    "adminLastName": "User",
    "adminEmail": "test@test.com",
    "password": "password123"
  }'
```

**Respuesta esperada** (200):
```json
{
  "success": true,
  "message": "Club registrado exitosamente",
  "data": {
    "tenant": { "id": 1, "slug": "test", ... },
    "user": { "id": 1, "email": "test@test.com", ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 4.3 Login en Tenant
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: test" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
```

### 4.4 Obtener Info de Usuario Autenticado
```bash
# Guardar el token de login
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: test"
```

## 🔍 Parte 5: Scripts de Verificación Automática

### 5.1 Ejecutar Suite Completa de Verificación

```bash
# Desde la raíz del proyecto
npm run test:local

# O ejecutar script directamente:
node BackendCCE/scripts/run-tests.js
```

Este script verifica:
- ✅ Backend está corriendo
- ✅ Base de datos está conectada
- ✅ Frontend está accesible
- ✅ Registro de tenant funciona
- ✅ Login funciona
- ✅ Tenant isolation funciona

### 5.2 Scripts Individuales Disponibles

```bash
# Solo verificar backend
node BackendCCE/scripts/test-backend.js

# Solo verificar autenticación
node BackendCCE/scripts/test-auth.js

# Solo verificar multi-tenant
node BackendCCE/scripts/test-multitenant.js

# Verificar rendimiento
node BackendCCE/scripts/test-performance.js
```

## 🐛 Solución de Problemas Comunes

### Problema 1: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
psql -U postgres -c "SELECT 1"

# Verificar credenciales en .env
cat BackendCCE/.env | grep DB_

# Recrear base de datos
dropdb cce_multitenant
createdb cce_multitenant
npm run db:migrate
```

### Problema 2: "Port 5000 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -ti:5000

# Matar el proceso
kill -9 $(lsof -ti:5000)

# O cambiar puerto en .env
echo "PORT=5001" >> BackendCCE/.env
```

### Problema 3: "espora.localhost no funciona"

```bash
# Verificar /etc/hosts
cat /etc/hosts | grep localhost

# Debe incluir:
# 127.0.0.1   espora.localhost

# Si no está, agregarlo:
sudo sh -c 'echo "127.0.0.1   espora.localhost" >> /etc/hosts'
```

### Problema 4: "CORS error en frontend"

```bash
# Verificar que backend esté en puerto 5000
curl http://localhost:5000/health

# Verificar .env.local del frontend
cat FrontendCCE/.env.local

# Debe ser: NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Problema 5: "JWT token invalid"

```bash
# Limpiar cookies y localStorage en navegador
# Abrir DevTools (F12) → Application → Storage → Clear All

# Regenerar JWT_SECRET en .env del backend
openssl rand -base64 32

# Actualizar en BackendCCE/.env:
# JWT_SECRET=[nuevo_secreto]

# Reiniciar backend
```

## 📊 Parte 6: Monitoreo Durante Pruebas

### 6.1 Ver Logs del Backend
```bash
# El servidor mostrará logs en tiempo real:
# ✅ [SUCCESS] User logged in: admin@espora.com (tenant: espora)
# ℹ️  [INFO] GET /api/socios 200 45ms
# 🚨 [SECURITY] Tenant mismatch! Token tenant: 1, Subdomain tenant: 2
```

### 6.2 Ver Logs de PostgreSQL
```bash
# Ver consultas SQL (útil para debugging)
# En BackendCCE/.env, cambiar:
# DB_LOGGING=true

# Reiniciar backend para ver todas las queries SQL
```

### 6.3 Monitorear Requests HTTP
```bash
# Usar herramientas de desarrollo del navegador
# Chrome/Firefox DevTools → Network tab

# O usar herramientas CLI:
# Interceptar todas las requests:
npm install -g mitmproxy
mitmweb
```

## ✨ Pruebas de Flujo Completo

### Flujo 1: Registro → Login → Gestión de Socios

```bash
# 1. Registrar nuevo club
curl -X POST http://localhost:5000/api/auth/register ...

# 2. Guardar token
TOKEN="..."

# 3. Crear socio
curl -X POST http://localhost:5000/api/socios \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: test" \
  -d '{"nombre": "Juan", "apellido": "Pérez", ...}'

# 4. Listar socios
curl http://localhost:5000/api/socios \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: test"
```

### Flujo 2: Multi-Tenant Isolation

```bash
# Ejecutar script de prueba de aislamiento
node BackendCCE/scripts/test-multitenant.js

# Este script:
# 1. Crea 2 tenants diferentes
# 2. Crea socios en cada tenant
# 3. Verifica que tenant A no pueda ver datos de tenant B
```

## 🎯 Checklist de Pruebas Completas

Antes de considerar que el sistema está listo, verifica:

- [ ] Backend inicia sin errores
- [ ] Base de datos conecta correctamente
- [ ] Migraciones aplicadas (6/6)
- [ ] Frontend inicia en puerto 3000
- [ ] Landing page carga (localhost:3000)
- [ ] Registro de tenant funciona
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] Subdominios funcionan (*.localhost:3000)
- [ ] Multi-tenant isolation funciona
- [ ] Health check retorna status 200
- [ ] Rate limiting funciona (probar >5 logins)
- [ ] Autenticación expira después de 24h
- [ ] CORS permite subdominios
- [ ] Headers de seguridad presentes

## 📚 Recursos Adicionales

- **Documentación API**: Ver `API-DOCUMENTATION.md`
- **Problemas Conocidos**: Ver `PROBLEMAS-Y-SOLUCIONES.md`
- **Arquitectura**: Ver diagramas en `/docs`

## 🆘 Obtener Ayuda

Si encuentras problemas no cubiertos en esta guía:

1. Revisar logs del backend y frontend
2. Verificar variables de entorno (.env)
3. Ejecutar scripts de diagnóstico
4. Consultar documentación de API
5. Revisar problemas conocidos en GitHub

---

**¡Listo!** Si completaste todos los pasos, tu sistema multi-tenant está funcionando correctamente en local. 🎉
