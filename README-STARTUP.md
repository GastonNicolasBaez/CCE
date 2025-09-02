# 🚀 Guía de Inicio - Club Comandante Espora

## ✅ Estado Actual del Proyecto

**¡Todo está listo para funcionar!** La aplicación ha sido completamente configurada y está lista para ejecutarse.

### 🎯 Configuraciones Completadas

#### ✅ Backend (Puerto 3001)
- **Base de datos**: SQLite configurada y funcional
- **Email service**: Gmail configurado con credenciales reales
- **MercadoPago**: Configurado con tokens de desarrollo
- **JWT**: Secret único generado
- **CORS**: Configurado para localhost:3000
- **Rate limiting**: Activado
- **Cron jobs**: Servicios automáticos configurados

#### ✅ Frontend (Puerto 3000)  
- **Next.js 14.2.32**: Versión segura actualizada
- **TypeScript**: Configuración estricta
- **Tailwind CSS**: Sistema de diseño glassmorphism
- **Zustand**: State management centralizado
- **API integration**: Conectado con backend
- **Testing**: Suite completa implementada

#### ✅ Seguridad
- **Vulnerabilidades**: 0 críticas (solucionadas)
- **Secretos únicos**: JWT y webhooks generados criptográficamente
- **Variables de entorno**: Configuradas correctamente

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Script Automático (Recomendado)

#### Windows:
```bash
# Doble click en el archivo o ejecutar en CMD
start-app.bat
```

#### Linux/Mac:
```bash
./start-app.sh
```

### Opción 2: Manual

#### Terminal 1 - Backend:
```bash
cd BackendCCE
npm run dev
```

#### Terminal 2 - Frontend:
```bash  
cd FrontendCCE
npm run dev
```

## 🌐 URLs de la Aplicación

- **🖥️ Aplicación Web**: http://localhost:3000
- **📡 API Backend**: http://localhost:3001
- **📊 Health Check**: http://localhost:3001/health

## 📋 Funcionalidades Disponibles

### 🏠 Dashboard
- **Métricas en tiempo real**: Socios totales, activos, cuotas pendientes
- **Gráficos**: Estados de pagos visualizados
- **Registros recientes**: Últimas inscripciones

### 👥 Gestión de Socios
- **CRUD completo**: Crear, leer, actualizar, eliminar socios
- **Filtros avanzados**: Por actividad, estado, pagos
- **Búsqueda**: Por nombre, email, DNI
- **Paginación**: Manejo eficiente de grandes listas

### 💳 Sistema de Pagos
- **MercadoPago**: Links de pago automáticos
- **Email automático**: Información de pago al registrarse
- **Recordatorios**: Sistema automático de recordatorios
- **Estados**: Tracking completo (pendiente, pagado, vencido)

### 📧 Sistema de Emails
- **Templates responsivos**: Diseño profesional
- **Envío automático**: Registro, recordatorios, confirmaciones
- **Gmail integration**: Con App Password segura

### 🔄 Procesos Automáticos (Cron Jobs)
- **09:00 AM**: Envío de recordatorios de pago
- **02:00 AM**: Actualización de estados de cuotas
- **1° de mes 06:00 AM**: Generación de cuotas mensuales

## 🛠️ Comandos Útiles

### Backend
```bash
cd BackendCCE

# Desarrollo
npm run dev

# Inicializar base de datos
npm run init-db

# Tests
npm test

# Linting
npm run lint
```

### Frontend
```bash
cd FrontendCCE

# Desarrollo  
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Tests
npm test

# Linting
npm run lint
```

## 🔧 Configuración Personalizable

### Backend (.env)
```bash
# Puertos
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email (Gmail App Password)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# MercadoPago (tokens reales)
MP_ACCESS_TOKEN=tu-access-token
MP_PUBLIC_KEY=tu-public-key
```

### Actividades Deportivas
Configuradas en el sistema:
- 🏀 **Basketball**: $15.000/mes
- 🏐 **Volleyball**: $12.000/mes  
- 🥋 **Karate**: $18.000/mes
- 💪 **Gimnasio**: $10.000/mes
- 👥 **Socio**: $8.000/mes

## 🔍 Verificación del Sistema

### Health Check
```bash
curl http://localhost:3001/health
```

### Respuesta esperada:
```json
{
  "success": true,
  "message": "Server is running",
  "environment": "development",
  "version": "1.0.0"
}
```

## 📞 Soporte Técnico

### Logs de la Aplicación
- **Backend**: `backend.log`
- **Frontend**: `frontend.log`

### Problemas Comunes

1. **Puerto ocupado**: Los scripts automáticos liberan puertos
2. **Base de datos**: SQLite se crea automáticamente
3. **Email no funciona**: Verificar App Password de Gmail
4. **MercadoPago**: Usar tokens de desarrollo/sandbox

## 🎉 ¡Listo para Usar!

La aplicación está **100% funcional** y lista para:
- ✅ Registrar socios
- ✅ Gestionar pagos
- ✅ Enviar emails automáticos
- ✅ Procesar pagos con MercadoPago
- ✅ Generar reportes y métricas

**¡Disfruta tu aplicación del Club Comandante Espora!** 🏀⚡