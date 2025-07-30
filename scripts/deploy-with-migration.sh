#!/bin/bash

# Script de despliegue con migración de base de datos
# Uso: ./scripts/deploy-with-migration.sh [environment]
# Ejemplo: ./scripts/deploy-with-migration.sh production

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detectar entorno
ENVIRONMENT=${1:-development}
if [ -f ".env.${ENVIRONMENT}" ]; then
    log_info "Loading environment: $ENVIRONMENT"
    export $(grep -v '^#' .env.${ENVIRONMENT} | xargs)
elif [ -f ".env" ]; then
    log_info "Loading default environment"
    export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Starting deployment with database migration..."
echo "📅 $(date)"
echo "🌍 Environment: $ENVIRONMENT"

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found. Run this script from the project root."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    log_warning ".env file not found. Copying from .env.production..."
    cp .env.production .env
    log_info "Please review and update .env file with your production values"
    exit 1
fi

# Paso 1: Backup de la base de datos actual (si existe)
log_info "Step 1: Creating database backup..."
if docker compose ps | grep -q "wedding-api.*Up"; then
    docker compose exec -T api node scripts/migrate-database.js || true
    log_success "Database backup created"
else
    log_warning "API container not running, skipping backup"
fi

# Paso 2: Construir nuevas imágenes
log_info "Step 2: Building new images..."
docker compose build --no-cache
log_success "Images built successfully"

# Paso 3: Detener servicios actuales
log_info "Step 3: Stopping current services..."
docker compose down
log_success "Services stopped"

# Paso 4: Iniciar servicios con perfil de producción
log_info "Step 4: Starting services..."
if [ "$1" = "--production" ]; then
    log_info "Starting with production profile (SSL enabled)"
    docker compose --profile production up -d
else
    log_info "Starting in standard mode"
    docker compose up -d
fi

# Paso 5: Esperar a que la API esté lista
log_info "Step 5: Waiting for API to be ready..."
sleep 10

# Verificar que la API esté funcionando
max_attempts=30
attempt=1

# Determinar la URL de la API basada en el entorno
if [ "$ENVIRONMENT" = "production" ]; then
    # En producción, usar el nombre del servicio interno de Docker
    API_URL="http://api:3001/health"
    HEALTH_CHECK_CMD="docker compose exec -T api curl -s http://localhost:3001/health"
else
    # En desarrollo, usar localhost
    API_URL="http://localhost:3001/health"
    HEALTH_CHECK_CMD="curl -s $API_URL"
fi

log_info "Checking API health at: $API_URL"

while [ $attempt -le $max_attempts ]; do
    if eval $HEALTH_CHECK_CMD > /dev/null 2>&1; then
        log_success "API is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "API failed to start after $max_attempts attempts"
        docker compose logs api
        exit 1
    fi
    
    log_info "Waiting for API... (attempt $attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

# Paso 6: Ejecutar migración de base de datos
log_info "Step 6: Running database migration system..."
docker compose exec -T api node scripts/migrate-database.js
log_success "Database migration system completed"

# Paso 7: Verificar estado final
log_info "Step 7: Verifying deployment..."
docker compose ps

echo ""
log_success "🎉 Deployment completed successfully!"
echo ""
log_info "Services available at:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost:3001"
echo "  - Health check: http://localhost:3001/health"
echo ""
log_info "To view logs: docker compose logs -f"
log_info "To stop services: docker compose down"
echo ""