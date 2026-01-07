# API Documentation - Sistema Multi-Tenant CCE

## Índice
1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Autenticación](#endpoints-de-autenticación)
4. [Endpoints de Socios](#endpoints-de-socios)
5. [Endpoints de Pagos](#endpoints-de-pagos)
6. [Manejo de Errores](#manejo-de-errores)
7. [Códigos de Estado](#códigos-de-estado)

---

## Introducción

La API del Sistema CCE es una API RESTful multi-tenant que permite gestionar clubes deportivos de forma aislada. Cada club (tenant) tiene su propio espacio de datos completamente separado.

### Base URL
```
http://localhost:5000/api
```

### Arquitectura Multi-Tenant

El sistema identifica el tenant de 3 formas (en orden de prioridad):
1. **Subdomain**: `espora.localhost:3000` → tenant slug: `espora`
2. **Header**: `X-Tenant-Slug: espora`
3. **Query Parameter**: `?tenant=espora`

### Headers Requeridos

Para todas las peticiones autenticadas:
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-Slug: <TENANT_SLUG>
Content-Type: application/json
```

---

## Autenticación

El sistema usa **JSON Web Tokens (JWT)** para autenticación. Cada token contiene:
- `userId`: ID del usuario
- `tenantId`: ID del tenant
- Expiración: 24 horas

### Flujo de Autenticación

```
1. Usuario accede a espora.localhost:3000/login
2. Frontend extrae tenant slug "espora" del subdomain
3. Usuario ingresa email + password
4. Frontend envía POST /api/auth/login con X-Tenant-Slug: espora
5. Backend valida credenciales dentro del tenant "espora"
6. Backend retorna JWT token
7. Frontend guarda token en localStorage
8. Frontend incluye token en todas las requests posteriores
```

### Validación de Seguridad

El backend valida que:
- El `tenantId` en el JWT coincida con el tenant del subdomain
- El usuario esté activo (`status: 'active'`)
- El tenant esté activo (`status: 'active'` o `status: 'trial'`)
- El trial no haya expirado (si aplica)

---

## Endpoints de Autenticación

### 1. Registrar Nuevo Club

Crea un nuevo tenant (club) con un usuario administrador.

**Endpoint**: `POST /api/auth/register`

**Acceso**: Público (no requiere autenticación)

**Request Body**:
```json
{
  "clubName": "Club Deportivo Ejemplo",
  "slug": "ejemplo",
  "phone": "+54 11 1234-5678",
  "adminName": "Juan",
  "adminLastName": "Pérez",
  "adminEmail": "admin@ejemplo.com",
  "password": "Password123"
}
```

**Validaciones**:
- `clubName`: 3-100 caracteres
- `slug`: 3-50 caracteres, solo minúsculas, números y guiones
- `email`: formato válido
- `password`: mínimo 8 caracteres, debe contener mayúscula, minúscula y número

**Response 201**:
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": 1,
      "slug": "ejemplo",
      "name": "Club Deportivo Ejemplo",
      "status": "trial",
      "plan": "free",
      "maxMembers": 50,
      "trialEndsAt": "2026-01-21T00:00:00.000Z"
    },
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "admin@ejemplo.com",
      "rol": "admin",
      "tenantId": 1,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Club registrado exitosamente. Trial de 14 días iniciado."
}
```

**Response 400** (Errores de Validación):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "slug",
      "message": "El slug solo puede contener letras minúsculas, números y guiones"
    }
  ]
}
```

**Response 409** (Slug ya existe):
```json
{
  "success": false,
  "message": "El slug 'ejemplo' ya está en uso"
}
```

---

### 2. Login

Autentica un usuario dentro del contexto de un tenant.

**Endpoint**: `POST /api/auth/login`

**Acceso**: Público (requiere tenant via subdomain/header)

**Headers Requeridos**:
```
X-Tenant-Slug: espora
```

**Request Body**:
```json
{
  "email": "admin@espora.com",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Admin",
      "apellido": "Espora",
      "email": "admin@espora.com",
      "rol": "admin",
      "tenantId": 1,
      "status": "active"
    },
    "tenant": {
      "id": 1,
      "slug": "espora",
      "name": "Club Comandante Espora",
      "status": "active",
      "plan": "pro",
      "maxMembers": 500
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response 401** (Credenciales inválidas):
```json
{
  "success": false,
  "message": "Email o contraseña incorrectos"
}
```

**Response 403** (Usuario suspendido):
```json
{
  "success": false,
  "message": "Usuario suspendido. Contacta al administrador."
}
```

**Response 402** (Trial expirado):
```json
{
  "success": false,
  "message": "Trial expirado. Actualiza tu plan para continuar."
}
```

---

### 3. Obtener Usuario Actual

Retorna información del usuario autenticado y su tenant.

**Endpoint**: `GET /api/auth/me`

**Acceso**: Requiere autenticación

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Admin",
      "apellido": "Espora",
      "email": "admin@espora.com",
      "rol": "admin",
      "tenantId": 1,
      "status": "active",
      "lastLoginAt": "2026-01-07T10:30:00.000Z"
    },
    "tenant": {
      "id": 1,
      "slug": "espora",
      "name": "Club Comandante Espora",
      "status": "active",
      "plan": "pro",
      "maxMembers": 500,
      "memberCount": 123,
      "trialEndsAt": null
    }
  }
}
```

---

### 4. Logout

Cierra sesión del usuario (principalmente client-side).

**Endpoint**: `POST /api/auth/logout`

**Acceso**: Requiere autenticación

**Response 200**:
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### 5. Verificar Token

Valida si un JWT token es válido.

**Endpoint**: `POST /api/auth/verify-token`

**Acceso**: Público

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200** (Token válido):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": 1,
    "tenantId": 1
  }
}
```

