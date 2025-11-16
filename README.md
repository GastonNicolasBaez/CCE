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

### 5. Acceder al sistema

**Credenciales por defecto:**
- **Email:** admin@cce.com
- **Contraseña:** admin123

> ⚠️ **Importante:** Cambia estas credenciales en producción

**Usuarios de prueba adicionales:**
| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@cce.com | admin123 | Admin |
| staff@cce.com | staff123 | Staff |

## 📊 Base de Datos

El proyecto incluye datos de prueba:
- 15 socios de ejemplo
- Actividades: Básquet, Vóley, Karate, Gimnasio, Socios
- Pagos y cuotas de ejemplo
- Estados: Activo, Inactivo, Suspendido

## 🔧 Funcionalidades

### Frontend (Next.js 14)
- ✅ **Dashboard con Análisis en Tiempo Real**
  - Métricas dinámicas desde backend
  - Gráficos de tendencias de pagos (Line Chart)
  - Indicadores de socios activos/inactivos
  - Registros recientes
  - Loading skeletons animados

- ✅ **Sistema de Autenticación Completo**
  - Login con JWT
  - Gestión de sesión persistente
  - Rutas protegidas
  - Roles: Admin y Staff
  - Validación en tiempo real de formularios

- ✅ **Gestión de Socios/Jugadores**
  - Tabla interactiva con filtros por estado y tipo
  - Búsqueda en tiempo real
  - Edición inline de datos
  - Estados: Activo, Inactivo, Suspendido
  - Exportación a CSV
  - Eliminación con confirmación

- ✅ **Gestión de Pagos**
  - Visualización de cuotas por mes
  - Estados: Pagada, Pendiente, Vencida, Cancelada
  - Procesamiento de pagos
  - Integración con MercadoPago
  - Exportación de reportes CSV
  - Estadísticas de pagos

- ✅ **Formulario de Inscripción Multi-paso**
  - Validación con Zod + React Hook Form
  - Datos personales, actividad, información médica
  - Soporte para período de prueba
  - Animaciones de transición

- ✅ **Gestión de Usuarios (Admin)**
  - CRUD completo de usuarios del sistema
  - Roles: Admin y Staff
  - Toggle de estado activo/inactivo
  - Prevención de auto-eliminación
  - Validación de contraseñas

- ✅ **Configuración**
  - Perfil de usuario editable
  - Cambio de contraseña seguro
  - Preferencias de notificaciones
  - Gestión de usuarios (solo admins)

- ✅ **UX/UI Avanzado**
  - Diseño glassmorphism/neumorphism
  - Dark mode completo
  - Responsive design (mobile-first)
  - Animaciones con Framer Motion
  - Micro-interacciones en botones
  - Loading skeletons
  - Toast notifications

- ✅ **Accesibilidad WCAG 2.1 AA**
  - Skip-to-content link
  - ARIA labels y roles
  - Focus management
  - Contraste de colores validado
  - Soporte para lectores de pantalla
  - Keyboard navigation
  - Touch targets de 44x44px
  - Reduced motion support

### Backend (Express + PostgreSQL)
- ✅ **API RESTful Completa**
  - Endpoints para socios, pagos, usuarios
  - Versionado de API
  - Documentación inline

- ✅ **Autenticación y Autorización**
  - JWT tokens
  - Middleware de autenticación
  - Control de roles (Admin/Staff)
  - Refresh tokens
  - Encriptación bcrypt

- ✅ **Base de Datos**
  - PostgreSQL con Sequelize ORM
  - Migraciones automáticas
  - Seeders con datos de prueba
  - Compatible con Supabase
  - Soft deletes

- ✅ **Validación y Seguridad**
  - Validación con Joi
  - Sanitización de inputs
  - Rate limiting
  - CORS configurado
  - Helmet para headers
  - XSS protection

- ✅ **Servicios**
  - Email con Nodemailer
  - SMS (integración Twilio)
  - MercadoPago payment processing
  - Cron jobs para recordatorios

- ✅ **Logging y Monitoreo**
  - Morgan para HTTP logs
  - Winston para logs estructurados
  - Error tracking
  - Health checks

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/password` - Cambiar contraseña

### Socios
- `GET /api/socios` - Obtener todos los socios
- `GET /api/socios/:id` - Obtener socio por ID
- `POST /api/socios` - Crear nuevo socio
- `PUT /api/socios/:id` - Actualizar socio
- `DELETE /api/socios/:id` - Eliminar socio (soft delete)
- `GET /api/socios/estadisticas` - Estadísticas generales

### Pagos
- `GET /api/pagos` - Obtener todos los pagos
- `GET /api/pagos/vencidos` - Obtener pagos vencidos
- `GET /api/pagos/estadisticas` - Estadísticas de pagos
- `POST /api/pagos/procesar` - Procesar pago
- `PUT /api/pagos/:id` - Actualizar estado de pago

### Usuarios (Solo Admin)
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `PATCH /api/usuarios/:id/toggle` - Toggle estado activo

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
npm run seed       # Cargar datos de prueba
npm run lint       # Linting con ESLint
npm test          # Ejecutar tests
npm run test:watch # Tests en modo watch
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm start          # Servidor de producción
npm run lint       # Linting con ESLint
npm run type-check # Verificar tipos TypeScript
```

## 🎨 Características de Diseño

### Glassmorphism/Neumorphism
El proyecto utiliza un diseño moderno con efectos de cristal y neumorfismo:
- Cards con backdrop-blur y transparencia
- Sombras suaves y efectos de profundidad
- Gradientes sutiles
- Animaciones fluidas

### Dark Mode
Soporte completo para modo oscuro:
- Toggle en el header
- Persistencia en localStorage
- Transiciones suaves
- Colores optimizados para ambos modos

### Responsive Design
Diseño mobile-first con breakpoints:
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🧪 Testing

```bash
# Backend tests
cd BackendCCE
npm test

# Frontend tests
cd FrontendCCE
npm test

# E2E tests (Cypress)
npm run test:e2e
```

## 🔍 Troubleshooting

### El backend no se conecta a la base de datos
1. Verifica que PostgreSQL esté ejecutándose
2. Revisa las credenciales en `.env`
3. Ejecuta `npm run init-db` nuevamente

### Error de CORS
Si ves errores de CORS, verifica que:
- El backend esté en `http://localhost:3001`
- El frontend esté en `http://localhost:3000`
- Las variables de entorno estén configuradas correctamente

### El frontend no muestra datos
1. Verifica que el backend esté ejecutándose
2. Revisa la consola del navegador para errores
3. Verifica que `NEXT_PUBLIC_API_URL` apunte a `http://localhost:3001`

### Error al hacer login
1. Verifica que `npm run init-db` se haya ejecutado
2. Usa las credenciales por defecto: admin@cce.com / admin123
3. Revisa los logs del backend

## 🚧 Desarrollo

### Workflow Recomendado
1. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
2. Haz commits descriptivos: `git commit -m "feat: agregar nueva funcionalidad"`
3. Push a tu rama: `git push origin feature/mi-feature`
4. Crea un Pull Request

### Convenciones de Código
- **Frontend:** ESLint + Prettier
- **Backend:** ESLint
- **Commits:** Conventional Commits
- **TypeScript:** Strict mode enabled

### Variables de Entorno

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/cce_db
JWT_SECRET=your-secret-key
MERCADOPAGO_ACCESS_TOKEN=your-token
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Club Comandante Espora
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