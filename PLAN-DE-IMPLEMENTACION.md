# 📋 PLAN DE IMPLEMENTACIÓN - SISTEMA MULTI-TENANT CCE

**Fecha:** 2026-01-09
**Estado:** En Progreso
**Prioridad:** Correcciones Críticas → Funcionalidades Básicas → Mejoras Avanzadas

---

## 🎯 OBJETIVOS PRINCIPALES

1. ✅ Corregir problemas críticos de seguridad y funcionalidad
2. ✅ Completar gestión de socios con todos los campos requeridos
3. ✅ Implementar sistema de cuotas automático con configuración flexible
4. ✅ Crear panel de configuración para admin del club
5. ✅ Implementar roles (SuperAdmin, Admin Club, Operador)
6. ✅ Sistema de reportes básicos

---

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (1-2 días)

### 1.1 Seguridad y Base de Datos

**Prioridad:** 🔴 CRÍTICA

- [ ] **Verificar constraints de BD** (30 min)
  - Ejecutar query SQL para verificar constraints de `socios` table
  - Confirmar que DNI y email tienen índices compuestos con `tenant_id`
  - Si no existen, crear migración para corregir
  - Archivo: Nueva migración `20260109000001-fix-socio-unique-constraints.js`

- [ ] **Proteger rutas mal ordenadas** (15 min)
  - Reordenar rutas en `BackendCCE/src/routes/socios.js`
  - Mover `/estadisticas` y `/send-payment-email` ANTES de `/:id`
  - Agregar middleware `authenticate` a `/send-payment-email`

- [ ] **Verificar aislamiento multi-tenant** (30 min)
  - Test manual: Crear 2 tenants, intentar acceder datos de uno con token del otro
  - Confirmar que todos los endpoints filtran por `tenantId`

### 1.2 Funcionalidades Básicas Faltantes

**Prioridad:** 🔴 CRÍTICA

- [ ] **Implementar logout** (30 min)
  - Frontend: Agregar botón "Cerrar Sesión" en `Header.tsx`
  - Llamar a `auth.logout()` cuando se hace click
  - Limpiar localStorage y cookie
  - Redirigir a `/login`
  - Archivos: `FrontendCCE/components/ui/Header.tsx`, `FrontendCCE/lib/auth.ts`

---

## 🟠 FASE 2: MODELO DE DATOS - SOCIOS Y CUOTAS (2-3 días)

### 2.1 Actualizar Modelo Socio

**Prioridad:** 🟠 ALTA

- [ ] **Agregar campos para menores de edad** (1 hora)
  - Backend: Migración para agregar campos
    - `tutor_nombre` VARCHAR(200) nullable
    - `tutor_telefono` VARCHAR(20) nullable
  - Modelo: Actualizar `BackendCCE/src/models/Socio.js`
  - Validación: Obligatorios si `edad < 18` (calculado desde fecha_nacimiento)

- [ ] **Cambiar actividad de ENUM a ARRAY** (2 horas)
  - Migración: Cambiar columna `actividad` a `actividades` JSONB o ARRAY
  - Modelo: Actualizar campo
  - Backend: Actualizar validaciones en `sociosController.js`
  - Frontend: Actualizar formulario para selección múltiple (checkboxes)
  - Archivos afectados:
    - `BackendCCE/migrations/20260109000002-change-actividad-to-array.js`
    - `BackendCCE/src/models/Socio.js`
    - `FrontendCCE/components/registration/RegistrationForm.tsx`

- [ ] **Agregar campos para exención de cuota** (1 hora)
  - Migración: Agregar campos
    - `exento_cuota` BOOLEAN default false
    - `mes_gracia_hasta` DATE nullable
  - Modelo: Actualizar validaciones
  - UI: Checkboxes en formulario de socio

### 2.2 Sistema de Configuración de Cuotas

**Prioridad:** 🟠 ALTA

- [ ] **Crear tabla de configuración de tenant** (2 horas)
  - Migración: `tenant_configuracion` table
    - `tenant_id` (FK a tenants)
    - `tipo_cuota` ENUM('unica', 'por_actividad') default 'unica'
    - `monto_base` DECIMAL(10,2) default 0
    - `montos_por_actividad` JSONB nullable
    - `dia_vencimiento` INTEGER default 10 (día del mes)
    - `multiple_actividades_strategy` ENUM('sumar', 'maximo') default 'sumar'
    - `recordatorio_dias_antes` INTEGER default 2
    - Timestamps
  - Modelo: Crear `BackendCCE/src/models/TenantConfiguracion.js`
  - Relación: Tenant hasOne TenantConfiguracion

