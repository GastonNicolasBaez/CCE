#!/bin/bash

##############################################################################
# Script de Deploy - CCE
# Descripción: Deploy completo de Frontend y Backend
##############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

echo "======================================================"
echo "   Deploy Completo - CCE"
echo "======================================================"
echo ""

# Variables
APP_DIR="/home/cceapp/CCE"
BACKEND_DIR="$APP_DIR/BackendCCE"
FRONTEND_DIR="$APP_DIR/FrontendCCE"
USER="cceapp"

# Verificar que estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio del proyecto no encontrado: $APP_DIR"
    exit 1
fi

cd $APP_DIR

# ============================================
# 1. GIT PULL (Actualizar código)
# ============================================
print_info "Actualizando código desde Git..."
sudo -u $USER git pull origin main
print_status "Código actualizado"

# ============================================
# 2. BACKEND - Instalación y Migraciones
# ============================================
echo ""
print_info "=== BACKEND ==="
cd $BACKEND_DIR

print_info "Instalando dependencias del backend..."
sudo -u $USER npm install --production
print_status "Dependencias del backend instaladas"

print_info "Verificando variables de entorno..."
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado en $BACKEND_DIR"
    print_warning "Crea el archivo .env antes de continuar"
    exit 1
fi
print_status "Variables de entorno encontradas"

print_info "Ejecutando migraciones de base de datos..."
sudo -u $USER npm run migrate:auto
print_status "Migraciones completadas"

# ============================================
# 3. FRONTEND - Build de Producción
# ============================================
echo ""
print_info "=== FRONTEND ==="
cd $FRONTEND_DIR

print_info "Instalando dependencias del frontend..."
sudo -u $USER npm install --production
print_status "Dependencias del frontend instaladas"

print_info "Verificando variables de entorno..."
if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    print_warning "No se encontró .env.local o .env.production"
    print_warning "Asegúrate de configurar las variables de entorno"
fi

print_info "Compilando frontend para producción..."
sudo -u $USER npm run build
print_status "Frontend compilado exitosamente"

# ============================================
# 4. PM2 - Reiniciar Servicios
# ============================================
echo ""
print_info "=== PM2 - GESTIÓN DE PROCESOS ==="

cd $APP_DIR

# Verificar si PM2 ya está corriendo los procesos
if sudo -u $USER pm2 list | grep -q "cce-backend"; then
    print_info "Reiniciando procesos existentes..."
    sudo -u $USER pm2 reload deployment/ecosystem.config.js
    print_status "Procesos reiniciados"
else
    print_info "Iniciando procesos por primera vez..."
    sudo -u $USER pm2 start deployment/ecosystem.config.js
    print_status "Procesos iniciados"
fi

# Guardar configuración de PM2
sudo -u $USER pm2 save

# ============================================
# 5. VERIFICAR SALUD DE LOS SERVICIOS
# ============================================
echo ""
print_info "Verificando servicios..."
sleep 5  # Esperar a que los servicios inicien

# Verificar Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Backend respondiendo en puerto 3001"
else
    print_error "Backend NO responde en puerto 3001"
    print_warning "Revisa logs con: pm2 logs cce-backend"
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend respondiendo en puerto 3000"
else
    print_error "Frontend NO responde en puerto 3000"
    print_warning "Revisa logs con: pm2 logs cce-frontend"
fi

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    print_status "Nginx activo"
else
    print_error "Nginx NO está activo"
    print_warning "Inicia con: sudo systemctl start nginx"
fi

# ============================================
# RESUMEN
# ============================================
echo ""
echo "======================================================"
echo -e "${GREEN}   ✓ DEPLOY COMPLETADO${NC}"
echo "======================================================"
echo ""
echo "Estado de los servicios:"
sudo -u $USER pm2 list
echo ""
echo "Comandos útiles:"
echo "  Ver logs del backend:  pm2 logs cce-backend"
echo "  Ver logs del frontend: pm2 logs cce-frontend"
echo "  Reiniciar backend:     pm2 restart cce-backend"
echo "  Reiniciar frontend:    pm2 restart cce-frontend"
echo "  Monitor en vivo:       pm2 monit"
echo "  Estado de PM2:         pm2 status"
echo ""
echo "Accede a tu aplicación en:"
echo "  • https://zeclogic.net.ar"
echo "  • http://zeclogic.net.ar (si aún no tienes SSL)"
echo ""
echo "======================================================"
