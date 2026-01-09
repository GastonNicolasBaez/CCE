# Convención de Nombres - camelCase vs snake_case

## 📋 Resumen de la Convención Establecida

Este proyecto usa una **convención mixta pero bien definida**:

### ✅ USAR camelCase:
- **Modelos Sequelize** (JavaScript) - nombres de campos
- **Controladores** - acceso a propiedades de modelos
- **Queries Sequelize** - condiciones WHERE
- **Código JavaScript en general**

### ✅ USAR snake_case:
- **Columnas PostgreSQL** (base de datos real)
- **Migraciones** - definiciones de columnas
- **Migraciones** - referencias en `addIndex()`, `addConstraint()`, queries SQL raw
- **Nombres de tablas** en PostgreSQL

---

## 🎯 ¿Por qué esta convención?

JavaScript usa camelCase por convención, pero PostgreSQL tradicionalmente usa snake_case.
Sequelize permite **mapear** entre ambos usando el atributo `field`.

---

## 📚 Ejemplos Correctos

### ✅ Modelos Sequelize (camelCase con field mapping)

```javascript
const Usuario = sequelize.define('Usuario', {
  // camelCase en JavaScript
  tenantId: {
    type: DataTypes.INTEGER,
    // snake_case en PostgreSQL
    field: 'tenant_id',
    // ...
  },

  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at'  // Mapea a snake_case
  }
});
```

### ✅ Migraciones - Crear columnas (snake_case)

```javascript
await queryInterface.createTable('usuarios', {
  tenant_id: {  // ❌ NO usar tenantId
    type: Sequelize.INTEGER,
    // ...
  },
  last_login_at: {  // ❌ NO usar lastLoginAt
    type: Sequelize.DATE,
    // ...
  }
});
```

### ✅ Migraciones - Crear índices (snake_case)

```javascript
// ❌ INCORRECTO (causa el error que tuvimos)
await queryInterface.addIndex('usuarios', ['tenantId', 'email']);

// ✅ CORRECTO - usar nombres de columnas reales en PostgreSQL
await queryInterface.addIndex('usuarios', ['tenant_id', 'email']);
```

### ✅ Queries SQL raw en migraciones (snake_case)

```javascript
await queryInterface.sequelize.query(`
  UPDATE cuotas
  SET tenant_id = (
    SELECT tenant_id        -- ✅ snake_case
    FROM socios
    WHERE socios.id = cuotas.socio_id  -- ✅ snake_case
  )
`, { transaction });
```

### ✅ Controladores - Queries Sequelize (camelCase)

```javascript
// ✅ CORRECTO - Sequelize convierte automáticamente gracias al field mapping
const socios = await Socio.findAll({
  where: { tenantId: req.tenantId }  // camelCase - Sequelize lo convierte
});

// ✅ También correcto
const usuario = await Usuario.findOne({
  where: {
    tenantId: tenantId,      // camelCase
    email: email.toLowerCase()
  }
});
```

---

## 🔧 Configuración del Proyecto

**database.config.js:**
```javascript
define: {
  timestamps: true,
  underscored: false,  // ✅ CORRECTO - No auto-convertir
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
}
```

`underscored: false` es **correcto** porque hacemos el mapeo **manual** con `field` en cada modelo.

Si fuera `underscored: true`, Sequelize convertiría TODO automáticamente a snake_case,
pero perdemos control fino y puede causar problemas con nombres específicos.

---

## 🚨 Errores Comunes a Evitar

### ❌ Error 1: Usar camelCase en migraciones

```javascript
// ❌ INCORRECTO
await queryInterface.addIndex('cuotas', ['tenantId', 'socioId']);

// ✅ CORRECTO
await queryInterface.addIndex('cuotas', ['tenant_id', 'socio_id']);
```

### ❌ Error 2: Usar snake_case en queries Sequelize

```javascript
// ❌ INCORRECTO
const socios = await Socio.findAll({
  where: { tenant_id: tenantId }  // ❌ Sequelize no reconoce tenant_id
});

// ✅ CORRECTO
const socios = await Socio.findAll({
  where: { tenantId: tenantId }  // ✅ Usa el nombre del modelo
});
```

