# 🏀 Backend CCE - Club Comandante Espora API

Sistema backend completo para la gestión del Club Comandante Espora, desarrollado con Node.js, Express y SQLite.

## 🚀 Características Principales

- **API RESTful completa** para gestión de socios y pagos
- **Base de datos SQLite** con Sequelize ORM
- **Integración con MercadoPago** para pagos online
- **Sistema de notificaciones** vía Email y SMS
- **Tareas programadas (Cron Jobs)** para recordatorios automáticos
- **Validación de datos** con Joi
- **Manejo de errores** centralizado
- **Rate limiting** para protección de API
- **Logs detallados** para monitoreo

## 🛠️ Tecnologías Utilizadas

- **Node.js** 18+
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos ligera
- **MercadoPago SDK** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **Twilio** - Envío de SMS
- **node-cron** - Tareas programadas
- **Joi** - Validación de esquemas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📁 Estructura del Proyecto

```
BackendCCE/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración de Sequelize
│   │   └── index.js         # Configuración general
│   ├── controllers/
│   │   ├── sociosController.js  # Controladores de socios
│   │   └── pagosController.js   # Controladores de pagos
│   ├── middleware/
│   │   ├── errorHandler.js     # Manejo de errores
│   │   ├── validation.js       # Validaciones Joi
│   │   └── rateLimiter.js      # Rate limiting
│   ├── models/
│   │   ├── Socio.js           # Modelo de socios
│   │   ├── Cuota.js           # Modelo de cuotas
│   │   └── index.js           # Configuración de modelos
│   ├── routes/
│   │   ├── socios.js          # Rutas de socios
│   │   └── pagos.js           # Rutas de pagos
│   ├── services/
│   │   ├── mercadoPagoService.js  # Servicio MercadoPago
│   │   ├── emailService.js        # Servicio de emails
│   │   ├── smsService.js          # Servicio de SMS
│   │   └── cronService.js         # Tareas programadas
│   ├── utils/
│   │   └── initDatabase.js    # Inicialización de DB
│   └── server.js              # Servidor principal
├── package.json
├── .env.example
└── README.md
```

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd BackendCCE
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MercadoPago Configuration
MP_ACCESS_TOKEN=tu-access-token-de-mercadopago
MP_PUBLIC_KEY=tu-public-key-de-mercadopago

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=tu-account-sid-de-twilio
TWILIO_AUTH_TOKEN=tu-auth-token-de-twilio
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Inicializar la base de datos

```bash
npm run init-db
```

Para recrear la base de datos con datos de ejemplo:

```bash
npm run init-db -- --force
```

### 5. Ejecutar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## 📊 Modelos de Datos

### Socio
```javascript
{
  id: INTEGER (PK, Auto-increment),
  nombre: STRING (required),
  apellido: STRING (required),
  dni: STRING (unique, required),
  fechaNacimiento: DATE (required),
  telefono: STRING (required),
  email: STRING (unique, required),
  actividad: ENUM('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio'),
  esJugador: BOOLEAN,
  estado: ENUM('Activo', 'Inactivo', 'Suspendido'),
  fechaIngreso: DATE
}
```

### Cuota
```javascript
{
  id: INTEGER (PK, Auto-increment),
  socioId: INTEGER (FK to Socio),
  monto: DECIMAL(10,2),
  fechaVencimiento: DATE,
  fechaPago: DATE,
  estado: ENUM('Pendiente', 'Pagada', 'Vencida', 'Anulada'),
  metodoPago: ENUM('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'),
  numeroRecibo: STRING,
  mercadoPagoId: STRING,
  linkPago: TEXT,
  periodo: STRING (YYYY-MM format)
}
```

## 🌐 API Endpoints

### Gestión de Socios

- `GET /api/socios` - Obtener todos los socios (con filtros y paginación)
- `GET /api/socios/:id` - Obtener socio por ID
- `GET /api/socios/estadisticas` - Obtener estadísticas generales
- `POST /api/socios` - Crear nuevo socio
- `PUT /api/socios/:id` - Actualizar socio
- `DELETE /api/socios/:id` - Eliminar socio

### Gestión de Pagos

- `GET /api/pagos` - Obtener estado de pagos (con filtros y paginación)
- `GET /api/pagos/estadisticas` - Obtener estadísticas de pagos
- `POST /api/pagos/enviar-link` - Enviar links de pago por email/SMS
- `POST /api/pagos/webhook` - Webhook para confirmación de pagos MercadoPago
- `POST /api/pagos/programar-recordatorios` - Disparar recordatorios de pago

### Ejemplos de Uso

#### Crear un nuevo socio
```bash
curl -X POST http://localhost:3001/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "fechaNacimiento": "1990-01-15",
    "telefono": "+54 11 1234-5678",
    "email": "juan.perez@email.com",
    "actividad": "Basquet",
    "esJugador": true
  }'
```

#### Enviar links de pago
```bash
curl -X POST http://localhost:3001/api/pagos/enviar-link \
  -H "Content-Type: application/json" \
  -d '{
    "sociosIds": [1, 2, 3],
    "incluirEmail": true,
    "incluirSMS": false
  }'
```

## ⚡ Tareas Programadas (Cron Jobs)

El sistema incluye tareas automáticas que se ejecutan en horarios programados:

### Recordatorios de Pago
- **Frecuencia**: Diario a las 9:00 AM
- **Función**: Envía recordatorios por email y SMS a socios con cuotas vencidas
- **Límite**: Máximo 5 recordatorios por cuota

### Actualización de Estados
- **Frecuencia**: Diario a las 2:00 AM
- **Función**: Actualiza cuotas pendientes a vencidas según fecha

### Generación de Cuotas Mensuales
- **Frecuencia**: 1° de cada mes a las 6:00 AM
- **Función**: Genera automáticamente las cuotas del mes para todos los socios activos

## 🔐 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso entre dominios
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Validación de entrada**: Joi schemas para todos los endpoints
- **Manejo de errores**: Sistema centralizado sin exposición de información sensible

## 📧 Sistema de Notificaciones

### Email (Nodemailer)
- Templates HTML responsive
- Confirmaciones de pago
- Recordatorios de cuotas vencidas
- Links de pago de MercadoPago

### SMS (Twilio)
- Mensajes de texto concisos
- Confirmaciones de pago
- Recordatorios de vencimiento
- Links de pago acortados

## 💰 Integración MercadoPago

- Generación automática de links de pago
- Webhooks para confirmación de pagos
- Manejo de estados de pago (aprobado, pendiente, rechazado)
- Actualización automática de base de datos

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén disponibles)
npm test

# Verificar salud del servidor
curl http://localhost:3001/health
```

## 🚀 Despliegue

### Variables de Entorno Importantes

Asegúrate de configurar en producción:

- `NODE_ENV=production`
- Credenciales reales de MercadoPago
- SMTP configurado para emails
- Twilio configurado para SMS
- `FRONTEND_URL` apuntando al dominio correcto

### Comandos de Producción

```bash
# Instalar dependencias de producción
npm ci --only=production

# Inicializar base de datos
npm run init-db

# Iniciar servidor
npm start
```

## 📝 Logs y Monitoreo

El servidor genera logs detallados para:

- Conexiones de base de datos
- Errores de aplicación
- Requests HTTP (en desarrollo)
- Ejecución de cron jobs
- Estado de servicios externos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@clubcomandanteespora.com
- Issues: GitHub Issues del proyecto

---

**Club Comandante Espora** - Transformando la gestión deportiva con tecnología de vanguardia 🏆