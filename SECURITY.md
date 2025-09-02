# 🔒 Guía de Seguridad - Club Comandante Espora

## ⚠️ Configuración Crítica de Seguridad

### 1. Secretos y Variables de Entorno

#### 🔑 JWT Secret (CRÍTICO)
```bash
# Generar un JWT_SECRET único y seguro
openssl rand -base64 32

# Ejemplo de resultado:
# JWT_SECRET=xa7D8QxKFz1cwsIQ88xos+beRoEUWPEt909pZ0cPGUE=
```

**⚠️ NUNCA uses los valores por defecto en producción**

#### 🔐 Webhook Secret (MercadoPago)
```bash
# Generar webhook secret para MercadoPago
openssl rand -hex 32

# Ejemplo de resultado:
# MP_WEBHOOK_SECRET=d8e4ac95187cb32187c5e9d2aad8c95feede6c84e7beec03e7a13101a0356cdb
```

### 2. Configuración de Email Segura

#### Gmail App Password (Recomendado)
1. Activar autenticación de 2 factores en tu cuenta Gmail
2. Ir a **Configuración de Google** > **Seguridad** > **Contraseñas de aplicaciones**
3. Generar una contraseña específica para la aplicación
4. Usar esta contraseña en `EMAIL_PASS`

```bash
EMAIL_USER=club.comandante.espora@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # App Password, NO tu contraseña normal
```

### 3. Configuración de Base de Datos

#### SQLite (Desarrollo)
```bash
DB_PATH=./database.sqlite
# Asegurar permisos: chmod 600 database.sqlite
```

#### PostgreSQL (Producción)
```bash
USE_POSTGRES=true
DB_HOST=localhost
DB_USER=cce_user
DB_PASSWORD=STRONG_PASSWORD_HERE  # Mínimo 16 caracteres, mixto
```

### 4. Checklist de Despliegue

#### ✅ Pre-Despliegue
- [ ] JWT_SECRET único generado
- [ ] Contraseñas de base de datos fuertes
- [ ] Email configurado con App Password
- [ ] URLs de producción actualizadas
- [ ] Tokens de MercadoPago de producción
- [ ] Webhook secrets únicos

#### ✅ Configuración de Archivos
- [ ] `.env` con permisos 600 (solo lectura del propietario)
- [ ] `.env` añadido a `.gitignore`
- [ ] Credenciales reales NUNCA en código fuente

#### ✅ Monitoreo de Seguridad
- [ ] Logs de autenticación activados
- [ ] Rate limiting configurado
- [ ] CORS restrictivo (solo dominios autorizados)
- [ ] Headers de seguridad con Helmet.js

### 5. Comandos de Verificación

#### Verificar configuración actual:
```bash
cd BackendCCE
node -e "const config = require('./src/config'); console.log('JWT Secret length:', config.jwt.secret.length);"
```

#### Generar nuevos secretos:
```bash
# JWT Secret
openssl rand -base64 32

# Webhook Secret  
openssl rand -hex 32

# Password seguro
openssl rand -base64 24
```

### 6. Vulnerabilidades Conocidas

#### ✅ Solucionado - Next.js CVEs
- **Next.js 14.0.4 → 14.2.32** (11 CVEs críticos eliminados)
- SSRF en Server Actions
- Cache Poisoning
- Authorization bypass

#### 🔍 Auditoría Regular
```bash
# Frontend
cd FrontendCCE && npm audit

# Backend  
cd BackendCCE && npm audit
```

### 7. Contacto de Emergencia

En caso de incidente de seguridad:
1. **Cambiar inmediatamente** todos los secretos comprometidos
2. **Revisar logs** de acceso y autenticación  
3. **Notificar** a administradores del sistema
4. **Documentar** el incidente para prevención futura

---

## 🚨 Recordatorios Importantes

- **NUNCA** hardcodear credenciales en el código
- **SIEMPRE** usar HTTPS en producción
- **ROTAR** secretos periódicamente (JWT_SECRET cada 6 meses)
- **MONITOREAR** intentos de acceso no autorizados
- **ACTUALIZAR** dependencias regularmente

---

**Última actualización**: $(date)
**Versión Next.js**: 14.2.32 (Secure)
**Estado vulnerabilidades**: ✅ 0 críticas