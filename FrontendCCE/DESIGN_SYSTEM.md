# 🎨 Sistema de Diseño Unificado - Club Comandante Espora

**Fecha de creación**: 2026-01-11
**Versión**: 1.0
**Estado**: Documento oficial de diseño

---

## 📋 Tabla de Contenidos

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Paleta de Colores](#paleta-de-colores)
3. [Cards y Contenedores](#cards-y-contenedores)
4. [Iconos](#iconos)
5. [Botones](#botones)
6. [Tipografía](#tipografía)
7. [Espaciado](#espaciado)
8. [Efectos Visuales](#efectos-visuales)
9. [Componentes Específicos](#componentes-específicos)
10. [Login y Autenticación](#login-y-autenticación)

---

## 🎯 Filosofía de Diseño

El diseño de Club Comandante Espora se basa en **Glassmorphism moderno** con toques de neumorfismo para crear una experiencia visual premium, profesional y cohesiva.

### Principios Clave:
- ✨ **Glassmorphism como estándar**: Efecto cristal con `backdrop-blur-xl`
- 🎨 **Colores de marca consistentes**: Azul primario `#002C6F` y Naranja `#FFA500`
- 🔄 **Animaciones suaves**: Transiciones de 300ms, hover effects sutiles
- 📱 **Mobile-first responsive**: Diseño adaptable desde 320px
- ♿ **Accesibilidad**: Contraste WCAG AA mínimo, focus states visibles

---

## 🎨 Paleta de Colores

### **Colores de Marca (Primarios)**

```css
/* Azul Club (Primary) */
--brand-blue-dark: #002C6F;    /* Login backgrounds, headers */
--brand-blue: #3B82F6;         /* Links, primary actions (blue-600) */
--brand-blue-light: #60A5FA;   /* Hover states (blue-400) */

/* Naranja Acento (Accent) */
--brand-orange: #FFA500;       /* CTAs, highlights (orange-500) */
--brand-orange-dark: #FF8C00;  /* Hover states */
--brand-orange-light: #FFC107; /* Subtle accents */
```

### **Colores de Estado (Semánticos)**

```css
/* Success (Verde) */
--success: #10B981;            /* Paid, active (green-500) */
--success-light: #D1FAE5;      /* Backgrounds (green-100) */
--success-dark: #065F46;       /* Dark mode (green-900) */

/* Warning (Amarillo) */
--warning: #F59E0B;            /* Pending, alerts (yellow-500) */
--warning-light: #FEF3C7;      /* Backgrounds (yellow-100) */
--warning-dark: #78350F;       /* Dark mode (yellow-900) */

/* Danger (Rojo) */
--danger: #EF4444;             /* Overdue, errors (red-500) */
--danger-light: #FEE2E2;       /* Backgrounds (red-100) */
--danger-dark: #7F1D1D;        /* Dark mode (red-900) */

/* Info (Azul) */
--info: #3B82F6;               /* Informational (blue-500) */
--info-light: #DBEAFE;         /* Backgrounds (blue-50) */
--info-dark: #1E3A8A;          /* Dark mode (blue-900) */
```

### **Colores Neutrales (Grises)**

```css
/* Light Mode */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Dark Mode (usar dark:bg-gray-XXX) */
```

### **Fondos y Overlays**

```css
/* Glass overlays */
--glass-white-90: rgba(255, 255, 255, 0.9);
--glass-white-50: rgba(255, 255, 255, 0.5);
--glass-white-30: rgba(255, 255, 255, 0.3);
--glass-white-20: rgba(255, 255, 255, 0.2);
--glass-white-10: rgba(255, 255, 255, 0.1);

/* Page backgrounds */
--bg-light: linear-gradient(to bottom, #f8fafc, #eff6ff);
--bg-dark: linear-gradient(to bottom, #111827, #1f2937);
```

---

## 🃏 Cards y Contenedores

### **Card Principal (Glass Card) - ESTÁNDAR PRINCIPAL**

**Uso**: Dashboard, gráficos, métricas, tablas principales

```css
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
  border-radius: 1rem; /* 16px - rounded-2xl */
  transition: all 300ms ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px);
}

/* Dark mode */
.dark .glass-card {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(75, 85, 99, 0.3);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(75, 85, 99, 0.3);
}

.dark .glass-card:hover {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(107, 114, 128, 0.4);
}
```

**Clases Tailwind**:
```html
<div class="glass-card glass-card-hover p-6">
  <!-- Contenido -->
</div>
```

### **Card de Formulario (Form Card) - VARIANTE FORMULARIOS**

**Uso**: Formularios de configuración, creación de actividades, edición

```css
.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem; /* 12px - rounded-xl */
}

/* Dark mode */
.dark .form-card {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.4);
}
```

**Clases Tailwind**:
```html
<div class="form-card p-6">
  <!-- Formulario -->
</div>
```

### **Metric Card - VARIANTE MÉTRICAS**

**Uso**: Tarjetas de estadísticas con íconos en dashboard

```html
<div class="glass-card glass-card-hover p-4 text-center">
  <!-- Icon container con gradiente -->
  <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-{color}-500 to-{color}-600
              flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
    <Icon className="text-white" size={16} />
  </div>

  <!-- Value -->
  <p class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
    {value}
  </p>

  <!-- Title -->
  <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
    {title}
  </p>

  <!-- Optional change badge -->
  <div class="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300">
    <ArrowUp size={12} /> +12%
  </div>
</div>
```

### **Chart Container - VARIANTE GRÁFICOS**

**Uso**: Contenedores para gráficos Recharts

```html
<div class="glass-card glass-card-hover p-6 rounded-2xl">
  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
    Título del Gráfico
  </h3>
  <div class="h-[300px]">
    <ResponsiveContainer>
      <!-- Gráfico -->
    </ResponsiveContainer>
  </div>
</div>
```

### **Table Container - VARIANTE TABLAS**

```html
<div class="glass-card overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-white/30 dark:border-gray-600/30">
        <!-- Headers -->
      </thead>
      <tbody class="divide-y divide-white/20 dark:divide-gray-600/20">
        <!-- Rows -->
      </tbody>
    </table>
  </div>
</div>
```

### **❌ NO USAR (Deprecated)**

```css
/* NO usar estos estilos antiguos */
.neumorphism-card { /* Deprecated */ }
.bg-white.shadow-md { /* Usar glass-card en su lugar */ }
.border-gray-200 { /* Usar border-white/30 */ }
```

---

## 🎯 Iconos

### **Librería Estándar: lucide-react**

**Instalación**:
```bash
npm install lucide-react
```

**Importación**:
```tsx
import { Users, CreditCard, TrendingUp, Activity, Settings } from 'lucide-react';
```

### **Tamaños Estandarizados**

```tsx
// Extra Small (Badges, indicadores)
<Icon size={12} />

// Small (Botones pequeños, inline text)
<Icon size={14} />

// Default (Mayoría de botones, lists)
<Icon size={16} />

// Medium (Headers, metric cards)
<Icon size={20} />

// Large (Hero icons, grandes botones)
<Icon size={24} />

// Extra Large (Empty states, decorativos)
<Icon size={48} />
```

### **Colores de Íconos**

```tsx
// En metric cards (con gradiente de fondo)
<Icon className="text-white" size={16} />

// En texto normal
<Icon className="text-gray-600 dark:text-gray-400" size={16} />

// Con color semántico
<Icon className="text-green-600 dark:text-green-400" size={16} />
<Icon className="text-yellow-600 dark:text-yellow-400" size={16} />
<Icon className="text-red-600 dark:text-red-400" size={16} />
<Icon className="text-orange-500" size={16} />
```

### **Iconos por Categoría**

```tsx
// Dashboard y Métricas
import { LayoutDashboard, Users, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

// Acciones
import { Plus, Edit, Trash2, Save, X, Check, Search } from 'lucide-react';

// Navegación
import { Menu, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';

// Formularios
import { Mail, Phone, Calendar, DollarSign, User } from 'lucide-react';

// Estados
import { CheckCircle, AlertCircle, XCircle, Info, Loader2 } from 'lucide-react';

// Actividades
import { Activity, Dumbbell, Trophy, Heart } from 'lucide-react';

// Configuración
import { Building, Bell, Lock, Shield } from 'lucide-react';

// UI
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';
```

### **❌ NO USAR**

```tsx
// NO usar emojis en lugar de iconos
❌ 🏢 👥 ⚠️ 📊 // Reemplazar con lucide-react icons
✅ <Building /> <Users /> <AlertCircle /> <BarChart />
```

---

## 🔘 Botones

### **Botón Primario (Primary)**

**Uso**: Acción principal de la página

```html
<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold
               px-4 py-2 rounded-lg shadow-md hover:shadow-lg
               transform hover:-translate-y-0.5
               transition-all duration-300
               flex items-center gap-2">
  <Icon size={16} />
  Acción Principal
</button>
```

### **Botón Acento (Accent) - NARANJA**

**Uso**: CTAs principales, acciones destacadas (Nueva Inscripción, etc.)

```html
<button class="accent-button flex items-center gap-2">
  <Icon size={16} />
  Nueva Inscripción
</button>

<!-- Clases de accent-button (en globals.css) -->
.accent-button {
  @apply bg-gradient-to-r from-orange-500 to-orange-600
         hover:from-orange-600 hover:to-orange-700
         text-white font-semibold
         px-4 py-2 rounded-lg
         shadow-lg hover:shadow-xl
         transform hover:-translate-y-1
         transition-all duration-300;
}
```

### **Botón Success (Verde)**

**Uso**: Guardar, confirmar, aprobar

```html
<button class="bg-green-500 hover:bg-green-600 text-white font-semibold
               px-4 py-2 rounded-lg shadow-md hover:shadow-lg
               transition-all duration-300
               flex items-center gap-2">
  <Save size={16} />
  Guardar
</button>
```

### **Botón Danger (Rojo)**

**Uso**: Eliminar, cancelar acciones críticas

```html
<button class="bg-red-500 hover:bg-red-600 text-white font-semibold
               px-4 py-2 rounded-lg shadow-md hover:shadow-lg
               transition-all duration-300
               flex items-center gap-2">
  <Trash2 size={16} />
  Eliminar
</button>
```

### **Botón Secundario (Ghost)**

**Uso**: Acciones secundarias, cancelar

```html
<button class="bg-white/10 hover:bg-white/20
               border border-white/30 hover:border-white/40
               text-gray-700 dark:text-gray-200
               font-medium px-4 py-2 rounded-lg
               backdrop-blur-sm
               transition-all duration-300
               flex items-center gap-2">
  <X size={16} />
  Cancelar
</button>
```

### **Botón Icon Only**

**Uso**: Editar, eliminar en tablas, toggles

```html
<!-- Edit -->
<button class="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
               text-blue-600 dark:text-blue-400
               transition-colors duration-200">
  <Edit size={16} />
</button>

<!-- Delete -->
<button class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
               text-red-600 dark:text-red-400
               transition-colors duration-200">
  <Trash2 size={16} />
</button>
```

### **Tamaños de Botones**

```html
<!-- Small -->
<button class="px-3 py-1.5 text-sm">
  Pequeño
</button>

<!-- Default -->
<button class="px-4 py-2 text-base">
  Normal
</button>

<!-- Large -->
<button class="px-6 py-3 text-lg">
  Grande
</button>
```

### **❌ NO USAR**

```css
/* Evitar colores indigo/purple (fuera de marca) */
❌ bg-indigo-600, bg-purple-600

/* Evitar botones sin hover effects */
❌ <button class="bg-blue-500">

/* Evitar botones de submit verdes en contextos no-guardar */
❌ <button type="submit" class="bg-green-500">Enviar</button>
✅ <button type="submit" class="bg-orange-500">Enviar</button>
```

---

## ✏️ Tipografía

### **Encabezados (Headers)**

```html
<!-- Page Title (h1) -->
<h1 class="text-2xl font-bold text-orange-500 mb-6">
  Título de Página
</h1>

<!-- Section Title (h2) -->
<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
  Título de Sección
</h2>

<!-- Subsection Title (h3) -->
<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
  Subtítulo
</h3>

<!-- Card Title (h4) -->
<h4 class="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
  Título de Card
</h4>
```

### **Párrafos y Texto**

```html
<!-- Body text -->
<p class="text-sm text-gray-700 dark:text-gray-300">
  Texto normal del cuerpo.
</p>

<!-- Small text (descripciones, labels) -->
<p class="text-xs text-gray-600 dark:text-gray-400">
  Texto pequeño o secundario.
</p>

<!-- Muted text -->
<p class="text-sm text-gray-500 dark:text-gray-500">
  Texto atenuado o deshabilitado.
</p>
```

### **Labels de Formulario**

```html
<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
  Nombre del Campo
</label>
```

### **Valores Numéricos (Métricas)**

```html
<!-- Large metric value -->
<p class="text-2xl font-bold text-gray-800 dark:text-gray-200">
  1,234
</p>

<!-- Small metric value -->
<p class="text-xl font-semibold text-gray-700 dark:text-gray-300">
  $45.00
</p>
```

### **Badges y Tags**

```html
<!-- Success badge -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
             bg-green-100/80 dark:bg-green-900/30
             text-green-700 dark:text-green-300
             border border-green-200/50 dark:border-green-700/50">
  Pagado
</span>

<!-- Warning badge -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
             bg-yellow-100/80 dark:bg-yellow-900/30
             text-yellow-700 dark:text-yellow-300
             border border-yellow-200/50 dark:border-yellow-700/50">
  Pendiente
</span>

<!-- Danger badge -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
             bg-red-100/80 dark:bg-red-900/30
             text-red-700 dark:text-red-300
             border border-red-200/50 dark:border-red-700/50">
  Vencido
</span>
```

---

## 📐 Espaciado

### **Padding de Cards**

```css
/* Compact cards (dashboard metrics) */
.card-compact { padding: 1rem; /* p-4 */ }

/* Default cards (forms, general) */
.card-default { padding: 1.5rem; /* p-6 */ }

/* Spacious cards (login, configuration) */
.card-spacious { padding: 2rem; /* p-8 */ }
```

### **Gaps en Grids**

```html
<!-- Dashboard metrics grid (compacto) -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <!-- MetricCards -->
</div>

<!-- General content grid (normal) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>

<!-- Spacious layout (configuración) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Form sections -->
</div>
```

### **Margins**

```css
/* Between sections */
mb-6 (24px)

/* Between elements */
mb-4 (16px)

/* Between small elements */
mb-2 (8px), mb-3 (12px)

/* Page top margin (debajo del header) */
pt-20 (80px)
```

### **Responsive Breakpoints**

```css
/* Mobile first */
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## ✨ Efectos Visuales

### **Glassmorphism - ESTÁNDAR**

```css
/* Properties */
backdrop-filter: blur(24px);  /* backdrop-blur-xl */
background: rgba(255, 255, 255, 0.9);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow:
  0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 10px 10px -5px rgba(0, 0, 0, 0.04),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
```

**Cuándo usar**:
- Dashboard cards
- Metric cards
- Chart containers
- Table containers
- Sidebar y Header
- Cualquier card principal

### **Animaciones con Framer Motion**

```tsx
// Card entrance animation
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
  whileHover={{ y: -8, scale: 1.03 }}
>
  {/* Card content */}
</motion.div>

// Staggered children
<div>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</div>

// Carousel/Slider
<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.4 }}
  >
    {/* Slide content */}
  </motion.div>
</AnimatePresence>
```

### **Hover Effects**

```css
/* Card hover (translateY) */
transform: translateY(-8px);
transition: all 300ms ease;

/* Button hover (translateY + shadow) */
transform: translateY(-4px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Icon hover (scale) */
transform: scale(1.1);
transition: transform 200ms ease;
```

### **Shadows**

```css
/* Small shadow (default cards) */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Medium shadow (glass cards) */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Large shadow (main cards, hover states) */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Extra large shadow (glass-card default) */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 🧩 Componentes Específicos

### **Sidebar**

```tsx
// Ubicación: /components/ui/Sidebar.tsx

Estilos:
├─ Container: glass-card fixed left-0 h-screen w-64
├─ Logo section: bg-gradient-to-r from-blue-600 to-orange-500
├─ Nav items:
│  ├─ Active: bg-orange-500 text-white
│  └─ Inactive: text-gray-700 dark:text-gray-300 hover:bg-white/50
└─ Dark mode toggle: bg-white/10 hover:bg-white/20
```

### **Header**

```tsx
// Ubicación: /components/ui/Header.tsx

Estilos:
├─ Container: glass-card fixed top-0 w-full z-10
├─ Content: flex justify-between items-center p-4
├─ Search: bg-white/10 backdrop-blur-sm border border-white/30
└─ User menu: glass-card dropdown
```

### **Tabs (Configuración style)**

```html
<div class="flex gap-2 mb-6 overflow-x-auto">
  <!-- Active tab -->
  <button class="flex items-center gap-3 px-4 py-3 rounded-lg
                 bg-orange-500 text-white shadow-md
                 transition-all duration-300 whitespace-nowrap">
    <Icon size={18} />
    <div class="text-left">
      <div class="font-semibold text-sm">Tab Activo</div>
      <div class="text-xs text-white/80">Descripción</div>
    </div>
  </button>

  <!-- Inactive tab -->
  <button class="flex items-center gap-3 px-4 py-3 rounded-lg
                 bg-white dark:bg-gray-800
                 text-gray-600 dark:text-gray-400
                 hover:bg-gray-50 dark:hover:bg-gray-700
                 transition-all duration-300 whitespace-nowrap">
    <Icon size={18} />
    <div class="text-left">
      <div class="font-semibold text-sm">Tab Inactivo</div>
      <div class="text-xs">Descripción</div>
    </div>
  </button>
</div>
```

### **Form Inputs**

```html
<!-- Text input -->
<input
  type="text"
  class="w-full px-3 py-2
         border border-gray-200 dark:border-gray-600
         rounded-lg
         bg-white dark:bg-gray-800
         text-gray-900 dark:text-gray-100
         focus:ring-2 focus:ring-blue-500 focus:border-transparent
         transition-all duration-200"
  placeholder="Placeholder"
/>

<!-- Input con icono (DollarSign example) -->
<div class="relative">
  <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
  <input
    type="number"
    class="w-full pl-10 pr-3 py-2
           border border-gray-200 dark:border-gray-600
           rounded-lg
           focus:ring-2 focus:ring-blue-500"
  />
</div>

<!-- Select -->
<select
  class="w-full px-3 py-2
         border border-gray-200 dark:border-gray-600
         rounded-lg
         bg-white dark:bg-gray-800
         focus:ring-2 focus:ring-blue-500"
>
  <option>Opción 1</option>
</select>

<!-- Textarea -->
<textarea
  rows={4}
  class="w-full px-3 py-2
         border border-gray-200 dark:border-gray-600
         rounded-lg
         resize-none
         focus:ring-2 focus:ring-blue-500"
/>
```

### **Info Cards (Alerts)**

```html
<!-- Info -->
<div class="bg-blue-50 dark:bg-blue-900/20
            border border-blue-200 dark:border-blue-700
            rounded-lg p-4
            flex items-start gap-3">
  <Info size={20} class="text-blue-600 dark:text-blue-400 flex-shrink-0" />
  <p class="text-sm text-blue-800 dark:text-blue-200">
    Mensaje informativo aquí.
  </p>
</div>

<!-- Warning -->
<div class="bg-yellow-50 dark:bg-yellow-900/20
            border border-yellow-200 dark:border-yellow-700
            rounded-lg p-4
            flex items-start gap-3">
  <AlertCircle size={20} class="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
  <p class="text-sm text-yellow-800 dark:text-yellow-200">
    Mensaje de advertencia aquí.
  </p>
</div>

<!-- Success -->
<div class="bg-green-50 dark:bg-green-900/20
            border border-green-200 dark:border-green-700
            rounded-lg p-4
            flex items-start gap-3">
  <CheckCircle size={20} class="text-green-600 dark:text-green-400 flex-shrink-0" />
  <p class="text-sm text-green-800 dark:text-green-200">
    Mensaje de éxito aquí.
  </p>
</div>

<!-- Error -->
<div class="bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-700
            rounded-lg p-4
            flex items-start gap-3">
  <XCircle size={20} class="text-red-600 dark:text-red-400 flex-shrink-0" />
  <p class="text-sm text-red-800 dark:text-red-200">
    Mensaje de error aquí.
  </p>
</div>
```

### **Status Indicators**

```html
<!-- Payment Status -->
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium">
  <!-- Paid -->
  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
  <span class="bg-green-100/80 dark:bg-green-900/30
               text-green-700 dark:text-green-300
               border border-green-200/50 px-2 py-0.5 rounded-full">
    Pagado
  </span>

  <!-- Pending -->
  <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
  <span class="bg-yellow-100/80 dark:bg-yellow-900/30
               text-yellow-700 dark:text-yellow-300
               border border-yellow-200/50 px-2 py-0.5 rounded-full">
    Pendiente
  </span>

  <!-- Overdue -->
  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
  <span class="bg-red-100/80 dark:bg-red-900/30
               text-red-700 dark:text-red-300
               border border-red-200/50 px-2 py-0.5 rounded-full">
    Vencido
  </span>
</span>
```

### **Tooltips (Recharts)**

```tsx
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white/95 dark:bg-gray-800/95
                    backdrop-blur-md
                    border border-white/30 dark:border-gray-600/30
                    rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {payload[0].payload.name}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400">
            {entry.name}: <strong className="text-gray-800 dark:text-gray-200">{entry.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔐 Login y Autenticación

### **Background y Layout**

```html
<div class="min-h-screen bg-gradient-to-br from-[#002C6F] to-[#001840]
            flex items-center justify-center p-4">
  <!-- Login card -->
</div>
```

### **Login Card**

```html
<motion.div
  initial={{ opacity: 0, y: 30, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
  className="w-full max-w-md"
>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8
              border border-white/20">
    <!-- Logo -->
    <div class="flex justify-center mb-8">
      <div class="w-24 h-24 rounded-full
                  bg-gradient-to-br from-blue-600 to-orange-500
                  flex items-center justify-center shadow-2xl">
        <Building class="text-white" size={48} />
      </div>
    </div>

    <!-- Title -->
    <h1 class="text-3xl font-bold text-white text-center mb-2">
      Club Comandante Espora
    </h1>
    <p class="text-white/70 text-center mb-8">
      Sistema de Gestión
    </p>

    <!-- Form -->
    <form>
      <!-- Email input -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-white/90 mb-2">
          Correo Electrónico
        </label>
        <input
          type="email"
          class="w-full px-4 py-3
                 bg-white/10 backdrop-blur-sm
                 border border-white/20
                 rounded-lg
                 text-white placeholder-white/50
                 focus:outline-none focus:ring-2 focus:ring-orange-500
                 transition-all duration-300"
          placeholder="tu@email.com"
        />
      </div>

      <!-- Password input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-white/90 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          class="w-full px-4 py-3
                 bg-white/10 backdrop-blur-sm
                 border border-white/20
                 rounded-lg
                 text-white placeholder-white/50
                 focus:outline-none focus:ring-2 focus:ring-orange-500
                 transition-all duration-300"
          placeholder="••••••••"
        />
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        class="w-full py-3
               bg-gradient-to-r from-orange-500 to-orange-600
               hover:from-orange-600 hover:to-orange-700
               text-white font-semibold rounded-lg
               shadow-lg hover:shadow-xl
               transform hover:scale-[1.02]
               transition-all duration-300
               flex items-center justify-center gap-2"
      >
        Iniciar Sesión
        <LogIn size={18} />
      </button>
    </form>

    <!-- Footer links -->
    <div class="mt-6 text-center">
      <a href="#" class="text-sm text-white/70 hover:text-white transition-colors">
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  </div>
</motion.div>
```

### **Error Messages (Auth)**

```html
<div class="mb-4 bg-red-500/20 backdrop-blur-sm
            border border-red-500/50 rounded-lg p-4
            flex items-start gap-3">
  <XCircle size={20} class="text-red-300 flex-shrink-0" />
  <p class="text-sm text-red-100">
    Credenciales inválidas. Por favor, intenta de nuevo.
  </p>
</div>
```

### **Loading State (Auth)**

```tsx
<button
  disabled
  class="w-full py-3 bg-orange-500/50 text-white font-semibold rounded-lg
         cursor-not-allowed flex items-center justify-center gap-2"
>
  <Loader2 size={18} class="animate-spin" />
  Iniciando sesión...
</button>
```

---

## 📝 Checklist de Implementación

### **Antes de crear un nuevo componente:**

- [ ] ¿Usaste `glass-card` para el contenedor principal?
- [ ] ¿Los iconos son de `lucide-react`?
- [ ] ¿Los botones usan los colores de marca (blue-600, orange-500)?
- [ ] ¿Los badges de estado usan los colores semánticos correctos?
- [ ] ¿Incluiste hover effects con `transition-all duration-300`?
- [ ] ¿El espaciado sigue el estándar (p-4, p-6, gap-3, gap-4)?
- [ ] ¿Los inputs tienen `focus:ring-2 focus:ring-blue-500`?
- [ ] ¿La tipografía usa las clases correctas (font-bold, font-semibold)?
- [ ] ¿Es responsive con breakpoints correctos (sm, md, lg)?
- [ ] ¿Funciona en dark mode con `dark:` variants?

### **Al refactorizar componentes existentes:**

- [ ] Reemplazaste `.neumorphism-card` con `.glass-card`?
- [ ] Reemplazaste borders `border-gray-200` con `border-white/30`?
- [ ] Reemplazaste backgrounds `bg-white` con `bg-white/90 backdrop-blur-xl`?
- [ ] Cambiaste botones indigo/purple a blue/orange?
- [ ] Reemplazaste emojis con iconos lucide?
- [ ] Añadiste animaciones con Framer Motion?
- [ ] Verificaste que el espaciado sea consistente?

---

## 🚀 Próximos Pasos

1. **Crear componente Card unificado** (`components/ui/Card.tsx`)
2. **Refactorizar páginas existentes** (Estadísticas, Admin)
3. **Crear biblioteca de componentes reutilizables**
4. **Actualizar Storybook** (si se implementa)
5. **Documentar componentes con JSDoc**

---

## 📚 Referencias

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons
- **Framer Motion**: https://www.framer.com/motion/
- **Recharts**: https://recharts.org/

---

**Última actualización**: 2026-01-11
**Mantenido por**: Equipo de Desarrollo CCE
