#!/bin/bash

# Script de setup inicial para la aplicación de boda
set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[SETUP] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[SETUP] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[SETUP] ERROR: $1${NC}"
    exit 1
}

log "🚀 Configuración inicial de la aplicación de boda"

# Verificar prerrequisitos
log "Verificando prerrequisitos..."

command -v docker >/dev/null 2>&1 || error "Docker no está instalado. Instálalo desde https://docker.com"
command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose no está instalado"
command -v node >/dev/null 2>&1 || warn "Node.js no está instalado (opcional para desarrollo local)"
command -v npm >/dev/null 2>&1 || warn "npm no está instalado (opcional para desarrollo local)"

log "✅ Prerrequisitos verificados"

# Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p data
mkdir -p backups
mkdir -p logs
mkdir -p nginx/ssl

# Configurar archivo de entorno
if [ ! -f .env ]; then
    log "Configurando archivo de entorno..."
    cp .env.production .env
    
    # Generar secreto de sesión aleatorio
    if command -v openssl >/dev/null 2>&1; then
        SESSION_SECRET=$(openssl rand -base64 32)
        # Escapar caracteres especiales para sed
        SESSION_SECRET_ESCAPED=$(echo "$SESSION_SECRET" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i.bak "s/tu-secreto-super-seguro-de-al-menos-32-caracteres/$SESSION_SECRET_ESCAPED/" .env
        rm .env.bak 2>/dev/null || true
        log "✅ Secreto de sesión generado automáticamente"
    fi
    
    warn "Archivo .env creado. DEBES editarlo con tus configuraciones:"
    warn "- GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
    warn "- FRONTEND_URL y API_URL para tu dominio"
    echo ""
    echo "Para editar: nano .env"
    echo ""
else
    log "✅ Archivo .env ya existe"
fi

# Inicializar base de datos
if [ ! -f api/wedding.db ]; then
    log "Inicializando base de datos..."
    
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        cd api
        npm install --silent
        npm run init-db
        cd ..
        log "✅ Base de datos inicializada"
    else
        warn "Node.js no disponible. La base de datos se inicializará en el primer despliegue"
    fi
else
    log "✅ Base de datos ya existe"
fi

# Hacer scripts ejecutables
log "Configurando permisos de scripts..."
chmod +x scripts/*.sh
log "✅ Scripts configurados"

# Mostrar información de configuración OAuth
echo ""
echo "🔐 CONFIGURACIÓN OAUTH REQUERIDA:"
echo "=================================="
echo "1. Ve a: https://console.cloud.google.com/"
echo "2. Crea un nuevo proyecto o selecciona uno existente"
echo "3. Habilita la API de Google+"
echo "4. Crea credenciales OAuth 2.0:"
echo "   - Tipo: Aplicación web"
echo "   - URIs de redirección autorizados:"
echo "     * http://localhost:3001/auth/google/callback (desarrollo)"
echo "     * https://tu-dominio.com/auth/google/callback (producción)"
echo "5. Copia Client ID y Client Secret al archivo .env"
echo ""

# Mostrar próximos pasos
echo "📋 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Editar configuración:"
echo "   nano .env"
echo ""
echo "2. Para desarrollo local:"
echo "   docker compose up --build"
echo ""
echo "3. Para producción:"
echo "   ./scripts/deploy.sh"
echo ""
echo "4. Monitorear aplicación:"
echo "   ./scripts/monitor.sh"
echo ""
echo "5. Crear backup:"
echo "   ./scripts/backup.sh"
echo ""

log "🎉 Setup inicial completado"
log "Recuerda configurar OAuth antes del primer despliegue"