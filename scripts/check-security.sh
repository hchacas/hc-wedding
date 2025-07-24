#!/bin/bash

# Script para verificar que no hay credenciales expuestas
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificación de Seguridad - Wedding App${NC}"
echo "=================================================="

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Contador de problemas
ISSUES=0

echo ""
log_info "Verificando credenciales expuestas..."

# Verificar archivos .env
if [ -f ".env" ]; then
    log_info "Verificando archivo .env..."
    
    # Verificar Google Client Secret real
    if grep -q "GOCSPX-[A-Za-z0-9_-]\{35\}" .env; then
        log_error "¡CREDENCIAL REAL DETECTADA! Google Client Secret en .env"
        log_error "Reemplaza con: GOOGLE_CLIENT_SECRET=your-google-client-secret"
        ISSUES=$((ISSUES + 1))
    else
        log_success "Google Client Secret: OK (placeholder detectado)"
    fi
    
    # Verificar Client ID real
    if grep -q "[0-9]\{12\}-[a-z0-9]\{32\}\.apps\.googleusercontent\.com" .env; then
        log_warning "Google Client ID real detectado en .env"
        log_warning "Considera usar placeholder: your-google-client-id.apps.googleusercontent.com"
    else
        log_success "Google Client ID: OK (placeholder detectado)"
    fi
    
    # Verificar SESSION_SECRET débil
    if grep -q "SESSION_SECRET=dev-secret-key" .env; then
        log_warning "SESSION_SECRET débil detectado"
        log_warning "Genera uno seguro: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    else
        log_success "SESSION_SECRET: OK"
    fi
else
    log_warning "Archivo .env no encontrado"
    log_info "Crea uno desde: cp .env.example .env"
fi

echo ""
log_info "Verificando archivos de código fuente..."

# Buscar credenciales hardcodeadas en código
SEARCH_DIRS="api/src ui/src"
FOUND_SECRETS=false

for dir in $SEARCH_DIRS; do
    if [ -d "$dir" ]; then
        log_info "Verificando directorio: $dir"
        
        # Buscar Google Client Secrets
        if grep -r "GOCSPX-[A-Za-z0-9_-]\{35\}" "$dir" 2>/dev/null; then
            log_error "¡Google Client Secret encontrado en código fuente!"
            FOUND_SECRETS=true
            ISSUES=$((ISSUES + 1))
        fi
        
        # Buscar Client IDs reales
        if grep -r "[0-9]\{12\}-[a-z0-9]\{32\}\.apps\.googleusercontent\.com" "$dir" 2>/dev/null; then
            log_error "¡Google Client ID encontrado en código fuente!"
            FOUND_SECRETS=true
            ISSUES=$((ISSUES + 1))
        fi
        
        # Buscar otras posibles credenciales
        if grep -r "client_secret.*=" "$dir" 2>/dev/null | grep -v "your-google-client-secret" | grep -v "process.env"; then
            log_warning "Posibles credenciales hardcodeadas encontradas"
            FOUND_SECRETS=true
        fi
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    log_success "No se encontraron credenciales hardcodeadas en código fuente"
fi

echo ""
log_info "Verificando configuración de Git..."

# Verificar .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        log_success ".env está en .gitignore"
    else
        log_error ".env NO está en .gitignore"
        log_error "Agrega '.env' a .gitignore inmediatamente"
        ISSUES=$((ISSUES + 1))
    fi
else
    log_error "Archivo .gitignore no encontrado"
    ISSUES=$((ISSUES + 1))
fi

# Verificar si .env está trackeado por Git
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    log_error "¡PELIGRO! .env está siendo trackeado por Git"
    log_error "Ejecuta: git rm --cached .env && git commit -m 'Remove .env from tracking'"
    ISSUES=$((ISSUES + 1))
else
    log_success ".env no está siendo trackeado por Git"
fi

echo ""
log_info "Verificando archivos de ejemplo..."

# Verificar que .env.example existe
if [ -f ".env.example" ]; then
    log_success ".env.example existe"
    
    # Verificar que no tiene credenciales reales
    if grep -q "GOCSPX-[A-Za-z0-9_-]\{35\}" .env.example; then
        log_error "¡Credenciales reales en .env.example!"
        ISSUES=$((ISSUES + 1))
    else
        log_success ".env.example no contiene credenciales reales"
    fi
else
    log_warning ".env.example no encontrado"
    log_info "Crea uno para documentar las variables necesarias"
fi

echo ""
echo "=================================================="

# Resumen final
if [ $ISSUES -eq 0 ]; then
    log_success "✅ VERIFICACIÓN COMPLETADA - No se encontraron problemas críticos de seguridad"
    echo ""
    log_info "Recomendaciones adicionales:"
    echo "  • Usa diferentes credenciales para desarrollo y producción"
    echo "  • Rota credenciales regularmente"
    echo "  • Nunca compartas credenciales por email o chat"
    echo "  • Usa variables de entorno en producción"
else
    log_error "❌ VERIFICACIÓN FALLIDA - Se encontraron $ISSUES problema(s) crítico(s)"
    echo ""
    log_error "ACCIÓN REQUERIDA:"
    echo "  • Corrige los problemas listados arriba"
    echo "  • Ejecuta este script nuevamente"
    echo "  • NO despliegues hasta resolver todos los problemas"
    
    exit 1
fi

echo ""
log_info "Para más información sobre seguridad, lee: SECURITY.md"