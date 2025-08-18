# Migración a PostgreSQL - Club Comandante Espora

## Resumen

Esta guía te ayudará a migrar el backend del Club Comandante Espora de SQLite a PostgreSQL para preparar la aplicación para producción.

## Prerrequisitos

### 1. Instalar PostgreSQL

**En Windows:**
- Descargar desde: https://www.postgresql.org/download/windows/
- Ejecutar el instalador y seguir los pasos
- Recordar la contraseña del usuario `postgres`

**En Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**En macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### 2. Crear la base de datos

```sql
-- Conectarse a PostgreSQL como superusuario
psql -U postgres

-- Crear la base de datos
CREATE DATABASE cce_db;

-- Crear usuario (opcional, recomendado para producción)
CREATE USER cce_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE cce_db TO cce_user;

-- Salir de psql
\q
```

## Configuración

### 1. Variables de entorno

Actualiza tu archivo `.env` con la configuración de PostgreSQL:

```env
# Activar PostgreSQL
USE_POSTGRES=true

# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cce_db
DB_USER=postgres
DB_PASSWORD=tu_password_de_postgres

# Email Configuration (REQUERIDO PARA PRODUCCIÓN)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_de_16_digitos

# SMS Configuration (OPCIONAL)
TWILIO_ACCOUNT_SID=tu_account_sid_de_twilio
TWILIO_AUTH_TOKEN=tu_auth_token_de_twilio
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Configuración de Email

Para usar Gmail, necesitas crear una **contraseña de aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Selecciona "Correo" y "Otro (nombre personalizado)"
5. Escribe "Club Comandante Espora"
6. Usa la contraseña generada (16 dígitos) en `EMAIL_PASS`

### 3. Configuración de SMS (Opcional)

Para usar Twilio:

1. Crear cuenta en: https://www.twilio.com/
2. Obtener Account SID y Auth Token del dashboard
3. Comprar un número de teléfono Twilio
4. Configurar las variables en `.env`

## Migración de Datos

### Opción 1: Script automático (Recomendado)

```bash
cd BackendCCE
node scripts/migrate-to-postgres.js
```

Este script:
- ✅ Detecta automáticamente si existe SQLite
- ✅ Crea las tablas en PostgreSQL
- ✅ Migra todos los datos existentes
- ✅ Verifica que la migración sea exitosa
- ✅ Proporciona un resumen detallado

### Opción 2: Migración manual

Si prefieres mayor control:

```bash
# 1. Crear backup de SQLite (opcional)
cp database.sqlite database.sqlite.backup

# 2. Configurar PostgreSQL en .env
# USE_POSTGRES=true

# 3. Ejecutar sincronización de modelos
cd BackendCCE
npm run dev
# Ctrl+C para detener después de que se creen las tablas

# 4. Migrar datos manualmente usando herramientas de tu preferencia
```

## Verificación

### 1. Verificar conexión

```bash
cd BackendCCE
npm run dev
```

Deberías ver en los logs:
```
✅ Conectado a la base de datos PostgreSQL: cce_db
🚀 Servidor ejecutándose en puerto 3001
📧 Email service is ready to send messages
📱 SMS service initialized successfully
```

### 2. Verificar datos

Conecta el frontend y verifica que:
- ✅ Los socios aparecen correctamente
- ✅ Las cuotas se muestran
- ✅ Las estadísticas funcionan
- ✅ La inscripción de nuevos socios funciona
- ✅ El envío de emails funciona

### 3. Probar funcionalidades

1. **Inscripción:** Registra un nuevo socio/jugador
2. **Email:** Verifica que llegue el email de información de pago
3. **Dashboard:** Revisa que las estadísticas se calculen correctamente
4. **Pagos:** Si tienes datos de cuotas, verifica que se muestren

## Solución de Problemas

### Error: "relation does not exist"

```bash
# Sincronizar modelos forzadamente
cd BackendCCE
node -e "require('./src/models').sequelize.sync({force: true})"
```

### Error de conexión a PostgreSQL

1. Verificar que PostgreSQL esté ejecutándose:
   ```bash
   # Windows
   services.msc (buscar PostgreSQL)
   
   # Linux
   sudo systemctl status postgresql
   
   # macOS
   brew services list | grep postgresql
   ```

2. Verificar configuración en `.env`
3. Probar conexión manual:
   ```bash
   psql -h localhost -U postgres -d cce_db
   ```

### Email no se envía

1. Verificar credenciales de Gmail
2. Asegurar que la verificación en 2 pasos esté activa
3. Usar contraseña de aplicación, no la contraseña normal
4. Revisar logs del servidor para errores específicos

### SMS no se envía

1. Verificar credenciales de Twilio
2. Asegurar que el número de origen sea válido
3. Verificar que la cuenta Twilio tenga saldo
4. Los SMS son opcionales - la aplicación funciona sin ellos

## Respaldo y Recuperación

### Crear respaldo de PostgreSQL

```bash
# Respaldo completo
pg_dump -U postgres -h localhost cce_db > backup_cce.sql

# Respaldo solo datos
pg_dump -U postgres -h localhost --data-only cce_db > backup_data.sql
```

### Restaurar respaldo

```bash
# Restaurar desde respaldo
psql -U postgres -h localhost cce_db < backup_cce.sql
```

## Configuración para Producción

### 1. Seguridad

- Cambiar contraseñas por defecto
- Usar usuario específico para la aplicación (no `postgres`)
- Configurar firewall para PostgreSQL
- Usar variables de entorno para secrets

### 2. Rendimiento

```sql
-- Configuraciones recomendadas para PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### 3. Monitoreo

- Configurar logs de PostgreSQL
- Monitorear conexiones activas
- Configurar alertas para errores de email/SMS

## Comandos Útiles

```bash
# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Conectar a la base de datos
psql -U postgres -d cce_db

# Ver tablas
\dt

# Ver estructura de tabla
\d "Socios"

# Salir de psql
\q

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## Contacto

Si tienes problemas con la migración:
1. Revisa los logs del servidor backend
2. Verifica la configuración de `.env`
3. Asegúrate de que PostgreSQL esté ejecutándose
4. Verifica las credenciales de email/SMS

¡La migración debería ser un proceso suave siguiendo estos pasos! 🚀