# VS Code Configuration - Club Comandante Espora

Este directorio contiene la configuración de Visual Studio Code para el proyecto.

## 📦 Extensiones Recomendadas

Al abrir el proyecto, VS Code te sugerirá instalar las extensiones recomendadas. Haz clic en "Install All" para instalarlas.

Las extensiones incluyen:
- **ESLint** - Linting
- **Prettier** - Formato de código
- **Tailwind CSS IntelliSense** - Autocompletado de Tailwind
- **GitLens** - Mejor integración con Git
- **Thunder Client** - Cliente REST para probar APIs
- **SQLite Viewer** - Visualizar la base de datos
- Y más...

## ⚡ Tareas Disponibles

Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac) y escribe "Tasks: Run Task" para ver todas las tareas disponibles:

### Tareas Principales:

1. **Start Both Servers** - Inicia Frontend y Backend simultáneamente
2. **Backend: Dev Server** - Solo backend en modo desarrollo
3. **Frontend: Dev Server** - Solo frontend en modo desarrollo
4. **Backend: Initialize Test Database** - Crea datos de prueba
5. **Backend: Verify Database** - Verifica la base de datos

### Atajos Rápidos:

- **`Ctrl+Shift+B`** - Ejecutar tarea de Build (si está configurada)
- **`Ctrl+Shift+P` → "Tasks"** - Ver todas las tareas

## 🐛 Debugging

### Debug Backend:
1. Ve a la pestaña "Run and Debug" (`Ctrl+Shift+D`)
2. Selecciona "Debug Backend"
3. Presiona `F5` o haz clic en el botón verde

### Debug Frontend:
1. Ve a la pestaña "Run and Debug" (`Ctrl+Shift+D`)
2. Selecciona "Debug Frontend (Next.js)"
3. Presiona `F5`

### Debug Full Stack:
1. Selecciona "Debug Full Stack"
2. Esto iniciará tanto el backend como el frontend en modo debug

## 🎨 Configuración del Editor

El archivo `settings.json` configura:
- ✅ Formato automático al guardar con Prettier
- ✅ ESLint auto-fix al guardar
- ✅ Tamaño de tab: 2 espacios
- ✅ Autocompletado de Tailwind CSS
- ✅ Exclusión de carpetas innecesarias de la búsqueda

## 🔧 Personalización

Puedes sobrescribir cualquier configuración en tu `settings.json` personal:
- `File → Preferences → Settings`
- Busca la configuración que quieres cambiar
- Haz los cambios (se guardan en tu configuración personal)

## 📝 Tips Útiles

### Múltiples Terminales:
1. `Ctrl+Shift+` ` (backtick) - Abrir terminal
2. Haz clic en el `+` para abrir más terminales
3. Usa una para backend, otra para frontend

### Navegar entre archivos:
- `Ctrl+P` - Búsqueda rápida de archivos
- `Ctrl+Shift+F` - Buscar en todos los archivos
- `Ctrl+Click` - Ir a definición

### Testing APIs:
1. Instala Thunder Client (recomendado)
2. Haz clic en el ícono del rayo en la barra lateral
3. Crea requests para probar tus endpoints

### Ver Base de Datos SQLite:
1. Instala SQLite Viewer
2. Haz clic derecho en `BackendCCE/database.sqlite`
3. Selecciona "Open Database"
