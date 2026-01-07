#!/bin/bash

##############################################################################
# Script de Backup Automático - CCE
# Descripción: Backup diario de base de datos y archivos
# Uso: Ejecutar manualmente o configurar en crontab
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

# Variables
BACKUP_DIR="/var/backups/cce"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7  # Mantener backups de los últimos 7 días

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR/{database,files}

echo "======================================================"
echo "   Backup CCE - $(date)"
echo "======================================================"

# ============================================
# 1. BACKUP DE BASE DE DATOS
# ============================================
print_status "Iniciando backup de base de datos..."

# Leer credenciales del archivo
if [ -f /root/.cce_db_credentials ]; then
    source /root/.cce_db_credentials
else
    print_error "Archivo de credenciales no encontrado"
    exit 1
fi

# Backup de PostgreSQL
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/database/cce_db_$DATE.dump"

# Comprimir backup
gzip "$BACKUP_DIR/database/cce_db_$DATE.dump"

DB_BACKUP_SIZE=$(du -h "$BACKUP_DIR/database/cce_db_$DATE.dump.gz" | cut -f1)
print_status "Backup de base de datos completado: $DB_BACKUP_SIZE"

# ============================================
# 2. BACKUP DE ARCHIVOS (variables de entorno)
# ============================================
print_status "Backup de archivos de configuración..."

tar -czf "$BACKUP_DIR/files/cce_config_$DATE.tar.gz" \
    /home/cceapp/CCE/BackendCCE/.env \
    /home/cceapp/CCE/FrontendCCE/.env.local \
    /home/cceapp/CCE/FrontendCCE/.env.production \
    /etc/nginx/sites-available/cce \
    2>/dev/null || true

CONFIG_BACKUP_SIZE=$(du -h "$BACKUP_DIR/files/cce_config_$DATE.tar.gz" | cut -f1)
print_status "Backup de configuración completado: $CONFIG_BACKUP_SIZE"

# ============================================
# 3. LIMPIAR BACKUPS ANTIGUOS
# ============================================
print_status "Limpiando backups antiguos (>${RETENTION_DAYS} días)..."

find $BACKUP_DIR/database -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR/files -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

TOTAL_BACKUPS=$(find $BACKUP_DIR -type f | wc -l)
print_status "Backups actuales: $TOTAL_BACKUPS archivos"

# ============================================
# 4. VERIFICAR INTEGRIDAD
# ============================================
print_status "Verificando integridad del backup..."

if [ -f "$BACKUP_DIR/database/cce_db_$DATE.dump.gz" ]; then
    if gzip -t "$BACKUP_DIR/database/cce_db_$DATE.dump.gz" 2>/dev/null; then
        print_status "Integridad verificada: OK"
    else
        print_error "Backup corrupto"
        exit 1
    fi
fi

# ============================================
# RESUMEN
# ============================================
echo ""
echo "======================================================"
echo -e "${GREEN}   ✓ BACKUP COMPLETADO${NC}"
echo "======================================================"
echo ""
echo "Archivos generados:"
echo "  • Base de datos: cce_db_$DATE.dump.gz ($DB_BACKUP_SIZE)"
echo "  • Configuración: cce_config_$DATE.tar.gz ($CONFIG_BACKUP_SIZE)"
echo ""
echo "Ubicación: $BACKUP_DIR"
echo "Retención: $RETENTION_DAYS días"
echo ""
echo "Para restaurar:"
echo "  gunzip $BACKUP_DIR/database/cce_db_$DATE.dump.gz"
echo "  pg_restore -h localhost -U $DB_USER -d $DB_NAME $BACKUP_DIR/database/cce_db_$DATE.dump"
echo ""
echo "======================================================"

# Registro en syslog
logger -t cce-backup "Backup completado exitosamente"