- [ ] **Valores por defecto al crear tenant** (30 min)
  - Hook: En `authController.register`, crear configuración con defaults
  - Default: tipo_cuota='unica', monto_base=5000, dia_vencimiento=10

### 2.3 Generación Automática de Cuotas

**Prioridad:** 🟠 ALTA

- [ ] **Lógica de generación de cuotas** (3 horas)
  - Función: `generarCuotaMensual(socio, periodo)` en `BackendCCE/src/services/cuotaService.js`
  - Lógica:
    1. Verificar si socio está activo
    2. Verificar si `exento_cuota = false`
    3. Verificar si `mes_gracia_hasta` ya pasó o es null
    4. Obtener configuración del tenant
    5. Calcular monto según tipo_cuota:
       - Si 'unica': usar monto_base
       - Si 'por_actividad': sumar o tomar máximo según strategy
    6. Calcular fecha_vencimiento: `dia_vencimiento` del mes actual
    7. Crear cuota con estado 'Pendiente'
  - Retornar cuota creada o null si no aplica

- [ ] **Cron job de generación mensual** (2 horas)
  - Actualizar `BackendCCE/src/services/cronService.js`
  - Schedule: 1ro de cada mes a las 00:00 (ya existe esqueleto)
  - Lógica:
    1. Obtener todos los tenants activos
    2. Por cada tenant:
       - Obtener socios activos del tenant
       - Por cada socio: llamar a `generarCuotaMensual()`
    3. Log de cuántas cuotas se generaron
    4. Enviar email al admin con resumen (opcional)

- [ ] **Generar cuota al registrar socio** (1 hora)
  - En `sociosController.create()`
  - Después de crear socio exitosamente:
    - Calcular mes siguiente: `new Date().getMonth() + 1`
    - Llamar a `generarCuotaMensual(socio, periodo)`
  - Solo si NO tiene mes de gracia activo

---

## 🟡 FASE 3: FORMULARIOS Y UI - GESTIÓN DE SOCIOS (2 días)

### 3.1 Formulario de Registro de Socios

**Prioridad:** 🟠 ALTA

- [ ] **Completar campos obligatorios** (2 horas)
  - Frontend: `FrontendCCE/components/registration/RegistrationForm.tsx`
  - Campos a agregar/corregir:
    - DNI: Input real (no placeholder)
    - Fecha Nacimiento: Date picker (calcular edad automáticamente)
    - Teléfono: Validación de formato
    - Email: Validación
    - Actividades: Checkboxes múltiples (reemplazar select único)
    - **Condicional si edad < 18:**
      - Nombre completo del tutor (obligatorio)
      - Teléfono del tutor (obligatorio)
    - Exento de cuota: Checkbox
    - Mes de gracia hasta: Date picker (opcional)
  - Validación frontend:
    - DNI 7-8 dígitos
    - Email formato válido
    - Teléfono formato argentino
    - Si menor, tutor obligatorio

- [ ] **Conectar formulario con backend** (1 hora)
  - API call: `api.socios.create()` en `FrontendCCE/lib/api.ts`
  - Mapear campos correctamente:
    ```javascript
    {
      nombre,
      apellido,
      dni,
      email,
      telefono,
      fechaNacimiento,
      actividades: ['Basquet', 'Gimnasio'], // array
      tutorNombre,
      tutorTelefono,
      exentoCuota,
      mesGraciaHasta,
      estado: 'Activo'
    }
    ```
  - Manejo de errores: mostrar mensajes de validación del backend

### 3.2 Lista de Socios

**Prioridad:** 🟡 MEDIA

- [ ] **Agregar filtro de morosidad** (1 hora)
  - Backend: Agregar query param `?moroso=true` en `GET /api/socios`
  - Lógica: JOIN con cuotas donde `estado='Vencida'`
  - Frontend: Agregar botón filtro "Ver solo morosos"

- [ ] **Mostrar campo de múltiples actividades** (30 min)
  - En `MembersTable.tsx`: Columna "Actividades"
  - Mostrar: "Basquet, Gimnasio" (comma separated)

- [ ] **Implementar paginación** (2 horas)
  - Backend: Ya soporta `?page=1&limit=20`
  - Frontend: Agregar componente Pagination
  - Mantener filtros al cambiar de página
  - Mostrar: "Mostrando 1-20 de 150 socios"

### 3.3 Editar y Desactivar Socios

**Prioridad:** 🟡 MEDIA

- [ ] **Modal de edición de socio** (2 horas)
  - Componente: `FrontendCCE/components/members/EditMemberModal.tsx`
  - Pre-cargar datos del socio
  - Mismo formulario que registro pero con datos existentes
  - NO permitir cambiar DNI
  - Validaciones iguales a crear
  - API: PUT `/api/socios/:id`

