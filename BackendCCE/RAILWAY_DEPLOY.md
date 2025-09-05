# 🚂 Deployment Guide - Railway

## Backend listo para Railway

Tu backend ya está configurado y listo para deployar en Railway. He realizado las siguientes configuraciones:

### ✅ Cambios realizados:

1. **Removida configuración de Supabase**
2. **Configuración dual de base de datos:**
   - **Desarrollo:** SQLite (automático)
   - **Producción:** PostgreSQL de Railway (automático)
3. **Archivos de configuración Railway:**
   - `railway.json` - Configuración específica
   - `Procfile` - Define comando de inicio
4. **Variables de entorno actualizadas**

---

## 🚀 Pasos para deployar en Railway

### 1. Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio `BackendCCE`

### 2. Crear base de datos PostgreSQL
1. En tu proyecto Railway, click "New" → "Database" → "PostgreSQL"
2. Railway creará automáticamente la base de datos

### 3. Configurar variables de entorno
En la sección "Variables" de tu servicio backend:

```bash
# Copia la DATABASE_URL desde tu base PostgreSQL
DATABASE_URL=[URL_AUTOMATICA_DE_RAILWAY]ç

# Configuración obligatoria
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tudominio.com

# JWT (genera uno nuevo y seguro)
JWT_SECRET=tu_jwt_super_seguro_de_64_caracteres_o_mas

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_app
EMAIL_FROM=Club Comandante Espora <noreply@clubespora.com>

# MercadoPago (opcional)
MP_ACCESS_TOKEN=tu_access_token_real
MP_PUBLIC_KEY=tu_public_key_real
MP_WEBHOOK_SECRET=tu_webhook_secret
```

### 4. Deploy automático
Railway deployará automáticamente cuando hagas `git push` a tu rama principal.

### 5. Verificar deployment
- URL de Railway: `https://tu-proyecto.up.railway.app`
- Health check: `https://tu-proyecto.up.railway.app/health`
- API endpoints: `https://tu-proyecto.up.railway.app/api/socios`

---

## 🔧 Comandos útiles Railway CLI

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy manual
railway up

# Ver logs
railway logs

# Abrir en navegador
railway open
```

---

## 📁 Estructura final del proyecto

```
BackendCCE/
├── api/              # Vercel serverless (no usado en Railway)
├── src/
│   ├── config/
│   │   ├── database.js    ✅ Dual SQLite/PostgreSQL
│   │   └── index.js       ✅ Variables actualizadas
│   ├── models/
│   ├── routes/
│   └── server.js          ✅ Servidor principal
├── railway.json           ✅ Configuración Railway
├── Procfile              ✅ Comando de inicio
├── .env.example          ✅ Variables actualizadas
└── package.json          ✅ Scripts Railway
```

---

## 🎯 Ventajas de Railway

- ✅ **Servidor persistente** (no serverless)
- ✅ **PostgreSQL incluido** automáticamente
- ✅ **Deploy automático** con git push
- ✅ **Variables de entorno** fáciles de configurar
- ✅ **Logs en tiempo real**
- ✅ **No requiere modificar código**

---

## ⚡ Estado actual

- ✅ Backend configurado correctamente
- ✅ Base de datos dual (SQLite dev / PostgreSQL prod)
- ✅ Variables de entorno limpias
- ✅ Configuraciones Supabase removidas
- ✅ Archivos Railway creados
- ✅ Probado en desarrollo

**El backend está 100% listo para Railway** 🎉