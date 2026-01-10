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

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (1-2 días) ✅ COMPLETADA

### 1.1 Seguridad y Base de Datos

**Prioridad:** 🔴 CRÍTICA

- [x] **Verificar constraints de BD** (30 min) ✅
  - Creado script `BackendCCE/scripts/verify-constraints.js`
  - Ejecutar: `node scripts/verify-constraints.js` para verificar
  - Confirmar que DNI y email tienen índices compuestos con `tenant_id`

- [x] **Proteger rutas mal ordenadas** (15 min) ✅
  - Reordenadas rutas en `BackendCCE/src/routes/socios.js`
  - Movido `/estadisticas` y `/send-payment-email` ANTES de `/:id`
  - Middleware `authenticate` ya aplicado a todas las rutas

- [ ] **Verificar aislamiento multi-tenant** (30 min)
  - Test manual: Crear 2 tenants, intentar acceder datos de uno con token del otro
  - Confirmar que todos los endpoints filtran por `tenantId`

### 1.2 Funcionalidades Básicas Faltantes

**Prioridad:** 🔴 CRÍTICA

- [x] **Implementar logout** (30 min) ✅
  - Frontend: Botón "Cerrar Sesión" agregado en `Header.tsx`
  - Llama a `auth.logout()` con estado de loading
  - Limpia localStorage y cookie
  - Redirige automáticamente a `/login`
  - Archivos: `FrontendCCE/components/ui/Header.tsx`

---

## 🟠 FASE 2: MODELO DE DATOS - ACTIVIDADES DINÁMICAS Y SOCIOS (3-4 días) ✅ COMPLETADA

### 2.1 Sistema de Actividades Dinámicas

**Prioridad:** 🔴 CRÍTICA - Esta es la base del sistema de cuotas

#### **DECISIÓN DE ARQUITECTURA:**
Las actividades ya NO serán un ENUM fijo, sino **tablas dinámicas** que cada club puede gestionar.
Esto permite que cada club cree sus propias actividades con precios personalizados.

- [x] **Crear tabla `actividades`** (1 hora) ✅
  - Migración: `BackendCCE/migrations/20260109000001-create-actividades-table.js`
  - Campos:
    - `id` SERIAL PRIMARY KEY
    - `tenant_id` INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
    - `nombre` VARCHAR(100) NOT NULL (ej: "Basquet", "Yoga", "Natación")
    - `monto` DECIMAL(10,2) NOT NULL (precio mensual)
    - `activa` BOOLEAN DEFAULT true (si está disponible para seleccionar)
    - `orden` INTEGER DEFAULT 0 (para ordenar en UI)
    - `descripcion` TEXT nullable
    - `created_at`, `updated_at` TIMESTAMP
  - Índices:
    - UNIQUE (tenant_id, nombre) - No duplicar nombres por tenant
    - INDEX (tenant_id, activa) - Para filtrar activas
  - **IMPORTANTE:** Al cambiar el monto de una actividad, solo afecta a cuotas futuras

- [x] **Crear tabla pivot `socio_actividades`** (30 min)
  - Migración: `BackendCCE/migrations/20260109000002-create-socio-actividades-table.js`
  - Relación muchos-a-muchos entre socios y actividades
  - Campos:
    - `id` SERIAL PRIMARY KEY
    - `socio_id` INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE
    - `actividad_id` INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE
    - `fecha_inicio` DATE DEFAULT NOW()
    - `created_at` TIMESTAMP
  - Índices:
    - UNIQUE (socio_id, actividad_id) - Un socio no puede tener la misma actividad duplicada
    - INDEX (socio_id) - Para buscar actividades de un socio
    - INDEX (actividad_id) - Para buscar socios de una actividad

- [x] **Deprecar columna ENUM `actividad` de tabla socios** (1 hora)
  - Migración: `BackendCCE/migrations/20260109000003-deprecate-actividad-enum.js`
  - Renombrar columna: `actividad` → `actividad_legacy` (mantener datos históricos)
  - Migrar datos existentes a la nueva tabla pivot (si hay datos)
  - Agregar comentario: "DEPRECATED - Use socio_actividades table"
  - **NO eliminar** la columna aún (para rollback)

- [x] **Modelo Actividad** (1 hora)
  - Archivo: `BackendCCE/src/models/Actividad.js`
  - Campos: id, tenantId, nombre, monto, activa, orden, descripcion
  - Relaciones:
    - `belongsTo(Tenant)`
    - `belongsToMany(Socio, through: 'socio_actividades')`
  - Métodos:
    - `isActiva()` - Verifica si está activa
    - `getSociosCount()` - Cuenta socios con esta actividad
  - Validaciones:
    - nombre: required, min 2, max 100
    - monto: required, > 0
    - tenantId: required

- [x] **Actualizar Modelo Socio** (30 min)
  - Archivo: `BackendCCE/src/models/Socio.js`
  - Agregar relación: `belongsToMany(Actividad, through: 'socio_actividades')`
  - Agregar método: `getActividades()` - Retorna array de actividades del socio
  - Agregar método: `getMontoTotal(configuracion)` - Calcula monto según actividades