- [ ] **Cambiar "Eliminar" por "Desactivar/Reactivar"** (1 hora)
  - En `MembersTable.tsx`: Reemplazar botón "Eliminar"
  - Si `estado='Activo'`: Botón "Desactivar" (rojo)
  - Si `estado='Inactivo'`: Botón "Reactivar" (verde)
  - Modal de confirmación:
    - Desactivar: "¿Desactivar a Juan Pérez? Las cuotas pendientes quedarán pendientes."
    - Reactivar: "¿Reactivar a Juan Pérez? Se reanudarán las cuotas mensuales."
  - API: PUT `/api/socios/:id` con `{ estado: 'Inactivo' }`

---

## 🟢 FASE 4: GESTIÓN DE PAGOS (2 días)

### 4.1 Registrar Pago Manual

**Prioridad:** 🟡 MEDIA

- [ ] **Endpoint para actualizar cuota** (1 hora)
  - Backend: PUT `/api/cuotas/:id`
  - Body: `{ estado: 'Pagada', metodoPago: 'Efectivo', fechaPago: '2026-01-09', numeroRecibo: 'CCE-001' }`
  - Validaciones:
    - Solo puede actualizar cuotas de su tenant
    - Estado debe ser 'Pagada', 'Pendiente', 'Vencida' o 'Cancelada'
    - Si estado='Pagada', fechaPago es obligatorio
  - Generar número de recibo automático si no se proporciona
  - Archivo: `BackendCCE/src/controllers/cuotasController.js` (nuevo)

- [ ] **Modal de registro de pago** (2 horas)
  - Componente: `FrontendCCE/components/payments/RegisterPaymentModal.tsx`
  - Abrir desde lista de cuotas o desde detalle de socio
  - Campos:
    - Socio: (readonly, ya seleccionado)
    - Periodo: (readonly)
    - Monto: (readonly o editable?)
    - Método de pago: Select (Efectivo, Transferencia, MercadoPago, Tarjeta)
    - Fecha de pago: Date picker (default: hoy)
    - Número de recibo: (opcional, auto-generado si vacío)
    - Observaciones: Textarea (opcional)
  - Botón "Registrar Pago"
  - Actualizar lista de cuotas después de registrar

### 4.2 Lista de Cuotas Pendientes/Vencidas

**Prioridad:** 🟡 MEDIA

- [ ] **Vista de cuotas** (2 horas)
  - Componente: `FrontendCCE/components/payments/PaymentsList.tsx`
  - Tabs:
    - "Pendientes" (estado=Pendiente)
    - "Vencidas" (estado=Vencida) - con alerta roja
    - "Pagadas" (estado=Pagada)
  - Columnas:
    - Socio (nombre completo)
    - Periodo (Enero 2026)
    - Monto
    - Fecha vencimiento
    - Estado (badge con color)
    - Acciones: "Registrar Pago" | "Ver Recibo"
  - Filtros: Por actividad, por estado, búsqueda por socio
  - Botón: "Enviar recordatorios a todos" (envía emails masivos)

### 4.3 Recordatorios Automáticos

**Prioridad:** 🟢 BAJA

- [ ] **Cron job de recordatorios** (2 horas)
  - Actualizar `BackendCCE/src/services/cronService.js`
  - Schedule: Diario a las 09:00 AM
  - Lógica:
    1. Obtener configuración de cada tenant (`recordatorio_dias_antes`)
    2. Calcular fecha objetivo: `HOY + dias_antes = fecha_vencimiento`
    3. Buscar cuotas con:
       - `fecha_vencimiento = fecha_objetivo`
       - `estado = 'Pendiente'`
    4. Por cada cuota:
       - Obtener socio y tenant
       - Generar link de pago de MercadoPago (si configurado)
       - Enviar email con template
  - Template de email: "Hola {nombre}, tu cuota de {periodo} vence en 2 días. Link de pago: {link}"

- [ ] **Plantilla de email** (1 hora)
  - Archivo: `BackendCCE/templates/email-recordatorio.html`
  - Variables: {nombre}, {periodo}, {monto}, {fecha_vencimiento}, {link_pago}
  - Diseño: HTML responsive con logo del club (si tiene)

---

## 🔵 FASE 5: PANEL DE CONFIGURACIÓN DEL CLUB (2-3 días)

### 5.1 Estructura de Configuración

**Prioridad:** 🟡 MEDIA

