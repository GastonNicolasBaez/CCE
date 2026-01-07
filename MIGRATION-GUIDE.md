# 🔄 Guía de Migración Multi-Tenant

Esta guía explica cómo aplicar las migraciones de base de datos para convertir el sistema en multi-tenant.

---

## 📋 Resumen de Cambios

### Nuevas Tablas
- ✅ **`tenants`** - Tabla principal para clubes/organizaciones

### Tablas Modificadas
- ✅ **`usuarios`** - Agregado `tenant_id`, `status`, `last_login_at`
- ✅ **`socios`** - Agregado `tenant_id`
- ✅ **`cuotas`** - Agregado `tenant_id`

### Constraints Actualizados
- DNI único **por tenant** (antes global)
- Email único **por tenant** (antes global)
- Cuotas únicas por **tenant + socio + periodo**

---

## ⚠️ IMPORTANTE: Backup Primero!

**SIEMPRE haz backup antes de ejecutar migraciones:**

```bash
# PostgreSQL (Producción)
pg_dump -h localhost -U cce_user -d cce_db > backup_$(date +%Y%m%d_%H%M%S).sql

# SQLite (Desarrollo)
cp BackendCCE/database.sqlite BackendCCE/database.sqlite.backup
```

---

## 🚀 Proceso de Migración

### Opción A: Base de Datos NUEVA (Recomendado para desarrollo)

Si estás empezando de cero o en desarrollo:

```bash
cd BackendCCE

# 1. Eliminar base de datos existente (si existe)
rm database.sqlite  # Solo desarrollo

# 2. Ejecutar TODAS las migraciones
npm run db:migrate

# 3. Cargar datos de prueba
npm run db:seed

# 4. Verificar
npm run db:migrate:status
```

**Resultado:**
- ✅ Base de datos multi-tenant creada
- ✅ 2 tenants de prueba ('espora' y 'demo')
- ✅ Usuarios admin para cada tenant
- ✅ 5 socios de ejemplo

---

### Opción B: Base de Datos EXISTENTE con datos (Producción)

Si ya tienes datos en producción que quieres conservar:

#### Paso 1: Crear Tenant por Defecto

**ANTES de ejecutar las migraciones**, crea manualmente el tenant para tus datos existentes:

```sql
-- Conectar a la base de datos
psql -U cce_user -d cce_db

-- Crear tenant para datos existentes
INSERT INTO tenants (
  slug, name, status, plan, max_members,
  admin_email, admin_name, phone,
  created_at, updated_at
) VALUES (
  'espora',                          -- Slug para subdomain
  'Club Comandante Espora',          -- Nombre del club
  'active',                          -- Estado
  'pro',                             -- Plan
  500,                               -- Límite de socios
  'admin@espora.com',                -- Email admin
  'Administrador',                   -- Nombre admin
  '+54 9 11 1234-5678',             -- Teléfono
  NOW(),
  NOW()
);

-- Verificar que se creó con ID = 1
SELECT * FROM tenants;
```

#### Paso 2: Ejecutar Migraciones

```bash
cd BackendCCE

# Ejecutar migraciones (asignarán tenant_id = 1 automáticamente)
npm run db:migrate

# Verificar estado
npm run db:migrate:status
```

Las migraciones automáticamente:
- ✅ Asignan `tenant_id = 1` a todos los usuarios existentes
- ✅ Asignan `tenant_id = 1` a todos los socios existentes
- ✅ Asignan `tenant_id` correcto a cuotas (desde su socio)

#### Paso 3: Crear Usuario Admin

```sql
-- Crear usuario admin para el tenant
INSERT INTO usuarios (
  tenant_id, nombre, apellido, email,
  password, rol, status, activo,
  created_at, updated_at
) VALUES (
  1,
  'Admin',
  'Espora',
  'admin@espora.com',
  -- Usa este hash para password 'password123' (o genera tu propio hash)
  '$2b$10$rP8vOZVlYxQjVHZQ3QZqXeXgYHF.9N8jQZqW.YK8.J0.yQ1Zz9.Xe',
  'admin',
  'active',
  true,
  NOW(),
  NOW()
);
```

**Generar hash de password:**
```javascript
// En node REPL: node
const bcrypt = require('bcrypt');
bcrypt.hash('tu-password-aqui', 10).then(console.log);
```

#### Paso 4: Verificar

```sql
-- Verificar tenants
SELECT * FROM tenants;

-- Verificar que todos los usuarios tienen tenant_id
SELECT id, nombre, apellido, email, tenant_id FROM usuarios;

-- Verificar que todos los socios tienen tenant_id
SELECT COUNT(*) as total, tenant_id FROM socios GROUP BY tenant_id;

-- Verificar que todas las cuotas tienen tenant_id
SELECT COUNT(*) as total, tenant_id FROM cuotas GROUP BY tenant_id;
```

---

## 📊 Estructura de Migraciones

```
BackendCCE/migrations/
├── 20250905000001-create-initial-schema.js       # Migración inicial (ya existe)
├── 20260107000001-create-tenants.js              # Nueva tabla tenants
├── 20260107000002-add-tenant-to-usuarios.js      # Agregar tenant_id a usuarios
├── 20260107000003-add-tenant-to-socios.js        # Agregar tenant_id a socios
└── 20260107000004-add-tenant-to-cuotas.js        # Agregar tenant_id a cuotas
```

---

## 🧪 Testing Local con Subdominios

### Configurar /etc/hosts

Para probar subdominios localmente:

**Linux/Mac:**
```bash
sudo nano /etc/hosts

# Agregar estas líneas:
127.0.0.1 localhost
127.0.0.1 espora.localhost
127.0.0.1 demo.localhost
127.0.0.1 zeclogic.localhost
```

