#!/bin/bash

# Script de monitoreo para la aplicación de boda
set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Función para verificar servicio
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        log "✅ $service_name está funcionando correctamente"
        return 0
    else
        error "❌ $service_name no está respondiendo correctamente"
        return 1
    fi
}

# Función para verificar contenedor Docker
check_container() {
    local container_name=$1
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        log "✅ Contenedor $container_name está ejecutándose"
        return 0
    else
        error "❌ Contenedor $container_name no está ejecutándose"
        return 1
    fi
}

log "🔍 Iniciando monitoreo de la aplicación..."

# Verificar contenedores Docker
log "Verificando contenedores Docker..."
check_container "wedding-api"
check_container "wedding-ui"

# Verificar servicios web
log "Verificando servicios web..."
check_service "API Health Check" "http://localhost:3001/health"
check_service "Frontend Health Check" "http://localhost/health"
check_service "API Auth Endpoint" "http://localhost:3001/auth/me" "401"

# Verificar uso de recursos
log "Verificando uso de recursos..."
echo ""
echo "=== Estado de contenedores ==="
docker-compose ps

echo ""
echo "=== Uso de recursos ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "=== Logs recientes de la API ==="
docker-compose logs --tail=10 api

echo ""
echo "=== Logs recientes del Frontend ==="
docker-compose logs --tail=10 ui

# Verificar espacio en disco
echo ""
echo "=== Espacio en disco ==="
df -h

# Verificar tamaño de la base de datos
if [ -f api/wedding.db ]; then
    db_size=$(du -h api/wedding.db | cut -f1)
    log "📊 Tamaño de la base de datos: $db_size"
else
    warn "Base de datos no encontrada"
fi

# Verificar backups
backup_count=$(ls -1 backups/wedding_backup_*.tar.gz 2>/dev/null | wc -l)
log "💾 Backups disponibles: $backup_count"

log "🎉 Monitoreo completado"