- [ ] **Página de configuración** (1 hora)
  - Frontend: `FrontendCCE/app/configuracion/page.tsx`
  - Sidebar: Agregar item "⚙️ Configuración" (solo visible para admin)
  - Tabs:
    - "General" (nombre del club, contacto)
    - "Cuotas" (montos, vencimiento)
    - "Pagos" (MercadoPago, métodos)
    - "Notificaciones" (emails, recordatorios)

### 5.2 Configuración General

**Prioridad:** 🟡 MEDIA

- [ ] **Datos del club** (2 horas)
  - Campos editables:
    - Nombre del club
    - Email de contacto
    - Teléfono
    - Logo (upload de imagen) - guardar en storage o base64
    - Colores personalizados: Color primario, Color secundario
  - Endpoint: PUT `/api/tenants/:id`
  - Solo admin del tenant puede editar

### 5.3 Configuración de Cuotas

**Prioridad:** 🟠 ALTA

- [ ] **Formulario de configuración de cuotas** (3 horas)
  - Campos:
    - **Tipo de cuota:**
      - ○ Cuota única para todos (input monto: $____)
      - ○ Cuota diferenciada por actividad
    - **Si "por actividad":**
      - Basquet: $____
      - Voley: $____
      - Karate: $____
      - Gimnasio: $____
      - Solo socio: $____
    - **Múltiples actividades:**
      - ○ Sumar todas las actividades
      - ○ Cobrar solo la más cara
    - **Día de vencimiento:** [select 1-28]
    - **Recordatorios:** Enviar ___ días antes del vencimiento
  - Validaciones:
    - Montos > 0
    - Día vencimiento entre 1 y 28
  - Endpoint: PUT `/api/configuracion/:tenant_id`
  - Preview: Mostrar ejemplos de cálculo

### 5.4 Configuración de MercadoPago

**Prioridad:** 🟢 BAJA

- [ ] **Integración de MercadoPago** (3 horas)
  - Campos:
    - ☑️ Habilitar MercadoPago
    - Access Token: [input password]
    - Public Key: [input text]
    - Botón "Probar conexión" (verificar credenciales)
  - Backend:
    - Guardar encriptado en `tenant_configuracion.mercadopago_credentials` (JSONB)
    - Endpoint: PUT `/api/configuracion/mercadopago`
  - Lógica de pago:
    - Al generar link: Usar credenciales del tenant
    - Webhook: Mapear payment_id a cuota_id del tenant

---

## 🟣 FASE 6: ROLES Y PERMISOS (2 días)

### 6.1 Sistema de Roles

**Prioridad:** 🟡 MEDIA

- [ ] **Actualizar modelo Usuario** (1 hora)
  - Cambiar campo `rol` de ENUM('admin', 'user')
  - A: ENUM('super_admin', 'admin', 'operador')
  - Migración: `20260110000001-update-usuario-roles.js`
  - super_admin: tenant_id = NULL (global)
  - admin: tenant_id = X (admin del club)
  - operador: tenant_id = X (staff del club)

- [ ] **Middleware de permisos** (2 horas)
  - Backend: `BackendCCE/src/middleware/permissions.js`
  - Función: `requireRole(['admin', 'operador'])` (array de roles permitidos)
  - Aplicar a rutas:
    - `/api/configuracion/*` → solo 'admin'
    - `/api/reportes/*` → solo 'admin'
    - `/api/socios/*` → 'admin' y 'operador'
    - `/api/cuotas/*` → 'admin' y 'operador'

- [ ] **UI condicional por rol** (1 hora)
  - Frontend: Hook `useRole()` que lee rol del usuario
  - Ocultar elementos según rol:
    - "Configuración" sidebar → solo admin
    - "Reportes" sidebar → solo admin
    - Botones de desactivar socio → admin y operador

### 6.2 Panel de SuperAdmin

**Prioridad:** 🟢 BAJA (post-MVP)

- [ ] **Página de super admin** (4 horas)
  - Frontend: `FrontendCCE/app/admin/page.tsx`
  - Ruta especial: `/admin` (NO usa subdominio)
  - Login separado: `/admin/login`
  - Lista de todos los tenants:
    - Columnas: Nombre, Slug, Plan, Status, Socios, Fecha creación
    - Acciones: Ver, Editar, Suspender, Eliminar
  - Botón "Entrar como admin" → hace login en el tenant como admin
  - Estadísticas globales:
    - Total tenants activos
    - Total socios en plataforma
    - Recaudación total (si aplica)
    - Gráfico de crecimiento

---

## 🟠 FASE 7: BÚSQUEDA Y REPORTES (2 días)

### 7.1 Búsqueda Global

**Prioridad:** 🟡 MEDIA

