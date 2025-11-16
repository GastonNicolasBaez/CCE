# 🧪 Entorno de Pruebas - Club Comandante Espora

Este documento describe cómo configurar y usar el entorno de pruebas del backend para probar todas las funcionalidades del sistema.

## 📋 Contenido del Entorno de Pruebas

El entorno de pruebas crea automáticamente:

### 👤 Usuarios del Sistema (5 usuarios)
| Email | Contraseña | Rol | Estado |
|-------|-----------|-----|--------|
| admin@cce.com | admin123 | Admin | Activo |
| staff@cce.com | staff123 | Staff | Activo |
| juan.admin@cce.com | admin123 | Admin | Activo |
| maria.staff@cce.com | staff123 | Staff | Activo |
| pedro.inactivo@cce.com | test123 | Staff | Inactivo |

### 👥 Socios del Club (18 socios)

**Básquet (5 socios):**
- Juan Carlos Pérez López
- María Fernanda González Silva
- Carlos Alberto Rodríguez Martín
- Ana Lucía López Fernández
- Diego Inactivo Prueba (Estado: Inactivo)

**Vóley (3 socios):**
- Roberto Daniel Fernández Castro
- Carmen Rosa Ruiz Morales
- Miguel Ángel Torres Vega

**Karate (3 socios):**
- Alejandro José Mendoza Herrera
- Lucía Esperanza Navarro Sánchez
- Fernando Luis Ríos Delgado

**Gimnasio (4 socios):**
- Patricia Elena Acosta Ramírez
- Eduardo Martín Miranda Torres
- Laura Suspendida Test (Estado: Suspendido)
- Martín Inactivo Gimnasio (Estado: Inactivo)

**Solo Socios (3 socios):**
- Roberto Carlos Díaz Méndez
- María Elena Vargas Jiménez
- Ana Sofía Rojas Castillo

### 💰 Cuotas de Pago

El sistema genera automáticamente **cuotas para los últimos 6 meses** para cada socio:

**Montos por Actividad:**
- Básquet: $15,000
- Vóley: $12,000
- Karate: $18,000
- Gimnasio: $20,000
- Solo Socio: $8,000

**Estados de las Cuotas:**
- **Meses antiguos (hace 4-6 meses):** 85% pagadas, 10% vencidas, 5% pendientes
- **Meses recientes (hace 2-3 meses):** 70% pagadas, 15% vencidas, 15% pendientes
- **Mes actual y anterior:** 50% pagadas, 25% vencidas, 25% pendientes

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

```bash
# Verifica que tengas Node.js instalado
node --version  # Debe ser >= 22.0.0

# Verifica que tengas PostgreSQL (opcional, usa SQLite por defecto)
psql --version
```

### 2. Instalar Dependencias

```bash
cd BackendCCE
npm install
```

### 3. Configurar Variables de Entorno

El archivo `.env` ya está configurado para desarrollo local. Verifica que contenga:

```env
NODE_ENV=development
PORT=3001

# Database (SQLite por defecto para testing)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🎯 Inicializar el Entorno de Pruebas

### Opción 1: Primera vez (crear datos)

```bash
npm run init-db
```

Este comando:
- ✅ Crea las tablas de la base de datos
- ✅ Crea 5 usuarios del sistema
- ✅ Crea 18 socios del club
- ✅ Genera ~108 cuotas (6 meses × 18 socios)
- ✅ Muestra estadísticas completas

### Opción 2: Recrear todo desde cero (--force)

```bash
npm run test-env
# o
npm run init-db:force
```

Este comando:
- 🗑️ **ELIMINA** todos los datos existentes
- ✅ Recrea todas las tablas
- ✅ Genera nuevos datos de prueba
- ✅ Ideal para resetear el entorno completamente

### Opción 3: Solo verificar datos existentes

```bash
npm run init-db
```

Si ya existen datos, mostrará un mensaje y NO hará cambios.

## 🏃 Ejecutar el Backend

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

El servidor se ejecutará en: http://localhost:3001

### Modo Producción

```bash
npm start
```

## 🧪 Probar las Funcionalidades

### 1. Verificar que el servidor funciona

```bash
# Health check
curl http://localhost:3001/health

# Respuesta esperada:
# {"status":"ok","timestamp":"..."}
```

### 2. Probar el Login (Autenticación)

```bash
# Login como Admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cce.com",
    "password": "admin123"
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGc...",
#     "user": {
#       "id": 1,
#       "email": "admin@cce.com",
#       "nombre": "Admin",
#       "apellido": "Principal",
#       "rol": "admin"
#     }
#   }
# }
```

**Guarda el token** para usarlo en las siguientes peticiones.

### 3. Probar Endpoints Protegidos

```bash
# Obtener todos los socios (requiere autenticación)
curl http://localhost:3001/api/socios \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Obtener estadísticas de socios
curl http://localhost:3001/api/socios/estadisticas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Obtener estadísticas de pagos
curl http://localhost:3001/api/pagos/estadisticas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Buscar socios
curl "http://localhost:3001/api/search?q=Juan" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 4. Probar Gestión de Usuarios (Solo Admin)