**Response 200** (Token inválido):
```json
{
  "success": true,
  "data": {
    "valid": false
  }
}
```

---

## Endpoints de Socios

Todos los endpoints de socios requieren autenticación y tenant context.

### Headers Requeridos
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-Slug: espora
```

---

### 1. Listar Socios

Obtiene todos los socios del tenant con filtros y paginación.

**Endpoint**: `GET /api/socios`

**Query Parameters**:
- `actividad` (opcional): `Basquet` | `Voley` | `Karate` | `Gimnasio` | `Solo socio`
- `estado` (opcional): `Activo` | `Inactivo` | `Suspendido`
- `estadoCuota` (opcional): `Pendiente` | `Pagada` | `Vencida` | `Cancelada`
- `search` (opcional): Busca en nombre, apellido, DNI, email
- `page` (opcional, default: 1): Página actual
- `limit` (opcional, default: 20, max: 100): Items por página

**Ejemplo**:
```
GET /api/socios?actividad=Basquet&estado=Activo&page=1&limit=20
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "fechaNacimiento": "1990-05-15",
      "telefono": "+54 11 1234-5678",
      "email": "juan@example.com",
      "actividad": "Basquet",
      "esJugador": true,
      "estado": "Activo",
      "fechaIngreso": "2025-01-01",
      "nombreCompleto": "Juan Pérez",
      "edad": 35,
      "resumenPagos": {
        "total": 12,
        "pendientes": 1,
        "pagadas": 10,
        "vencidas": 1,
        "ultimaCuota": {
          "periodo": "2025-12",
          "estado": "Vencida",
          "fechaVencimiento": "2025-12-10"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 2. Obtener Socio por ID

Obtiene detalles completos de un socio específico.

**Endpoint**: `GET /api/socios/:id`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "fechaNacimiento": "1990-05-15",
    "telefono": "+54 11 1234-5678",
    "email": "juan@example.com",
    "actividad": "Basquet",
    "esJugador": true,
    "estado": "Activo",
    "fechaIngreso": "2025-01-01",
    "nombreCompleto": "Juan Pérez",
    "edad": 35,
    "cuotas": [
      {
        "id": 1,
        "periodo": "2026-01",
        "monto": "5000.00",
        "estado": "Pagada",
        "fechaVencimiento": "2026-01-10",
        "fechaPago": "2026-01-05",
        "metodoPago": "Transferencia"
      }
    ],
    "estadisticasPago": {
      "totalCuotas": 12,
      "cuotasPagadas": 10,
      "cuotasPendientes": 1,
      "cuotasVencidas": 1,
      "montoTotal": 60000,
      "montoPagado": 50000,
      "montoPendiente": 10000
    }
  }
}
```

**Response 404** (No encontrado):
```json
{
  "success": false,
  "message": "Socio no encontrado"
}
```

---

### 3. Crear Socio

Crea un nuevo socio en el tenant.

**Endpoint**: `POST /api/socios`

**Request Body**:
```json
{
  "nombre": "María",
  "apellido": "González",
  "dni": "87654321",
  "fechaNacimiento": "1995-08-20",
  "telefono": "+54 11 8765-4321",
  "email": "maria@example.com",
  "actividad": "Voley",
  "esJugador": false
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "María",
    "apellido": "González",
    "dni": "87654321",
    "fechaNacimiento": "1995-08-20",
    "telefono": "+54 11 8765-4321",
    "email": "maria@example.com",
    "actividad": "Voley",
    "esJugador": false,
    "estado": "Activo",
    "fechaIngreso": "2026-01-07",
    "nombreCompleto": "María González",
    "edad": 30
  },
  "message": "Socio creado exitosamente"
}
```

**Response 409** (DNI/Email ya existe en tenant):
```json
{
  "success": false,
  "message": "Ya existe un socio con este DNI"
}
```

**Response 409** (Límite de miembros alcanzado):
```json
{
  "success": false,
  "message": "Has alcanzado el límite de 50 miembros para tu plan free. Actualiza tu plan para agregar más miembros."
}
```

---

### 4. Actualizar Socio

Actualiza datos de un socio existente.

**Endpoint**: `PUT /api/socios/:id`

**Request Body**:
```json
{
  "telefono": "+54 11 9999-8888",
  "estado": "Suspendido"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+54 11 9999-8888",
    "estado": "Suspendido",
    // ... resto de datos
  },
  "message": "Socio actualizado exitosamente"
}
```

**Response 404**:
```json
{
  "success": false,
  "message": "Socio no encontrado"
}
```

---

### 5. Eliminar Socio

Elimina un socio del tenant.

**Endpoint**: `DELETE /api/socios/:id`

**Query Parameters**:
- `force` (opcional): `true` para forzar eliminación aunque tenga cuotas pendientes

**Response 200**:
```json
{
  "success": true,
  "message": "Socio eliminado exitosamente"
}
```

**Response 400** (Con cuotas pendientes sin force):
```json
{
  "success": false,
  "message": "No se puede eliminar el socio porque tiene cuotas pendientes",
  "data": {
    "cuotasPendientes": 3,
    "montoTotal": 15000
  }
}
```

---

### 6. Obtener Estadísticas

Obtiene estadísticas generales del club.

**Endpoint**: `GET /api/socios/estadisticas`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "socios": {
      "total": 123,
      "activos": 100,
      "inactivos": 20,
      "suspendidos": 3,
      "porActividad": [
        { "actividad": "Basquet", "cantidad": 40 },
        { "actividad": "Voley", "cantidad": 30 },
        { "actividad": "Karate", "cantidad": 25 },
        { "actividad": "Gimnasio", "cantidad": 20 },
        { "actividad": "Solo socio", "cantidad": 8 }
      ]
    },
    "pagos": {
      "totalCuotas": 1500,
      "pagadas": 1200,
      "pendientes": 200,
      "vencidas": 100,
      "tasaCobranza": "80.00"
    },
    "ingresos": {
      "mensuales": [
        { "periodo": "2026-01", "total": 500000 },
        { "periodo": "2025-12", "total": 480000 }
      ]
    }
  }
}
```

