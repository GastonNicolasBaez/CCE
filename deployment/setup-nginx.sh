#!/bin/bash

##############################################################################
# Script de Configuración de Nginx - CCE
# Descripción: Configura Nginx como reverse proxy y SSL
##############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor ejecuta este script como root (sudo)"
    exit 1
fi

echo "======================================================"
echo "   Configuración de Nginx - CCE"
echo "======================================================"
echo ""

DOMAIN="zeclogic.net.ar"
CONFIG_FILE="nginx-config.conf"
DEPLOYMENT_DIR="/home/cceapp/CCE/deployment"

# Verificar que existe el archivo de configuración
if [ ! -f "$DEPLOYMENT_DIR/$CONFIG_FILE" ]; then
    print_error "No se encuentra el archivo de configuración: $CONFIG_FILE"
    print_error "Asegúrate de que el repositorio esté clonado en /home/cceapp/CCE"
    exit 1
fi

print_status "Copiando configuración de Nginx..."

# Copiar configuración
cp "$DEPLOYMENT_DIR/$CONFIG_FILE" /etc/nginx/sites-available/cce

# Crear enlace simbólico
ln -sf /etc/nginx/sites-available/cce /etc/nginx/sites-enabled/cce

# Eliminar configuración default si existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    print_status "Eliminando configuración default..."
    rm /etc/nginx/sites-enabled/default
fi

# Crear directorio para certbot
mkdir -p /var/www/certbot

# Probar configuración de Nginx
print_status "Probando configuración de Nginx..."
if nginx -t; then
    print_status "Configuración válida"
else
    print_error "Error en la configuración de Nginx"
    exit 1
fi

# Recargar Nginx
print_status "Recargando Nginx..."
systemctl reload nginx

echo ""
print_warning "IMPORTANTE: Configuración SSL"
echo ""
echo "Para configurar SSL con Let's Encrypt, necesitas:"
echo "  1. Asegurarte de que el dominio $DOMAIN apunte a esta IP"
echo "  2. Que los puertos 80 y 443 estén abiertos en el router (port forwarding)"
echo ""
echo "Una vez que el dominio esté apuntando correctamente, ejecuta:"
echo ""
echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
print_warning "POR AHORA, comenta las líneas SSL en /etc/nginx/sites-available/cce"
print_warning "y reinicia nginx con: sudo systemctl restart nginx"
echo ""
echo "Para probar sin SSL temporalmente:"
echo "  1. Edita /etc/nginx/sites-available/cce"
echo "  2. Comenta (con #) las líneas de SSL (líneas 57-62)"
echo "  3. Cambia 'listen 443 ssl http2' a 'listen 80'"
echo "  4. Reinicia: sudo systemctl restart nginx"
echo ""
echo "======================================================"
echo -e "${GREEN}   ✓ NGINX CONFIGURADO${NC}"
echo "======================================================"
echo ""
echo "Estado del servicio:"
systemctl status nginx --no-pager | head -5
echo ""
