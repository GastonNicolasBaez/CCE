# 🏀 Club Comandante Espora - Dashboard

Un sistema de gestión integral y moderno para el Club Comandante Espora, construido con las últimas tecnologías web y una estética de vanguardia.

## ✨ Características

### 🎨 Diseño y Estética
- **Neumorfismo y Glassmorphism**: Diseño moderno con sombras sutiles y efectos de vidrio esmerilado
- **Paleta de Colores del Club**: Azul oscuro (#002C6F), blanco (#FFFFFF) y naranja vibrante (#FFA500)
- **Tipografía Moderna**: Inter y Plus Jakarta Sans para una apariencia profesional
- **Responsive Design**: Optimizado para todos los dispositivos

### 🚀 Tecnologías de Última Generación
- **Next.js 14**: Con App Router y React Server Components
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de CSS utilitario con estilos personalizados
- **Zustand**: Gestión de estado ligera y escalable
- **Framer Motion**: Animaciones fluidas y profesionales

### 📊 Funcionalidades Principales

#### 1. Panel de Control (Dashboard)
- Widgets de datos clave con animaciones de conteo
- Gráficos interactivos de estado de pagos por actividad
- Carrusel de inscripciones recientes
- Métricas en tiempo real

#### 2. Gestión de Socios y Jugadores
- Tabla virtualizada de alto rendimiento con TanStack Table
- Búsqueda y filtros dinámicos por actividad, estado y pagos
- Acciones en línea para editar y eliminar registros
- Formulario de registro con validaciones en tiempo real

#### 3. Estado de Pagos y Automatización
- Gestión eficiente de cuotas pendientes y vencidas
- Selección múltiple de socios con checkboxes
- Modal de envío masivo por email y SMS
- Sistema de recordatorios automáticos configurables

#### 4. Formulario de Inscripción Moderno
- Proceso de 3 pasos con navegación fluida
- Validaciones en tiempo real con React Hook Form y Zod
- Autocompletado y sugerencias
- Página de confirmación atractiva

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd club-comandante-espora-dashboard
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js 14
│   ├── globals.css        # Estilos globales y componentes
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/             # Componentes React
│   ├── dashboard/         # Componentes del dashboard
│   ├── members/           # Gestión de miembros
│   ├── payments/          # Gestión de pagos
│   ├── registration/      # Formulario de inscripción
│   └── ui/               # Componentes de UI reutilizables
├── lib/                   # Utilidades y configuración
│   ├── store.ts          # Store de Zustand
│   └── utils.ts          # Funciones utilitarias
├── public/                # Archivos estáticos
└── package.json           # Dependencias del proyecto
```

## 🎯 Uso

### Navegación
- **Panel de Control**: Vista general con métricas y gráficos
- **Socios y Jugadores**: Gestión completa de miembros del club
- **Estado de Pagos**: Control de cuotas y recordatorios
- **Inscripción**: Formulario para nuevos socios

### Funcionalidades Clave
1. **Dashboard Interactivo**: Visualiza estadísticas en tiempo real
2. **Gestión de Miembros**: CRUD completo con búsqueda y filtros
3. **Sistema de Pagos**: Seguimiento de cuotas y envío de recordatorios
4. **Formulario de Inscripción**: Proceso guiado y validado

## 🔧 Configuración

### Variables de Entorno
Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_APP_NAME="Club Comandante Espora"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Personalización de Estilos
Los estilos se pueden personalizar en:
- `tailwind.config.js`: Colores, fuentes y sombras
- `app/globals.css`: Estilos personalizados y componentes

## 📱 Responsive Design

El dashboard está completamente optimizado para:
- **Desktop**: Vista completa con sidebar expandida
- **Tablet**: Sidebar colapsable y layout adaptativo
- **Mobile**: Navegación móvil optimizada

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
npm start
```

### Plataformas Recomendadas
- **Vercel**: Despliegue automático con Next.js
- **Netlify**: Despliegue estático optimizado
- **AWS Amplify**: Despliegue en la nube de AWS

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: [Tu Nombre]
- **Diseño**: Club Comandante Espora
- **Tecnologías**: Next.js, React, TypeScript, Tailwind CSS

## 📞 Soporte

Para soporte técnico o consultas:
- Email: [tu-email@ejemplo.com]
- Documentación: [link-a-docs]
- Issues: [GitHub Issues]

---

**Club Comandante Espora** - Transformando la gestión deportiva con tecnología de vanguardia 🏆