### ❌ Error 3: Olvidar el field mapping en modelos

```javascript
// ❌ INCORRECTO - sin field mapping
tenantId: {
  type: DataTypes.INTEGER,
  // Falta: field: 'tenant_id'
}

// ✅ CORRECTO - con field mapping
tenantId: {
  type: DataTypes.INTEGER,
  field: 'tenant_id',  // ✅ Mapea a columna real
}
```

---

## 📋 Checklist para Nuevas Features

Cuando agregues nuevos campos o tablas:

### Para Modelos Sequelize:
- [ ] Nombre del campo en **camelCase**
- [ ] Agregar `field: 'nombre_snake_case'` si tiene más de una palabra
- [ ] Timestamp fields: `createdAt` → `field: 'created_at'`

### Para Migraciones:
- [ ] Nombres de columnas en **snake_case**
- [ ] Índices usan nombres de columnas en **snake_case**
- [ ] Constraints usan nombres de columnas en **snake_case**
- [ ] Queries SQL raw usan **snake_case**

### Para Controladores:
- [ ] Queries Sequelize usan **camelCase** (nombres del modelo)
- [ ] Acceso a propiedades usa **camelCase**: `socio.tenantId`

---

## 🛠️ Ejemplos Completos

### Agregar un nuevo campo multi-palabra

**1. Crear migración:**
```javascript
await queryInterface.addColumn('socios', 'fecha_ultima_cuota', {
  type: Sequelize.DATEONLY,
  allowNull: true
});
```

**2. Actualizar modelo:**
```javascript
fechaUltimaCuota: {
  type: DataTypes.DATEONLY,
  field: 'fecha_ultima_cuota',  // ✅ Mapeo explícito
  allowNull: true
}
```

**3. Usar en controlador:**
```javascript
const socio = await Socio.findByPk(id);
console.log(socio.fechaUltimaCuota);  // ✅ camelCase
```

---

## 🔍 Verificar Convención en el Código

### Buscar posibles errores:

```bash
# Buscar camelCase en migraciones (posibles errores)
grep -r "tenantId\|socioId\|fechaNacimiento" migrations/

# Buscar snake_case en queries Sequelize (posibles errores)
grep -r "tenant_id.*where\|socio_id.*where" src/controllers/
```

---

## 📌 Resumen Final

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| Modelo Sequelize (nombre campo) | camelCase | `tenantId`, `fechaNacimiento` |
| Modelo Sequelize (field mapping) | snake_case | `field: 'tenant_id'` |
| Migración (columna) | snake_case | `tenant_id`, `fecha_nacimiento` |
| Migración (índice) | snake_case | `['tenant_id', 'socio_id']` |
| Query Sequelize (WHERE) | camelCase | `where: { tenantId }` |
| Acceso a propiedad | camelCase | `usuario.lastLoginAt` |
| SQL raw | snake_case | `SELECT tenant_id FROM...` |

---

## ✅ Estado Actual del Proyecto

**Archivos que CUMPLEN la convención:**
- ✅ `src/models/*.js` - Modelos con field mapping correcto
- ✅ `src/controllers/*.js` - Queries usan camelCase
- ✅ `migrations/20250905000001-create-initial-schema.js` - snake_case
- ✅ `migrations/20260107000001-create-tenants.js` - snake_case
- ✅ `migrations/20260107000002-add-tenant-to-usuarios.js` - snake_case
- ✅ `migrations/20260107000003-add-tenant-to-socios.js` - snake_case
- ✅ `migrations/20260107000004-add-tenant-to-cuotas.js` - snake_case
- ✅ `migrations/20260107000005-add-performance-indexes.js` - CORREGIDO a snake_case

**No hay archivos que violen la convención** - todos están correctos después de la corrección.

---

## 🚀 Conclusión

La convención del proyecto es **correcta y consistente**. El error en la migración de performance indexes
fue un caso aislado que ya fue corregido.

**Regla de oro:**
- En **código JavaScript** (modelos, controladores): usa **camelCase**
- En **migraciones y SQL** (base de datos): usa **snake_case**
