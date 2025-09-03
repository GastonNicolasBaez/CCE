# Guía de Deploy - Vercel + Supabase

## Prerrequisitos
1. Cuenta en Vercel (https://vercel.com)
2. Cuenta en Supabase (https://supabase.com)
3. Proyecto creado en Supabase

## Pasos para Deploy:

### 1. Configurar Supabase

#### 1.1 Crear proyecto en Supabase
- Ve a https://supabase.com y crea una cuenta
- Crea un nuevo proyecto
- Anota la URL y las API Keys del proyecto

#### 1.2 Configurar la base de datos
- Ve a la sección SQL Editor en Supabase
- Ejecuta el contenido del archivo `BackendCCE/database-schema.sql`
- Esto creará las tablas `socios` y `cuotas` con todos los índices necesarios

#### 1.3 Obtener configuraciones
- URL del proyecto: `https://[tu-proyecto].supabase.co`
- Anon Key: En Settings > API
- Service Role Key: En Settings > API
- Database URL: En Settings > Database

### 2. Deploy Backend en Vercel

```bash
cd BackendCCE
vercel --prod
```

#### 2.1 Configurar variables de entorno en Vercel
En el dashboard de Vercel, configura las siguientes variables:

**Variables obligatorias:**
- `DATABASE_URL`: URL de PostgreSQL de Supabase
- `JWT_SECRET`: Clave secreta para JWT
- `NODE_ENV`: `production`

**Variables opcionales (según funcionalidades):**
- `MP_ACCESS_TOKEN`: Token de MercadoPago
- `MP_PUBLIC_KEY`: Clave pública de MercadoPago  
- `EMAIL_USER`: Email para envío de notificaciones
- `EMAIL_PASS`: Contraseña del email
- `TWILIO_ACCOUNT_SID`: SID de Twilio para SMS
- `TWILIO_AUTH_TOKEN`: Token de Twilio

### 3. Deploy Frontend en Vercel

```bash
cd FrontendCCE
vercel --prod
```

#### 3.1 Configurar variables de entorno en Vercel
En el dashboard de Vercel, configura:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `NEXT_PUBLIC_API_URL`: URL del backend deployado en Vercel

### 4. Verificar Deploy

#### 4.1 Verificar Backend
- Accede a la URL del backend deployado
- Debe mostrar un mensaje de API funcionando
- Verifica endpoints: `/api/socios`, `/api/cuotas`

#### 4.2 Verificar Frontend
- Accede a la URL del frontend deployado
- Verifica que la aplicación cargue correctamente
- Prueba el registro de socios
- Verifica la conexión con la base de datos

### 5. Configuraciones Post-Deploy

#### 5.1 Configurar dominios personalizados (opcional)
- En Vercel dashboard, ve a Settings > Domains
- Agrega tu dominio personalizado

#### 5.2 Configurar CORS
El backend ya está configurado para permitir conexiones desde el frontend.

#### 5.3 Configurar notificaciones por email/SMS
- Configura las variables de entorno correspondientes
- Prueba el envío de notificaciones

## Estructura de Variables de Entorno

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REFERENCE].supabase.co:5432/postgres"

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro

# MercadoPago (opcional)
MP_ACCESS_TOKEN=tu-access-token
MP_PUBLIC_KEY=tu-public-key

# Email (opcional)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-app
```

### Frontend (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima

# API
NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app
```

## Comandos de Deploy

### Deploy rápido completo:
```bash
# Backend
cd BackendCCE && vercel --prod

# Frontend  
cd ../FrontendCCE && vercel --prod
```

### Re-deploy tras cambios:
```bash
# Solo si hay cambios en el código
vercel --prod
```

## Troubleshooting

### Error de conexión a base de datos:
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que las tablas estén creadas en Supabase

### Error CORS:
- Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto
- Revisa la configuración de CORS en el backend

### Error 404 en rutas:
- Verifica que `vercel.json` esté configurado correctamente
- Asegúrate de que las rutas del backend coincidan

## Monitoreo

### Logs en Vercel:
- Ve al dashboard de Vercel
- Selecciona el proyecto
- Ve a la pestaña "Functions" para ver logs del backend
- Ve a "Deployments" para logs de build

### Monitoreo de base de datos:
- Usa el dashboard de Supabase
- Ve a "Database" > "Logs" para ver queries
- Usa "Database" > "Reports" para métricas