---

## Endpoints de Pagos

### 1. Listar Pagos

Obtiene estado de pagos de todos los socios.

**Endpoint**: `GET /api/pagos`

**Query Parameters**:
- `estado` (opcional): `Pendiente` | `Pagada` | `Vencida` | `Cancelada`
- `actividad` (opcional): filtro por actividad
- `fechaDesde` (opcional): ISO date
- `fechaHasta` (opcional): ISO date
- `page` (opcional, default: 1)
- `limit` (opcional, default: 20)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "periodo": "2026-01",
      "monto": "5000.00",
      "estado": "Vencida",
      "fechaVencimiento": "2026-01-10",
      "socio": {
        "id": 1,
        "nombreCompleto": "Juan Pérez",
        "actividad": "Basquet",
        "edad": 35
      },
      "estaVencida": true,
      "diasVencimiento": 3
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### 2. Enviar Links de Pago

Envía links de pago de MercadoPago por email.

**Endpoint**: `POST /api/pagos/enviar-link`

**Request Body**:
```json
{
  "sociosIds": [1, 2, 3],
  "incluirEmail": true,
  "incluirSMS": false
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "resultados": [
      {
        "socioId": 1,
        "cuotaId": 5,
        "nombreSocio": "Juan Pérez",
        "periodo": "2026-01",
        "linkPago": "https://mpago.la/xxxxx",
        "email": {
          "success": true,
          "messageId": "abc123"
        }
      }
    ],
    "errores": [],
    "resumen": {
      "totalSocios": 3,
      "exitosos": 3,
      "conErrores": 0,
      "emailsEnviados": 3,
      "smsEnviados": 0
    }
  },
  "message": "Proceso completado. 3 links enviados, 0 errores."
}
```