**Windows:**
```powershell
# Ejecutar como Administrador
notepad C:\Windows\System32\drivers\etc\hosts

# Agregar estas líneas:
127.0.0.1 localhost
127.0.0.1 espora.localhost
127.0.0.1 demo.localhost
127.0.0.1 zeclogic.localhost
```

### Acceder a los Tenants

Después de aplicar migraciones y seeds:

- **Tenant Espora:** http://espora.localhost:3000
  - Admin: `admin@espora.com` / `password123`
  - User: `user@espora.com` / `password123`

- **Tenant Demo:** http://demo.localhost:3000
  - Admin: `admin@demo.com` / `password123`

- **Landing Page:** http://zeclogic.localhost:3000
  - Página pública sin tenant

---

## 🔙 Rollback de Migraciones

Si algo sale mal, puedes hacer rollback:

```bash
# Rollback de la última migración
npm run db:migrate:undo

# Rollback de TODAS las migraciones multi-tenant (cuidado!)
npm run db:migrate:undo
npm run db:migrate:undo
npm run db:migrate:undo
npm run db:migrate:undo
```

**Orden de rollback:**
1. cuotas (tenant_id)
2. socios (tenant_id)
3. usuarios (tenant_id)
4. tenants (tabla)

---

## ✅ Verificación Post-Migración

### Checklist

Ejecuta estos comandos para verificar que todo está correcto:

```bash
# 1. Verificar estado de migraciones
npm run db:migrate:status

# Deberías ver:
# up     20250905000001-create-initial-schema.js
# up     20260107000001-create-tenants.js
# up     20260107000002-add-tenant-to-usuarios.js
# up     20260107000003-add-tenant-to-socios.js
# up     20260107000004-add-tenant-to-cuotas.js

# 2. Iniciar servidor backend
npm run dev

# Deberías ver:
# ✅ Database connection established successfully
# ✅ Database tables verified
# 🚀 Server running on port 3001
```

### Test de Aislamiento de Datos

```sql
-- Verificar que los socios están aislados por tenant
-- Esta query NO debería devolver socios del tenant 2
SELECT * FROM socios WHERE tenant_id = 1;

-- Verificar unique constraints funcionan por tenant
-- Esto debería FUNCIONAR (mismo DNI en diferentes tenants)
INSERT INTO socios (tenant_id, nombre, apellido, dni, email, telefono, fecha_nacimiento, fecha_ingreso, actividad, estado)
VALUES (1, 'Test1', 'User1', '99999999', 'test1@tenant1.com', '1111111111', '1990-01-01', '2024-01-01', 'Solo socio', 'Activo');

INSERT INTO socios (tenant_id, nombre, apellido, dni, email, telefono, fecha_nacimiento, fecha_ingreso, actividad, estado)
VALUES (2, 'Test2', 'User2', '99999999', 'test2@tenant2.com', '2222222222', '1990-01-01', '2024-01-01', 'Solo socio', 'Activo');

-- Esto debería FALLAR (mismo DNI en el mismo tenant)
INSERT INTO socios (tenant_id, nombre, apellido, dni, email, telefono, fecha_nacimiento, fecha_ingreso, actividad, estado)
VALUES (1, 'Test3', 'User3', '99999999', 'test3@tenant1.com', '3333333333', '1990-01-01', '2024-01-01', 'Solo socio', 'Activo');
-- Error: duplicate key value violates unique constraint "socios_tenant_dni_unique"
```

---

## 🐛 Troubleshooting

### Error: "relation tenants does not exist"

**Problema:** La tabla tenants no fue creada.

**Solución:**
```bash
npm run db:migrate
```

### Error: "column tenant_id does not exist"

**Problema:** Las migraciones de usuarios/socios/cuotas no se ejecutaron.

**Solución:**
```bash
# Verificar qué migraciones están pendientes
npm run db:migrate:status

# Ejecutar migraciones pendientes
npm run db:migrate
```

### Error: "foreign key constraint fails"

**Problema:** Intentaste insertar datos sin un tenant válido.

**Solución:**
```bash
# Verificar que el tenant existe
SELECT * FROM tenants WHERE id = 1;

# Si no existe, crear tenant primero
INSERT INTO tenants (...) VALUES (...);
```

### Error: "duplicate key value violates unique constraint"

**Problema:** Ya existe un socio con ese DNI/email en el mismo tenant.

**Solución:** Esto es correcto! El constraint está funcionando. Usa un DNI/email diferente O cámbialo a otro tenant.

---

## 📝 Scripts Útiles

```bash
# Ver todas las migraciones
npm run db:migrate:status

# Ejecutar migraciones pendientes
npm run db:migrate

# Rollback última migración
npm run db:migrate:undo

# Ejecutar seeds
npm run db:seed

# Remover seeds
npm run db:seed:undo

# Ejecutar seed específico
npx sequelize-cli db:seed --seed 20260107000001-demo-tenants-and-users.js
```

---

## 🎯 Próximos Pasos

Después de completar las migraciones:

1. ✅ Implementar autenticación JWT (siguiente fase)
2. ✅ Crear middleware de tenant resolution
3. ✅ Actualizar controllers para usar tenant scoping
4. ✅ Implementar frontend multi-tenant con subdominios

---

## 📞 Soporte

Si tienes problemas durante la migración:

1. Verifica que tienes backup de la base de datos
2. Lee los logs de la migración cuidadosamente
3. Verifica el estado: `npm run db:migrate:status`
4. Si todo falla, haz rollback y reporta el error

---

**Documento generado:** 2026-01-07
**Versión:** 1.0
**Proyecto:** CCE Multi-Tenant MVP
