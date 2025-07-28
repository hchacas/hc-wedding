#!/bin/bash

# Script de backup para la aplicación de boda
set -e

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wedding_backup_${DATE}.tar.gz"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log "🗄️ Iniciando backup de la aplicación..."

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Crear backup de la base de datos
log "Haciendo backup de la base de datos..."
if [ -f api/wedding.db ]; then
    cp api/wedding.db $BACKUP_DIR/wedding_${DATE}.db
else
    warn "Base de datos no encontrada en api/wedding.db"
fi

# Crear backup completo (excluyendo node_modules y archivos temporales)
log "Creando backup completo..."
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='.env' \
    .

log "✅ Backup completado: $BACKUP_DIR/$BACKUP_FILE"

# Limpiar backups antiguos (mantener solo los últimos 10)
log "Limpiando backups antiguos..."
cd $BACKUP_DIR
ls -t wedding_backup_*.tar.gz | tail -n +11 | xargs -r rm
cd ..

log "🎉 Proceso de backup completado"
echo "Archivo de backup: $BACKUP_DIR/$BACKUP_FILE"