---

### 3. Webhook MercadoPago

Recibe notificaciones de pago de MercadoPago.

**Endpoint**: `POST /api/pagos/webhook`

**Acceso**: Público (no requiere autenticación)

**Request Body**: Payload de MercadoPago

---

### 4. Estadísticas de Pagos

Obtiene estadísticas de pagos del club.

**Endpoint**: `GET /api/pagos/estadisticas`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "mesActual": {
      "periodo": "2026-01",
      "estadisticas": [
        { "estado": "Pagada", "cantidad": 80, "total": 400000 },
        { "estado": "Pendiente", "cantidad": 15, "total": 75000 },
        { "estado": "Vencida", "cantidad": 5, "total": 25000 }
      ]
    },
    "general": { /* estadísticas de todos los tiempos */ },
    "metodosPago": [
      { "metodo": "Transferencia", "cantidad": 500, "total": 2500000 },
      { "metodo": "MercadoPago", "cantidad": 300, "total": 1500000 }
    ],
    "tendenciaMensual": [
      {
        "periodo": "2026-01",
        "totalCuotas": 100,
        "cuotasPagadas": 80,
        "tasaCobranza": "80.00",
        "ingresoReal": 400000,
        "ingresoEsperado": 500000
      }
    ]
  }
}
```

---

## Manejo de Errores

Todos los endpoints pueden retornar estos errores comunes:

### 400 Bad Request
Errores de validación o parámetros inválidos.

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

### 401 Unauthorized
Token inválido o expirado.

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

### 403 Forbidden
Sin permisos o tenant mismatch.

```json
{
  "success": false,
  "message": "No tienes permiso para acceder a este recurso"
}
```

### 404 Not Found
Recurso no encontrado.

```json
{
  "success": false,
  "message": "Socio no encontrado"
}
```

### 409 Conflict
Conflicto de datos (duplicados, límites alcanzados).

```json
{
  "success": false,
  "message": "Ya existe un socio con este DNI"
}
```

### 429 Too Many Requests
Rate limit excedido.

```json
{
  "success": false,
  "message": "Demasiadas peticiones. Intenta nuevamente en 60 segundos."
}
```

### 500 Internal Server Error
Error del servidor.

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - No autenticado |
| 402 | Payment Required - Trial expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de datos |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error - Error del servidor |

---

## Ejemplos de Uso

### Registro y Login Completo

```javascript
// 1. Registrar nuevo club
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clubName: 'Mi Club',
    slug: 'miclub',
    adminName: 'Admin',
    adminLastName: 'User',
    adminEmail: 'admin@miclub.com',
    password: 'Password123'
  })
})

const { data } = await registerResponse.json()
const { token, tenant } = data

// 2. Guardar token
localStorage.setItem('auth_token', token)

// 3. Usar API con autenticación
const sociosResponse = await fetch('http://localhost:5000/api/socios', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Slug': tenant.slug,
    'Content-Type': 'application/json'
  }
})

const socios = await sociosResponse.json()
```

---

## Seguridad

### Mejores Prácticas

1. **Nunca** compartas tokens JWT
2. **Siempre** usa HTTPS en producción
3. **Valida** que el subdomain coincida con el tenant del JWT
4. **Regenera** tokens cada 24 horas
5. **Limpia** tokens al hacer logout
6. **Verifica** permisos antes de operaciones críticas

### Cross-Tenant Protection

El sistema valida en cada request que:
```javascript
// Backend valida
if (user.tenantId !== req.tenant.id) {
  throw new ForbiddenError('Tenant mismatch')
}
```

Esto previene que un usuario de un club acceda a datos de otro club, incluso con un token válido.

---

**Versión**: 1.0.0
**Última Actualización**: 07/01/2026
**Contacto**: soporte@clubmanager.com
