#!/bin/bash

##############################################################################
# Script de Configuración de PostgreSQL - CCE
# Descripción: Crea base de datos, usuario y configura permisos
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

echo "======================================================"
echo "   Configuración de PostgreSQL - CCE"
echo "======================================================"
echo ""

# Solicitar información
read -p "Nombre de la base de datos [cce_db]: " DB_NAME
DB_NAME=${DB_NAME:-cce_db}

read -p "Usuario de la base de datos [cce_user]: " DB_USER
DB_USER=${DB_USER:-cce_user}

# Generar contraseña aleatoria segura
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
echo ""
print_warning "Contraseña generada automáticamente: $DB_PASSWORD"
echo -e "${YELLOW}¡GUARDA ESTA CONTRASEÑA! La necesitarás para las variables de entorno${NC}"
echo ""
read -p "Presiona ENTER para continuar..."

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor ejecuta este script como root (sudo)"
    exit 1
fi

print_status "Creando base de datos y usuario..."

# Ejecutar comandos SQL como usuario postgres
su - postgres <<EOF
psql -c "CREATE DATABASE $DB_NAME;"
psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

# PostgreSQL 15+ requiere estos permisos adicionales
psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
EOF

print_status "Base de datos configurada correctamente"

# Configurar PostgreSQL para aceptar conexiones locales
print_status "Configurando acceso local..."

PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"

# Backup de configuración
cp $PG_HBA ${PG_HBA}.backup
cp $PG_CONF ${PG_CONF}.backup

# Permitir conexiones locales con contraseña
if ! grep -q "local.*$DB_NAME.*$DB_USER.*md5" $PG_HBA; then
    echo "local   $DB_NAME   $DB_USER   md5" >> $PG_HBA
fi

# Reiniciar PostgreSQL
systemctl restart postgresql

print_status "PostgreSQL reiniciado"

# Probar conexión
print_status "Probando conexión..."
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Conexión exitosa"
else
    print_error "Error al conectar a la base de datos"
    exit 1
fi

# Guardar credenciales en archivo (para referencia)
cat > /root/.cce_db_credentials <<EOF
# Credenciales de Base de Datos - CCE
# Generadas el: $(date)
# ¡MANTÉN ESTE ARCHIVO SEGURO!

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Connection String
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
EOF

chmod 600 /root/.cce_db_credentials

echo ""
echo "======================================================"
echo -e "${GREEN}   ✓ CONFIGURACIÓN COMPLETADA${NC}"
echo "======================================================"
echo ""
echo "Credenciales de la base de datos:"
echo "  • Host: localhost"
echo "  • Puerto: 5432"
echo "  • Base de datos: $DB_NAME"
echo "  • Usuario: $DB_USER"
echo "  • Contraseña: $DB_PASSWORD"
echo ""
echo "Connection String:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo -e "${YELLOW}Estas credenciales también están guardadas en:${NC}"
echo "  /root/.cce_db_credentials"
echo ""
echo "Próximo paso:"
echo "  Configura estas credenciales en tus archivos .env"
echo ""
echo "======================================================"