### 2.2 Campos Adicionales para Socios

**Prioridad:** 🟠 ALTA

- [x] **Agregar campos para menores de edad** (1 hora)
  - Migración: `BackendCCE/migrations/20260109000004-add-tutor-fields-to-socios.js`
  - Campos:
    - `tutor_nombre` VARCHAR(200) nullable
    - `tutor_telefono` VARCHAR(20) nullable
  - Modelo: Actualizar `BackendCCE/src/models/Socio.js`
  - Validación: Obligatorios si `getEdad() < 18`
  - Frontend: Mostrar campos condicionalmente

- [x] **Agregar campos para exención de cuota y mes de gracia** (1 hora)
  - Migración: `BackendCCE/migrations/20260109000005-add-exencion-fields-to-socios.js`
  - Campos:
    - `exento_cuota` BOOLEAN DEFAULT false (jugador exento permanente)
    - `mes_gracia_hasta` DATE nullable (mes de gracia temporal)
  - Lógica: Si `exento_cuota=true` → NO se generan cuotas NUNCA
  - Lógica: Si `mes_gracia_hasta` vigente → NO se generan cuotas hasta esa fecha
  - UI: Checkboxes en formulario de socio con tooltip explicativo

### 2.3 Endpoints CRUD de Actividades

**Prioridad:** 🟠 ALTA

- [x] **Controller de Actividades** (2 horas)
  - Archivo: `BackendCCE/src/controllers/actividadesController.js`
  - Funciones:
    - `obtenerActividades()` - GET /api/actividades (filtrar por tenant, solo activas por defecto)
    - `obtenerActividadPorId()` - GET /api/actividades/:id
    - `crearActividad()` - POST /api/actividades (validar nombre único por tenant)
    - `actualizarActividad()` - PUT /api/actividades/:id (cambio de monto NO afecta cuotas pasadas)
    - `eliminarActividad()` - DELETE /api/actividades/:id (soft delete: marcar activa=false)
  - Validaciones:
    - Verificar que actividad pertenece al tenant del usuario
    - No permitir eliminar si hay socios activos con esa actividad (warning)
    - Monto debe ser > 0

- [x] **Rutas de Actividades** (30 min)
  - Archivo: `BackendCCE/src/routes/actividades.js`
  - Middleware: `resolveTenant` + `authenticate` en todas las rutas
  - Rutas:
    ```
    GET    /api/actividades           - Listar
    GET    /api/actividades/:id       - Obtener una
    POST   /api/actividades           - Crear
    PUT    /api/actividades/:id       - Actualizar
    DELETE /api/actividades/:id       - Desactivar (soft delete)
    ```

- [x] **Validación con JOI** (30 min)
  - Archivo: `BackendCCE/src/middleware/validation.js`
  - Agregar schemas:
    - `schemas.actividad` - Para crear/actualizar
    - `schemas.query.actividades` - Para filtros

### 2.4 Sistema de Configuración de Cuotas

**Prioridad:** 🟠 ALTA

- [x] **Crear tabla `tenant_configuracion`** (2 horas)
  - Migración: `BackendCCE/migrations/20260109000006-create-tenant-configuracion.js`
  - Campos:
    - `id` SERIAL PRIMARY KEY
    - `tenant_id` INTEGER NOT NULL UNIQUE REFERENCES tenants(id)
    - `tipo_cuota` VARCHAR(20) DEFAULT 'por_actividad' ('unica' o 'por_actividad')
    - `monto_base` DECIMAL(10,2) DEFAULT 0 (solo si tipo_cuota='unica')
    - `multiple_actividades_strategy` VARCHAR(20) DEFAULT 'sumar' ('sumar', 'maximo', 'descuento')
    - `descuento_actividades` DECIMAL(5,2) DEFAULT 0 (% si strategy='descuento')
    - `dia_vencimiento` INTEGER DEFAULT 10 (día del mes, 1-28)
    - `recordatorio_dias_antes` INTEGER DEFAULT 2
    - `descuento_menores` DECIMAL(5,2) DEFAULT 0 (% para < 18 años)
    - `generar_automaticamente` BOOLEAN DEFAULT true
    - `enviar_recordatorios` BOOLEAN DEFAULT true
    - `created_at`, `updated_at` TIMESTAMP
  - **NOTA:** Los montos YA NO están aquí, están en la tabla `actividades`

- [x] **Modelo TenantConfiguracion** (1 hora)
  - Archivo: `BackendCCE/src/models/TenantConfiguracion.js`
  - Relación: `belongsTo(Tenant)`
  - Validaciones:
    - tipo_cuota: 'unica' o 'por_actividad'
    - dia_vencimiento: entre 1 y 28
    - descuentos: entre 0 y 100
  - Métodos:
    - `calcularMontoCuota(socio)` - Calcula monto según configuración y actividades del socio

