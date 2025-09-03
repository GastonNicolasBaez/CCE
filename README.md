# Club Comandante Espora - Sistema de Gestión

Sistema completo de gestión para el Club Comandante Espora, incluyendo gestión de socios, pagos, y actividades deportivas (básquet, vóley, karate, gimnasio).

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 22.0.0 o superior
- npm o yarn

### 1. Instalar dependencias

#### Backend
```bash
cd BackendCCE
npm install
```

#### Frontend  
```bash
cd FrontendCCE
npm install
```

### 2. Configurar variables de entorno

El proyecto ya viene con archivos `.env` preconfigurados para desarrollo local.

### 3. Inicializar la base de datos

```bash
cd BackendCCE
npm run init-db
```

### 4. Ejecutar el proyecto

#### Terminal 1 - Backend
```bash
cd BackendCCE
npm run dev
```
El backend se ejecutará en: http://localhost:3001

#### Terminal 2 - Frontend
```bash
cd FrontendCCE
npm run dev
```
El frontend se ejecutará en: http://localhost:3000

## 📊 Base de Datos

El proyecto incluye datos de prueba:
- 15 socios de ejemplo
- Actividades: Básquet, Vóley, Karate, Gimnasio, Socios
- Pagos y cuotas de ejemplo
- Estados: Activo, Inactivo, Suspendido

## 🔧 Funcionalidades

### Frontend (Next.js 14)
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de socios/jugadores
- ✅ Tabla interactiva con filtros
- ✅ Formulario de inscripción multi-paso
- ✅ Diseño glassmorphism/neumorphism
- ✅ Responsive design

### Backend (Express + PostgreSQL)
- ✅ API RESTful completa
- ✅ Base de datos PostgreSQL con Sequelize ORM
- ✅ Compatible con Supabase
- ✅ Validación de datos con Joi
- ✅ Manejo de errores robusto
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Logging con Morgan

## 🔗 API Endpoints

### Socios
- `GET /api/socios` - Obtener todos los socios
- `GET /api/socios/:id` - Obtener socio por ID
- `POST /api/socios` - Crear nuevo socio
- `PUT /api/socios/:id` - Actualizar socio
- `DELETE /api/socios/:id` - Eliminar socio
- `GET /api/socios/estadisticas` - Estadísticas generales

### Pagos
- `GET /api/pagos/vencidos` - Obtener pagos vencidos
- `POST /api/pagos/procesar` - Procesar pago

### Health Check
- `GET /health` - Estado del servidor

## 🛠️ Tecnologías

### Frontend
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS
- Zustand (estado)
- Framer Motion (animaciones)
- React Hook Form + Zod
- TanStack Table
- Recharts

### Backend  
- Express.js
- PostgreSQL + Sequelize ORM
- Supabase compatible
- Joi (validación)
- bcryptjs (encriptación)
- nodemailer (emails)
- node-cron (tareas programadas)
- MercadoPago integration

## 📝 Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm run init-db    # Inicializar base de datos
npm run lint       # Linting con ESLint  
npm test          # Ejecutar tests
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm start          # Servidor de producción
npm run lint       # Linting con ESLint
```

## 📱 Estructura del Proyecto

```
CCE/
├── BackendCCE/           # API Backend
│   ├── src/
│   │   ├── config/       # Configuraciones
│   │   ├── controllers/  # Controladores
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Rutas de la API
│   │   ├── services/     # Servicios (email, SMS, etc)
│   │   ├── middleware/   # Middlewares
│   │   └── utils/        # Utilidades
│   ├── database-schema.sql # Schema de PostgreSQL
│   └── .env             # Variables de entorno
├── FrontendCCE/          # Frontend Next.js
│   ├── app/             # App Router de Next.js
│   ├── components/      # Componentes React
│   ├── lib/            # Utilidades y configuración
│   └── .env.local      # Variables de entorno
└── README.md
```

## 🔐 Seguridad

- Rate limiting configurado
- Validación de datos en backend
- CORS configurado para desarrollo
- Helmet para headers de seguridad
- Variables de entorno para secrets

## 🚀 Deploy en Producción

Para deploy en producción con Vercel + Supabase, consulta el archivo `DEPLOY.md` que contiene instrucciones detalladas paso a paso.

## 📞 Soporte

Si tienes problemas:
1. Verifica que ambos servidores estén ejecutándose
2. Revisa la consola para errores
3. Verifica que los puertos 3000 y 3001 estén disponibles
4. Para deploy en producción, consulta `DEPLOY.md`