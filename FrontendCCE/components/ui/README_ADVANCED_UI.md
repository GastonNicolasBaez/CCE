# 🎨 Componentes UI Avanzados y Creativos - CCE

Estos componentes van **mucho más allá** de lo típico que genera la IA. Son únicos, creativos y mejoran la experiencia de usuario de forma significativa.

---

## 📑 Índice

1. [Skeleton Loaders](#-skeleton-loaders-con-shimmer)
2. [Confetti](#-confetti-para-celebraciones)
3. [Empty States](#-empty-states-con-ilustraciones-svg)
4. [Command Palette](#-command-palette-cmdk)
5. [Animated Counter](#-animated-counter-count-up)
6. [Floating Button](#-floating-button-con-menú-radial)
7. [Progress Steps](#-progress-steps-para-wizards)
8. [Toast Notifications](#-toast-notifications)

---

## 🔄 Skeleton Loaders con Shimmer

**¿Por qué es mejor?** Los skeleton loaders con shimmer son mucho más elegantes que spinners genéricos y dan la sensación de que la app es más rápida.

### Uso Básico

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui'

// Cargando texto con shimmer
<Skeleton variant="text" lines={3} animation="shimmer" />

// Cargando card completa
<SkeletonCard />

// Cargando tabla
<SkeletonTable rows={5} cols={4} />

// Circular para avatares
<Skeleton variant="circular" width={48} height={48} animation="wave" />
```

### Integración en Dashboard

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="metric" padding="compact">
            <Skeleton variant="circular" width={40} height={40} className="mx-auto mb-3" />
            <Skeleton variant="text" height={32} className="mb-2" />
            <Skeleton variant="text" height={16} width="60%" className="mx-auto" />
          </Card>
        ))}
      </div>
    )
  }

  return <ActualDashboard />
}
```

---

## 🎉 Confetti para Celebraciones

**¿Por qué es mejor?** Hace que las acciones importantes sean memorables. Cuando un usuario completa una inscripción o hace su primer pago, ¡merece una celebración!

### Uso Básico

```tsx
import { useConfetti } from '@/components/ui'

function RegistrationForm() {
  const { fire, ConfettiComponent } = useConfetti()

  const handleSuccess = async () => {
    await saveRegistration()
    fire() // 🎉 ¡Celebra!
    // El confetti desaparece automáticamente después de 3 segundos
  }

  return (
    <>
      {ConfettiComponent}
      <form onSubmit={handleSuccess}>
        {/* form fields */}
      </form>
    </>
  )
}
```

### Casos de Uso Perfectos

```tsx
// ✅ Primera inscripción exitosa
// ✅ Pago procesado correctamente
// ✅ Meta de socios alcanzada
// ✅ Configuración completada
// ✅ Cualquier milestone importante

// Ejemplo: Activar confetti cuando se alcanza meta
useEffect(() => {
  if (totalSocios >= 100 && !hasShownConfetti) {
    fire()
    setHasShownConfetti(true)
  }
}, [totalSocios])
```

---

## 📭 Empty States con Ilustraciones SVG

**¿Por qué es mejor?** Las ilustraciones SVG animadas son mucho más amigables que solo mostrar un ícono gris. Guían mejor al usuario sobre qué hacer.

### Uso Básico

```tsx
import { EmptyState } from '@/components/ui'
import { Plus } from 'lucide-react'

// Con ilustración pre-build
<EmptyState
  illustration="inbox"
  title="No hay actividades registradas"
  description="Comienza creando tu primera actividad deportiva"
  actionLabel="Nueva Actividad"
  onAction={handleCreate}
/>

// Con ícono personalizado
<EmptyState
  icon={Users}
  title="No hay socios registrados"
  description="Los socios aparecerán aquí una vez que los registres"
  actionLabel="Registrar Socio"
  onAction={() => router.push('/members/new')}
  secondaryActionLabel="Importar CSV"
  onSecondaryAction={handleImport}
/>
```

### Ilustraciones Disponibles

```tsx
illustration="inbox"   // Para listas vacías
illustration="search"  // Para resultados de búsqueda vacíos
illustration="folder"  // Para carpetas/secciones vacías
illustration="data"    // Para gráficos sin datos
```

### Reemplazar en Actividades Page

```tsx
// ❌ Antes (solo ícono)
{actividades.length === 0 && (
  <div className="text-center py-12">
    <Activity size={48} className="mx-auto text-gray-300 mb-4" />
    <p>No hay actividades</p>
  </div>
)}

// ✅ Después (con ilustración animada)
{actividades.length === 0 && (
  <EmptyState
    illustration="inbox"
    title="No hay actividades registradas"
    description="Comienza creando tu primera actividad deportiva"
    actionLabel="Nueva Actividad"
    onAction={handleCreate}
  />
)}
```

---

## ⌘ Command Palette (Cmd+K)

**¿Por qué es mejor?** Los usuarios power van a ADORAR esto. Es 10x más rápido que navegar por menús. Herramientas como Linear, Vercel y VSCode lo usan.

### Setup Básico

```tsx
// app/layout.tsx o en un provider
import { useCommandPalette } from '@/components/ui'
import { UserPlus, DollarSign, Activity, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Layout({ children }) {
  const router = useRouter()

  const commands = [
    {
      id: 'new-member',
      label: 'Nuevo Socio',
      description: 'Registrar un nuevo socio',
      icon: UserPlus,
      shortcut: '⌘N',
      onSelect: () => router.push('/members/new')
    },
    {
      id: 'new-payment',
      label: 'Registrar Pago',
      description: 'Registrar un pago de cuota',
      icon: DollarSign,
      keywords: ['pago', 'cuota', 'cobro'],
      onSelect: () => router.push('/payments/new')
    },
    {
      id: 'activities',
      label: 'Ver Actividades',
      description: 'Gestionar actividades deportivas',
      icon: Activity,
      onSelect: () => router.push('/actividades')
    },
    {
      id: 'settings',
      label: 'Configuración',
      description: 'Ajustes del club',
      icon: Settings,
      shortcut: '⌘,',
      onSelect: () => router.push('/configuracion')
    }
  ]

  const { CommandPaletteComponent } = useCommandPalette(commands)

  return (
    <html>
      <body>
        {CommandPaletteComponent}
        {children}
      </body>
    </html>
  )
}
```

### Trigger Manual (Botón)

```tsx
// Si quieres un botón para abrir el command palette
const { isOpen, open, CommandPaletteComponent } = useCommandPalette(commands)

<button onClick={open} className="...">
  <Search size={16} />
  Buscar... <kbd>⌘K</kbd>
</button>
```

### Usuarios lo usarán así:

1. Usuario presiona `Cmd+K` (o `Ctrl+K` en Windows)
2. Escribe "nuevo" → Ve "Nuevo Socio"
3. Presiona Enter → Navega instantáneamente
4. O usa flechas ↑↓ para navegar

**¡Es adictivo una vez que lo pruebas!**

---

## 📊 Animated Counter (Count-Up)

**¿Por qué es mejor?** Los números estáticos son aburridos. Los que cuentan hacia arriba capturan la atención y se sienten más premium.

### Uso en Métricas

```tsx
import { AnimatedCounter, CountUpCard } from '@/components/ui'
import { Users } from 'lucide-react'

// Simple counter
<AnimatedCounter value={1234} duration={2} />

// Con formato de moneda
<AnimatedCounter
  value={45678.50}
  prefix="$"
  decimals={2}
  formatValue={(v) => v.toLocaleString('es-AR')}
/>

// Con porcentaje
<AnimatedCounter
  value={87.5}
  suffix="%"
  decimals={1}
/>

// Card completa con ícono y trend
<CountUpCard
  value={socios.total}
  label="Total Socios"
  icon={<Users size={20} className="text-white" />}
  color="blue"
  trend={{ value: 12, isPositive: true }}
  formatValue={(v) => v.toLocaleString()}
/>
```

### Reemplazar Métricas Existentes

```tsx
// ❌ Antes (número estático)
<p className="text-2xl font-bold">{socios.total}</p>

// ✅ Después (animado con count-up)
<AnimatedCounter
  value={socios.total}
  className="text-2xl font-bold"
  duration={2}
  delay={0.3}
/>
```

### El efecto se activa cuando entra al viewport, no al cargar la página!

---

## 🎯 Floating Button con Menú Radial

**¿Por qué es mejor?** Las acciones principales siempre accesibles sin ocupar espacio. El menú radial es mucho más único que un menú dropdown típico.

### Uso Básico

```tsx
import { FloatingButton } from '@/components/ui'
import { UserPlus, DollarSign, Activity, FileText } from 'lucide-react'

<FloatingButton
  position="bottom-right"
  actions={[
    {
      id: 'new-member',
      label: 'Nuevo Socio',
      icon: UserPlus,
      onClick: () => router.push('/members/new'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'new-payment',
      label: 'Registrar Pago',
      icon: DollarSign,
      onClick: () => router.push('/payments/new'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'new-activity',
      label: 'Nueva Actividad',
      icon: Activity,
      onClick: () => router.push('/actividades/new'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'export',
      label: 'Exportar Datos',
      icon: FileText,
      onClick: handleExport,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]}
/>
```

### Dónde Usarlo

```tsx
// ✅ Dashboard principal (acciones rápidas)
// ✅ Listado de socios (agregar nuevo)
// ✅ Pagos (registrar, exportar)
// ✅ Estadísticas (generar reportes)

// Agregar en layout.tsx para que esté en todas las páginas:
export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <FloatingButton actions={globalActions} />
    </>
  )
}
```

---

## 📈 Progress Steps para Wizards

**¿Por qué es mejor?** Los formularios multi-step necesitan indicadores visuales claros. Este componente con animaciones de pulso y progress bar es mucho más intuitivo.

### Uso en Registro Multi-Step

```tsx
import { ProgressSteps } from '@/components/ui'
import { User, Activity, CreditCard, Check } from 'lucide-react'

const steps = [
  {
    id: 'personal',
    label: 'Datos Personales',
    description: 'Información básica',
    icon: User
  },
  {
    id: 'activity',
    label: 'Actividad',
    description: 'Seleccionar deporte',
    icon: Activity
  },
  {
    id: 'payment',
    label: 'Pago',
    description: 'Método de pago',
    icon: CreditCard
  },
  {
    id: 'confirm',
    label: 'Confirmar',
    description: 'Revisar y enviar',
    icon: Check
  }
]

function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div>
      <ProgressSteps
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => setCurrentStep(index)}
        allowSkip={false} // No permite saltar pasos
        variant="horizontal"
      />

      {/* Renderizar el formulario del step actual */}
      {currentStep === 0 && <PersonalDataForm />}
      {currentStep === 1 && <ActivitySelectionForm />}
      {currentStep === 2 && <PaymentForm />}
      {currentStep === 3 && <ConfirmationScreen />}

      {/* Botones navegación */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="accent"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}
```

### Variant Vertical (para sidebars)

```tsx
<ProgressSteps
  steps={steps}
  currentStep={currentStep}
  variant="vertical"
  allowSkip={true} // Permite saltar a cualquier step
/>
```

---

## 🔔 Toast Notifications

**¿Por qué es mejor?** Mucho más elegante que `alert()` o `confirm()`. Con progress bar auto-dismiss y animaciones suaves.

### Uso Básico

```tsx
import { useToast, ToastContainer } from '@/components/ui'

function MyComponent() {
  const { toasts, addToast, removeToast } = useToast()

  const handleSave = async () => {
    try {
      await saveData()
      addToast({
        message: 'Guardado exitosamente',
        type: 'success',
        duration: 3000
      })
    } catch (error) {
      addToast({
        message: 'Error al guardar',
        type: 'error',
        duration: 5000
      })
    }
  }

  return (
    <>
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position="top-right"
      />

      <button onClick={handleSave}>Guardar</button>
    </>
  )
}
```

### En un Provider Global

```tsx
// app/providers/ToastProvider.tsx
'use client'

import { createContext, useContext } from 'react'
import { useToast, ToastContainer } from '@/components/ui'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const toast = useToast()

  return (
    <ToastContext.Provider value={toast}>
      <ToastContainer
        toasts={toast.toasts}
        onClose={toast.removeToast}
        position="top-right"
      />
      {children}
    </ToastContext.Provider>
  )
}

export const useToastContext = () => useContext(ToastContext)
```

Luego en cualquier componente:

```tsx
const { addToast } = useToastContext()

addToast({ message: 'Acción completada', type: 'success' })
```

---

## 🎯 Casos de Uso Reales

### Dashboard con Todo

```tsx
'use client'

import {
  Card,
  AnimatedCounter,
  SkeletonCard,
  EmptyState,
  useCommandPalette,
  FloatingButton,
  useConfetti
} from '@/components/ui'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const { fire, ConfettiComponent } = useConfetti()

  // Command Palette
  const { CommandPaletteComponent } = useCommandPalette(commands)

  // Loading state con Skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  // Empty state con ilustración
  if (!stats || stats.total === 0) {
    return (
      <EmptyState
        illustration="inbox"
        title="Bienvenido a CCE"
        description="Comienza registrando tu primer socio"
        actionLabel="Nuevo Socio"
        onAction={() => router.push('/members/new')}
      />
    )
  }

  // Celebrar milestone
  useEffect(() => {
    if (stats.total === 100) {
      fire() // 🎉
    }
  }, [stats.total])

  return (
    <>
      {ConfettiComponent}
      {CommandPaletteComponent}

      <div className="grid grid-cols-4 gap-3">
        <Card variant="metric">
          <AnimatedCounter
            value={stats.total}
            className="text-3xl font-bold"
          />
          <p>Total Socios</p>
        </Card>
        {/* ... más métricas ... */}
      </div>

      <FloatingButton actions={quickActions} />
    </>
  )
}
```

---

## 🚀 Tips de Implementación

### 1. Combina Múltiples Componentes

```tsx
// Skeleton mientras carga → Confetti cuando termina
const [loading, setLoading] = useState(true)
const { fire, ConfettiComponent } = useConfetti()

useEffect(() => {
  loadData().then(() => {
    setLoading(false)
    fire() // Celebra cuando termina de cargar
  })
}, [])

if (loading) return <SkeletonCard />
return <>{ConfettiComponent}<ActualContent /></>
```

### 2. Command Palette + Floating Button

Usuarios power usan Command Palette (`Cmd+K`), usuarios normales usan FloatingButton. ¡Ofrece ambos!

### 3. Empty States en Todas Partes

Reemplaza TODOS los "No hay datos" con `EmptyState`. Es un cambio pequeño con gran impacto.

### 4. Toast para Feedback Instantáneo

Cada acción importante debe mostrar un toast:
- ✅ Guardado exitoso
- ✅ Pago procesado
- ✅ Email enviado
- ❌ Error al conectar
- ⚠️ Campo requerido

### 5. Progress Steps para Onboarding

Usa `ProgressSteps` para:
- Registro de nuevos socios
- Configuración inicial del club
- Proceso de pago multi-paso
- Cualquier wizard complejo

---

## 📊 Comparación: Antes vs Después

| Componente | ❌ Antes | ✅ Después |
|------------|----------|------------|
| Loading | Spinner genérico | Skeleton con shimmer |
| Éxito | Toast verde básico | Confetti celebration |
| Lista vacía | "No hay datos" | EmptyState con ilustración |
| Navegación | Menú lateral | Command Palette Cmd+K |
| Métricas | Número estático | AnimatedCounter count-up |
| Acciones | Botón en header | FloatingButton radial |
| Wizard | Tabs simples | ProgressSteps animado |
| Feedback | alert() nativo | Toast con progress bar |

---

## 🎓 Próximos Pasos

1. **Reemplaza Loading States**: Cambia todos los spinners por Skeletons
2. **Agrega Celebrations**: Confetti en registro exitoso
3. **Mejora Empty States**: Ilustraciones en lugar de íconos
4. **Implementa Command Palette**: Usuarios power lo amarán
5. **Anima Métricas**: AnimatedCounter en dashboard
6. **Agrega FAB**: FloatingButton para acciones rápidas
7. **Mejora Wizards**: ProgressSteps en formularios multi-paso
8. **Toast Everywhere**: Feedback en cada acción

---

## 💡 Inspiración

Estos componentes están inspirados en:
- **Linear** - Command Palette, Empty States
- **Stripe** - Skeleton Loaders, Animated Counters
- **Vercel** - Toast Notifications, Progress Indicators
- **Notion** - FloatingButton, Multi-step Wizards

¡Pero adaptados al estilo único de CCE! 🎨

---

**¿Preguntas?** Todos los componentes están completamente documentados con TypeScript types y ejemplos de uso en el código fuente.