- [ ] **Endpoint de búsqueda** (1 hora)
  - Backend: GET `/api/search?q=juan`
  - Buscar en:
    - Socios: nombre, apellido, dni, email
    - Cuotas: numero_recibo
  - Retornar: Tipo de resultado + datos básicos
  - Filtrado por tenant

- [ ] **Implementar búsqueda en header** (2 horas)
  - Frontend: `Header.tsx`
  - Input de búsqueda con debounce (500ms)
  - Dropdown con resultados:
    - Sección "Socios" (máximo 5 resultados)
    - Sección "Cuotas" (máximo 5 resultados)
  - Click en resultado: Navegar a detalle

### 7.2 Reportes

**Prioridad:** 🟢 BAJA

- [ ] **Endpoint de reportes** (3 horas)
  - Backend: GET `/api/reportes/recaudacion?mes=2026-01&format=json|pdf`
  - Tipos de reporte:
    - Recaudación mensual: Suma de cuotas pagadas por mes
    - Recaudación anual: Suma de cuotas pagadas por año
    - Socios morosos: Lista de socios con cuotas vencidas
    - Socios activos por actividad: Conteo de socios por actividad
  - Formato JSON (para gráficos) y PDF (para imprimir)

- [ ] **Página de reportes** (2 horas)
  - Frontend: `FrontendCCE/app/reportes/page.tsx`
  - Selector de tipo de reporte
  - Filtros: Mes/año, actividad
  - Botón "Generar PDF"
  - Visualización con gráficos (Recharts)

---

## ⚪ FASE 8: PULIDO Y TESTING (2 días)

### 8.1 Tests

**Prioridad:** 🟢 BAJA

- [ ] **Tests de aislamiento multi-tenant** (2 horas)
  - Test: Crear 2 tenants, intentar acceder datos cruzados
  - Test: Verificar que queries siempre incluyen tenant_id
  - Test: Intentar actualizar socio de otro tenant

- [ ] **Tests de generación de cuotas** (2 horas)
  - Test: Generar cuota con configuración 'unica'
  - Test: Generar cuota con configuración 'por_actividad'
  - Test: NO generar cuota si exento_cuota=true
  - Test: NO generar cuota si mes_gracia_hasta vigente

- [ ] **Tests de roles** (1 hora)
  - Test: Operador NO puede acceder a configuración
  - Test: Admin puede acceder a todo
  - Test: SuperAdmin puede ver todos los tenants

### 8.2 Recuperación de Contraseña

**Prioridad:** 🟢 BAJA (post-MVP)

- [ ] **Flujo de reset password** (4 horas)
  - Endpoint: POST `/api/auth/forgot-password` (envía email con token)
  - Endpoint: POST `/api/auth/reset-password` (valida token, cambia password)
  - Frontend: Páginas `/recuperar` y `/reset-password/:token`
  - Email con link temporal (válido 1 hora)

---

## 📊 RESUMEN DE PRIORIDADES

| Fase | Días | Prioridad | Estado |
|------|------|-----------|--------|
| Fase 1: Correcciones Críticas | 1-2 | 🔴 CRÍTICA | Pendiente |
| Fase 2: Modelo de Datos | 2-3 | 🟠 ALTA | Pendiente |
| Fase 3: UI Gestión Socios | 2 | 🟠 ALTA | Pendiente |
| Fase 4: Gestión de Pagos | 2 | 🟡 MEDIA | Pendiente |
| Fase 5: Configuración | 2-3 | 🟡 MEDIA | Pendiente |
| Fase 6: Roles y Permisos | 2 | 🟡 MEDIA | Pendiente |
| Fase 7: Búsqueda y Reportes | 2 | 🟢 BAJA | Pendiente |
| Fase 8: Pulido y Testing | 2 | 🟢 BAJA | Pendiente |

**TOTAL ESTIMADO:** 15-19 días de desarrollo

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. ✅ Comenzar con **FASE 1: Correcciones Críticas**
2. ✅ Implementar logout (30 min)
3. ✅ Verificar constraints de BD (30 min)
4. ✅ Proteger rutas (15 min)

Una vez completada Fase 1, continuar con Fase 2 (Modelo de Datos).

---

## 📝 NOTAS IMPORTANTES

- **Migrar datos existentes:** Si ya hay socios registrados, crear script de migración de datos para el campo `actividades` (de string a array)
- **Backup de BD:** Hacer backup antes de cada migración importante
- **Testing en ambiente de prueba:** Probar todas las funcionalidades en tenant de prueba antes de pasar a producción
- **Documentación:** Actualizar API-DOCUMENTATION.md después de cada fase

---

**Última actualización:** 2026-01-09
**Responsable:** Claude + Usuario
