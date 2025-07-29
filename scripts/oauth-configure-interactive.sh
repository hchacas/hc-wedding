#!/bin/bash

# Script para configurar OAuth de Google
set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[OAUTH] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[OAUTH] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[OAUTH] INFO: $1${NC}"
}

error() {
    echo -e "${RED}[OAUTH] ERROR: $1${NC}"
    exit 1
}

log "🔐 Configuración de Google OAuth para Wedding App"

echo ""
echo "📋 PASOS PREVIOS (si no los has hecho):"
echo "======================================"
echo "1. Ve a: https://console.cloud.google.com/"
echo "2. Crea un nuevo proyecto o selecciona uno existente"
echo "3. Habilita la API de Google Identity:"
echo "   - Ve a 'APIs & Services' → 'Library'"
echo "   - Busca 'Google Identity' y habilítala"
echo "4. Ve a 'APIs & Services' → 'Credentials'"
echo "5. Clic en '+ CREATE CREDENTIALS' → 'OAuth 2.0 Client IDs'"
echo "6. Selecciona 'Web application'"
echo ""

echo "📝 CONFIGURACIÓN REQUERIDA:"
echo "=========================="
echo "Name: Wedding App"
echo ""
echo "Authorized JavaScript origins:"
echo "  - http://localhost:3001"
echo "  - http://localhost:4321"
echo "  - https://tu-dominio.com (para producción)"
echo ""
echo "Authorized redirect URIs:"
echo "  - http://localhost:3001/auth/google/callback"
echo "  - https://tu-dominio.com/auth/google/callback (para producción)"
echo ""

# Solicitar credenciales
echo "🔑 INGRESA TUS CREDENCIALES:"
echo "============================"

read -p "Google Client ID: " CLIENT_ID
if [ -z "$CLIENT_ID" ]; then
    error "Client ID es requerido"
fi

read -s -p "Google Client Secret: " CLIENT_SECRET
echo ""
if [ -z "$CLIENT_SECRET" ]; then
    error "Client Secret es requerido"
fi

# Validar formato básico
if [[ ! "$CLIENT_ID" =~ .*\.apps\.googleusercontent\.com$ ]]; then
    warn "El Client ID no parece tener el formato correcto (debería terminar en .apps.googleusercontent.com)"
fi

if [[ ! "$CLIENT_SECRET" =~ ^GOCSPX-.* ]]; then
    warn "El Client Secret no parece tener el formato correcto (debería empezar con GOCSPX-)"
fi

# Crear backup del .env actual
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    log "✅ Backup del .env actual creado"
fi

# Actualizar archivo .env
log "Actualizando archivo .env..."

# Usar sed para reemplazar las credenciales
sed -i.tmp "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env
sed -i.tmp "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env
rm .env.tmp

log "✅ Credenciales OAuth configuradas correctamente"

# Verificar configuración
echo ""
echo "🔍 VERIFICACIÓN:"
echo "================"
echo "Client ID: ${CLIENT_ID:0:20}...${CLIENT_ID: -20}"
echo "Client Secret: ${CLIENT_SECRET:0:10}...***"

# Reiniciar contenedores si están ejecutándose
if docker compose ps | grep -q "wedding-api.*Up"; then
    log "Reiniciando contenedores para aplicar cambios..."
    docker compose restart api
    sleep 5
    
    # Verificar que el API esté funcionando
    if curl -s http://localhost:3001/health > /dev/null; then
        log "✅ API reiniciado correctamente"
    else
        warn "El API podría no estar funcionando correctamente"
    fi
fi

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "=========================="
echo "Ahora puedes probar el login OAuth:"
echo "1. Ve a: http://localhost/rsvp/login"
echo "2. Haz clic en 'Continuar con Google'"
echo "3. Deberías ser redirigido a Google para autenticarte"
echo ""
echo "Si hay problemas:"
echo "- Verifica que las URLs de redirección estén correctas en Google Cloud Console"
echo "- Revisa los logs: docker compose logs api"
echo "- Asegúrate de que el dominio coincida exactamente"
echo ""

log "OAuth configurado exitosamente 🚀"