- [x] **Valores por defecto al crear tenant** (30 min)
  - Hook: En `authController.register`, crear configuración automáticamente
  - Defaults:
    - tipo_cuota: 'por_actividad'
    - dia_vencimiento: 10
    - recordatorio_dias_antes: 2
    - multiple_actividades_strategy: 'sumar'
    - generar_automaticamente: true

### 2.5 Servicio de Generación Automática de Cuotas

**Prioridad:** 🟠 ALTA

- [x] **Servicio de cálculo y generación** (4 horas)
  - Archivo: `BackendCCE/src/services/cuotaService.js`

  - **Función: `calcularMontoCuota(socio, configuracion)`**
    - 1. Verificar si `socio.exentoCuota === true` → retornar 0
    - 2. Verificar si `socio.mesGraciaHasta` vigente → retornar 0
    - 3. Obtener actividades del socio (include Actividad)
    - 4. Si `configuracion.tipoCuota === 'unica'`:
      - Retornar `configuracion.montoBase`
    - 5. Si `configuracion.tipoCuota === 'por_actividad'`:
      - Si NO tiene actividades → retornar 0
      - Si tiene 1 actividad → retornar `actividad.monto`
      - Si tiene múltiples:
        - `strategy='sumar'`: sumar todos los montos
        - `strategy='maximo'`: retornar el monto más alto
        - `strategy='descuento'`: monto principal + adicionales con descuento%
    - 6. Si `socio.getEdad() < 18` y `configuracion.descuentoMenores > 0`:
      - Aplicar descuento: `monto * (1 - descuento/100)`
    - 7. Retornar monto redondeado

  - **Función: `generarCuotaMensual(socio, periodo, configuracion)`**
    - 1. Verificar si socio está activo
    - 2. Calcular monto con `calcularMontoCuota()`
    - 3. Si monto === 0, no crear cuota
    - 4. Calcular fecha_vencimiento: `dia_vencimiento` del mes de periodo
    - 5. Crear cuota:
      ```javascript
      {
        tenantId, socioId, periodo, monto,
        fechaVencimiento, estado: 'Pendiente'
      }
      ```
    - 6. Retornar cuota creada

  - **Función: `generarCuotasMasivas(tenantId, periodo)`**
    - Para generación mensual automática por tenant

- [x] **Cron job de generación mensual** (2 horas)
  - Actualizar: `BackendCCE/src/services/cronService.js`
  - Schedule: 1ro de cada mes a las 00:00
  - Lógica:
    1. Obtener todos los tenants con `configuracion.generarAutomaticamente === true`
    2. Por cada tenant:
       - Obtener configuración
       - Obtener socios activos
       - Por cada socio: `generarCuotaMensual()`
       - Log: cuántas cuotas generadas
    3. Enviar email al admin con resumen (opcional)
  - Usar transacciones para rollback si falla

- [x] **Generar cuota al registrar socio** (1 hora)
  - En `sociosController.create()`
  - Después de crear socio Y asignar actividades:
    - Obtener configuración del tenant
    - Calcular periodo: mes siguiente
    - Llamar `generarCuotaMensual(socio, periodo, configuracion)`
  - Solo generar si NO tiene mes_gracia_hasta activo

---

## 🟡 FASE 3: FORMULARIOS Y UI - GESTIÓN DE SOCIOS (2 días) ✅ COMPLETADA

### 3.1 Formulario de Registro de Socios

**Prioridad:** 🟠 ALTA

- [x] **Completar campos obligatorios** (2 horas) ✅
  - Frontend: `FrontendCCE/components/registration/RegistrationForm.tsx`
  - Campos implementados:
    - ✅ DNI: Input con validación regex (solo números, 7-20 dígitos)
    - ✅ Nombre y Apellido: Separados como el backend espera
    - ✅ Fecha Nacimiento: Date picker con cálculo automático de edad
    - ✅ Teléfono: Input con validación
    - ✅ Email: Input con validación
    - ✅ Actividades: Checkboxes múltiples cargados desde backend
    - ✅ **Condicional si edad < 18:**
      - ✅ Nombre completo del tutor (aparece automáticamente)
      - ✅ Teléfono del tutor (aparece automáticamente)
    - ✅ Exento de cuota: Checkbox
    - ✅ Mes de gracia hasta: Date picker (opcional)
    - ✅ Es jugador: Checkbox
  - Validaciones implementadas:
    - ✅ DNI regex: solo números
    - ✅ Email formato válido
    - ✅ Teléfono mínimo 8 dígitos
    - ✅ Si menor, tutor obligatorio (validación en `.superRefine()`)
    - ✅ Cálculo automático de edad en tiempo real

- [x] **Conectar formulario con backend** (1 hora) ✅
  - ✅ Schema de validación: `FrontendCCE/lib/validations.ts`
  - ✅ API types actualizados: `FrontendCCE/lib/api.ts`
  - ✅ Hook `useLoadActividades()`: Carga actividades desde backend
  - ✅ Hook `useCreateMember()`: Envía datos al backend
  - ✅ Transformación de datos frontend ↔ backend
  - ✅ Manejo de errores con mensajes claros
  - ✅ Pantalla de éxito con opción de nuevo registro

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