```bash
# Obtener todos los usuarios (solo admins)
curl http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer TOKEN_DE_ADMIN"

# Crear nuevo usuario
curl -X POST http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@cce.com",
    "password": "password123",
    "nombre": "Nuevo",
    "apellido": "Usuario",
    "rol": "staff",
    "activo": true
  }'
```

### 5. Probar Pagos

```bash
# Obtener cuotas con filtros
curl "http://localhost:3001/api/pagos?estado=Vencida&actividad=Basquet" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Obtener pagos vencidos
curl http://localhost:3001/api/pagos/vencidos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🔍 Verificar Datos en la Base de Datos

### SQLite (por defecto)

```bash
# Instalar cliente SQLite
sudo apt-get install sqlite3  # Linux
brew install sqlite3          # macOS

# Abrir la base de datos
sqlite3 ./database.sqlite

# Comandos útiles:
.tables              # Ver todas las tablas
.schema usuarios     # Ver esquema de tabla
SELECT * FROM usuarios;
SELECT * FROM socios WHERE estado = 'Activo';
SELECT * FROM cuotas WHERE estado = 'Vencida' LIMIT 10;
.quit                # Salir
```

### PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres -d cce_db

# Comandos útiles:
\dt              # Ver todas las tablas
\d usuarios      # Ver estructura de tabla
SELECT * FROM usuarios;
SELECT COUNT(*) FROM socios;
SELECT COUNT(*), estado FROM cuotas GROUP BY estado;
\q               # Salir
```

## 📊 Estadísticas del Entorno

Al ejecutar `npm run test-env`, verás algo como:

```
═══════════════════════════════════════════════════════════
🔑 Test User Credentials:
────────────────────────────────────────────────────────────
  ADMIN    | admin@cce.com                  | admin123
  STAFF    | staff@cce.com                  | staff123
  ADMIN    | juan.admin@cce.com             | admin123
  STAFF    | maria.staff@cce.com            | staff123
  STAFF    | pedro.inactivo@cce.com         | test123
────────────────────────────────────────────────────────────

📊 Database Statistics:
═══════════════════════════════════════════════════════════
  👥 Total Socios: 18
     ├─ Active: 15
     ├─ Inactive: 2
     └─ Suspended: 1

  💰 Total Cuotas: 108
     ├─ Paid: 65
     ├─ Pending: 21
     └─ Overdue: 22

  👤 Total Users: 5
     ├─ Admins: 2
     ├─ Staff: 3
     └─ Active: 4
═══════════════════════════════════════════════════════════

🎉 Test database initialized successfully!

📋 Quick Start:
  1. Start backend: cd BackendCCE && npm run dev
  2. Start frontend: cd FrontendCCE && npm run dev
  3. Login with: admin@cce.com / admin123
```

## 🧹 Limpiar Datos de Prueba

Para eliminar todos los datos y empezar desde cero:

```bash
# Opción 1: Recrear con el script
npm run test-env

# Opción 2: Eliminar archivo SQLite
rm ./database.sqlite
npm run init-db

# Opción 3: PostgreSQL
psql -U postgres -d cce_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run init-db
```

## 🔧 Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"

**SQLite:**
```bash
# Verificar permisos del directorio
ls -la ./database.sqlite
chmod 644 ./database.sqlite
```

**PostgreSQL:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "Port 3001 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :3001

# Matar el proceso
kill -9 PID_DEL_PROCESO

# O cambiar el puerto en .env
PORT=3002
```

### Los datos no se crean

```bash
# Verificar que el script se ejecute con --force
npm run test-env

# Ver logs detallados
DEBUG=* npm run init-db
```

## 📝 Notas Importantes

1. **Seguridad**: Las contraseñas en el entorno de pruebas son simples (`admin123`, etc.). **NUNCA** uses estas credenciales en producción.

2. **Datos Aleatorios**: Las cuotas se generan con estados aleatorios cada vez que ejecutas el script, por lo que los números exactos pueden variar ligeramente.

3. **Performance**: Con SQLite, todas las operaciones son locales y muy rápidas. Con PostgreSQL, puede tomar unos segundos más.

4. **Backup**: Si tienes datos importantes, haz backup antes de ejecutar `npm run test-env`.

## 🚀 Próximos Pasos

Después de inicializar el entorno de pruebas:

1. ✅ Inicia el backend: `npm run dev`
2. ✅ Inicia el frontend: `cd ../FrontendCCE && npm run dev`
3. ✅ Abre el navegador: http://localhost:3000
4. ✅ Login con: `admin@cce.com` / `admin123`
5. ✅ Explora todas las funcionalidades

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Asegúrate de que todos los puertos estén disponibles
4. Consulta la documentación principal en `/README.md`
