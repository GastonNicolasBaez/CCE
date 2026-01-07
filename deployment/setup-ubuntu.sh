#!/bin/bash

##############################################################################
# Script de Instalación Automática - Club Comandante Espora
# Sistema Operativo: Ubuntu Server 22.04 LTS
# Descripción: Instala y configura todo lo necesario para el proyecto CCE
##############################################################################

set -e  # Detener si hay algún error

echo "======================================================"
echo "   Instalación Automática - Proyecto CCE"
echo "======================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
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

print_status "Actualizando sistema..."
apt update && apt upgrade -y

# ============================================
# 1. INSTALAR NODE.JS 22 LTS
# ============================================
print_status "Instalando Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verificar instalación
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_status "Node.js $NODE_VERSION instalado"
print_status "npm $NPM_VERSION instalado"

# ============================================
# 2. INSTALAR POSTGRESQL 15
# ============================================
print_status "Instalando PostgreSQL 15..."
apt install -y postgresql postgresql-contrib

# Iniciar y habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

print_status "PostgreSQL instalado y corriendo"

# ============================================
# 3. INSTALAR PM2 (Gestor de Procesos)
# ============================================
print_status "Instalando PM2..."
npm install -g pm2

# Configurar PM2 para iniciar al bootear
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
print_status "PM2 instalado y configurado para auto-inicio"

# ============================================
# 4. INSTALAR NGINX (Reverse Proxy)
# ============================================
print_status "Instalando Nginx..."
apt install -y nginx

# Iniciar y habilitar Nginx
systemctl start nginx
systemctl enable nginx

print_status "Nginx instalado y corriendo"

# ============================================
# 5. INSTALAR GIT
# ============================================
print_status "Instalando Git..."
apt install -y git

# ============================================
# 6. INSTALAR CERTBOT (SSL Gratis)
# ============================================
print_status "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

print_status "Certbot instalado"

# ============================================
# 7. CONFIGURAR FIREWALL (UFW)
# ============================================
print_status "Configurando Firewall UFW..."
apt install -y ufw

# Permitir SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

print_status "Firewall configurado (puertos 22, 80, 443 abiertos)"

# ============================================
# 8. INSTALAR FAIL2BAN (Seguridad)
# ============================================
print_status "Instalando Fail2ban para protección..."
apt install -y fail2ban

systemctl start fail2ban
systemctl enable fail2ban

print_status "Fail2ban instalado y activo"

# ============================================
# 9. CREAR USUARIO PARA LA APLICACIÓN
# ============================================
if ! id "cceapp" &>/dev/null; then
    print_status "Creando usuario 'cceapp' para la aplicación..."
    useradd -m -s /bin/bash cceapp
    usermod -aG sudo cceapp
    print_status "Usuario 'cceapp' creado"
else
    print_warning "Usuario 'cceapp' ya existe"
fi

# ============================================
# 10. CREAR DIRECTORIOS NECESARIOS
# ============================================
print_status "Creando estructura de directorios..."
mkdir -p /var/www/cce
mkdir -p /var/log/cce
mkdir -p /var/backups/cce

chown -R cceapp:cceapp /var/www/cce
chown -R cceapp:cceapp /var/log/cce
chown -R cceapp:cceapp /var/backups/cce

print_status "Directorios creados"

# ============================================
# 11. CONFIGURAR SWAP (Si tiene poca RAM)
# ============================================
if [ $(free -m | awk '/^Mem:/{print $2}') -lt 4096 ]; then
    print_warning "RAM menor a 4GB detectada. Configurando SWAP..."

    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_status "SWAP de 2GB creado"
    else
        print_warning "SWAP ya existe"
    fi
fi

# ============================================
# 12. INSTALAR HERRAMIENTAS ÚTILES
# ============================================
print_status "Instalando herramientas adicionales..."
apt install -y htop curl wget unzip vim net-tools

# ============================================
# RESUMEN
# ============================================
echo ""
echo "======================================================"
echo -e "${GREEN}   ✓ INSTALACIÓN COMPLETADA${NC}"
echo "======================================================"
echo ""
echo "Software instalado:"
echo "  • Node.js: $(node -v)"
echo "  • npm: $(npm -v)"
echo "  • PostgreSQL: $(psql --version | head -1)"
echo "  • PM2: $(pm2 -v)"
echo "  • Nginx: $(nginx -v 2>&1)"
echo "  • Git: $(git --version)"
echo ""
echo "Servicios corriendo:"
systemctl is-active --quiet postgresql && echo "  • PostgreSQL: ✓ Activo" || echo "  • PostgreSQL: ✗ Inactivo"
systemctl is-active --quiet nginx && echo "  • Nginx: ✓ Activo" || echo "  • Nginx: ✗ Inactivo"
systemctl is-active --quiet fail2ban && echo "  • Fail2ban: ✓ Activo" || echo "  • Fail2ban: ✗ Inactivo"
echo ""
echo "Próximos pasos:"
echo "  1. Configurar PostgreSQL (ejecutar: ./setup-database.sh)"
echo "  2. Clonar repositorio del proyecto"
echo "  3. Configurar Nginx (ejecutar: ./setup-nginx.sh)"
echo "  4. Configurar variables de entorno"
echo "  5. Deploy de la aplicación (ejecutar: ./deploy.sh)"
echo ""
echo "======================================================"
