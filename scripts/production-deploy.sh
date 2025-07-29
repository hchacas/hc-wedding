#!/bin/bash

# Script de despliegue para la aplicación de boda
set -e

echo "🚀 Iniciando despliegue de la aplicación de boda..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que Docker y Docker Compose están instalados
command -v docker >/dev/null 2>&1 || error "Docker no está instalado"
command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose no está instalado"

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    warn "Archivo .env no encontrado. Copiando desde .env.production..."
    cp .env.production .env
    warn "Por favor, edita el archivo .env con tus configuraciones antes de continuar"
    exit 1
fi

# Crear directorio de datos si no existe
log "Creando directorios necesarios..."
mkdir -p data
mkdir -p logs

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker compose down --remove-orphans

# Limpiar imágenes antiguas (opcional)
if [ "$1" = "--clean" ]; then
    log "Limpiando imágenes antiguas..."
    docker system prune -f
    docker compose build --no-cache
else
    log "Construyendo imágenes..."
    docker compose build
fi

# Inicializar base de datos si no existe
if [ ! -f api/wedding.db ]; then
    log "Inicializando base de datos..."
    cd api
    npm install
    npm run init-db
    cd ..
fi

# Iniciar servicios
log "Iniciando servicios..."
docker compose up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
log "Verificando estado de los servicios..."
docker compose ps

# Health checks
log "Ejecutando health checks..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log "✅ API está funcionando"
        break
    fi
    if [ $i -eq 30 ]; then
        error "API no responde después de 30 intentos"
    fi
    sleep 2
done

for i in {1..30}; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log "✅ Frontend está funcionando"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Frontend no responde después de 30 intentos"
    fi
    sleep 2
done

log "🎉 ¡Despliegue completado exitosamente!"
log "📱 Frontend: http://localhost"
log "🔧 API: http://localhost:3001"
log "📊 Logs: docker compose logs -f"
log "🛑 Detener: docker compose down"

echo ""
echo "Para monitorear los logs en tiempo real:"
echo "docker compose logs -f"
echo ""
echo "Para acceder al contenedor de la API:"
echo "docker compose exec api sh"
echo ""
echo "Para hacer backup de la base de datos:"
echo "./scripts/backup.sh"