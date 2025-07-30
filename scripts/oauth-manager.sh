#!/bin/bash

# Script unificado para gestión de OAuth
# Combina funcionalidades de configuración, verificación y troubleshooting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

show_help() {
    echo "🔐 OAuth Manager - Boda Sheila & Habib"
    echo "======================================"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  setup       Configurar OAuth interactivamente"
    echo "  check       Verificar configuración actual"
    echo "  test        Probar OAuth en la aplicación"
    echo "  fix         Mostrar instrucciones para arreglar errores"
    echo "  urls        Mostrar URLs para Google Cloud Console"
    echo "  help        Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 setup     # Configurar credenciales OAuth"
    echo "  $0 check     # Verificar configuración"
    echo "  $0 test      # Probar OAuth"
}

load_env() {
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error "Archivo .env no encontrado"
        log_info "Copia .env.example a .env y configura las variables"
        exit 1
    fi
    source "$PROJECT_ROOT/.env"
}

setup_oauth() {
    log_info "Configuración OAuth para Desarrollo"
    echo "=================================="
    echo ""
    echo "📋 PASOS EN GOOGLE CLOUD CONSOLE:"
    echo "1. Ve a: https://console.cloud.google.com/apis/credentials"
    echo "2. Crea/selecciona proyecto"
    echo "3. Habilita Google Identity API"
    echo "4. Crea OAuth 2.0 Client ID"
    echo ""
    
    show_urls
    
    echo ""
    log_info "Ingresa tus credenciales:"
    echo ""
    
    read -p "Google Client ID: " CLIENT_ID
    read -s -p "Google Client Secret: " CLIENT_SECRET
    echo ""
    
    if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
        log_error "Ambas credenciales son requeridas"
        exit 1
    fi
    
    # Crear backup
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup.$(date +%Y%m%d_%H%M%S)"
        log_success "Backup del .env creado"
    fi
    
    # Actualizar .env
    cd "$PROJECT_ROOT"
    sed -i.tmp "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env
    sed -i.tmp "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env
    rm .env.tmp 2>/dev/null || true
    
    log_success "Credenciales configuradas en .env"
    
    # Reiniciar API si está ejecutándose
    if docker ps | grep -q "wedding-api-dev"; then
        log_info "Reiniciando API para aplicar cambios..."
        docker restart wedding-api-dev
        sleep 3
        log_success "API reiniciado"
    fi
    
    echo ""
    log_success "OAuth configurado!"
    log_info "Prueba en: http://localhost:4321/rsvp/login"
}

check_oauth() {
    log_info "Verificando configuración OAuth"
    echo "==============================="
    
    load_env
    
    echo ""
    log_info "Configuración actual:"
    echo "FRONTEND_URL: $FRONTEND_URL"
    echo "API_URL: $API_URL"
    echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
    echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:10}..."
    
    if [ "$GOOGLE_CLIENT_SECRET" = "GOCSPX-your-google-client-secret" ]; then
        log_warning "GOOGLE_CLIENT_SECRET no está configurado"
        log_info "Ejecuta: $0 setup"
        return 1
    fi
    
    echo ""
    log_info "Verificando contenedores Docker..."
    
    if docker ps | grep -q "wedding-api-dev"; then
        log_success "API container está corriendo"
        API_RUNNING=true
    else
        log_error "API container no está corriendo"
        API_RUNNING=false
    fi
    
    if docker ps | grep -q "wedding-ui-dev"; then
        log_success "UI container está corriendo"
    else
        log_error "UI container no está corriendo"
    fi
    
    if [ "$API_RUNNING" = true ]; then
        echo ""
        log_info "Probando endpoints..."
        
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            log_success "Health check OK"
        else
            log_error "Health check falló"
        fi
        
        if curl -s http://localhost:3001/debug/oauth > /dev/null 2>&1; then
            log_success "OAuth debug endpoint OK"
        else
            log_error "OAuth debug endpoint falló"
        fi
    fi
    
    echo ""
    show_urls
}

test_oauth() {
    log_info "Probando OAuth en la aplicación"
    echo "==============================="
    
    # Verificar API
    if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log_error "API no está corriendo en puerto 3001"
        log_info "Ejecuta: docker compose up"
        exit 1
    fi
    
    # Verificar UI
    if ! curl -s http://localhost:4321 > /dev/null 2>&1; then
        log_error "Frontend no está corriendo en puerto 4321"
        exit 1
    fi
    
    log_success "Ambos servicios están corriendo"
    
    echo ""
    log_info "URLs para probar:"
    echo "🔗 Login: http://localhost:4321/rsvp/login"
    echo "🔗 Admin: http://localhost:4321/admin/login"
    echo "🔗 OAuth directo: http://localhost:3001/auth/google"
    
    echo ""
    log_info "Pasos para probar:"
    echo "1. Ve a http://localhost:4321/rsvp/login"
    echo "2. Haz clic en 'Continuar con Google'"
    echo "3. Si funciona: serás redirigido a Google y luego a /guest-dashboard"
    echo "4. Si falla: verás error 400 redirect_uri_mismatch"
    
    echo ""
    log_info "Si hay errores, ejecuta: $0 fix"
}

fix_oauth() {
    log_info "Solucionando errores OAuth"
    echo "=========================="
    
    load_env
    
    echo ""
    log_warning "Error común: redirect_uri_mismatch"
    echo ""
    echo "🌐 SOLUCIÓN: Configura estas URLs EXACTAS en Google Cloud Console"
    echo "================================================================"
    echo ""
    echo "1. Ve a: https://console.cloud.google.com/apis/credentials"
    echo "2. Busca tu OAuth 2.0 Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
    echo "3. Haz clic en el ícono de editar (lápiz)"
    echo ""
    
    show_urls
    
    echo ""
    log_warning "IMPORTANTE: Las URLs deben coincidir EXACTAMENTE"
    echo "- Sin espacios extra"
    echo "- Sin barras finales (/)"
    echo "- Usar http:// para desarrollo local"
    
    echo ""
    log_info "Después de configurar:"
    echo "1. Guarda los cambios en Google Cloud Console"
    echo "2. Espera 1-2 minutos para propagación"
    echo "3. Ejecuta: $0 test"
}

show_urls() {
    echo "📋 URLs para Google Cloud Console:"
    echo ""
    echo "Authorized JavaScript origins (una por línea):"
    echo "http://localhost:3001"
    echo "http://localhost:4321"
    echo "http://localhost"
    echo ""
    echo "Authorized redirect URIs (una por línea):"
    echo "http://localhost:3001/auth/google/callback"
}

main() {
    case "${1:-help}" in
        setup)
            setup_oauth
            ;;
        check)
            check_oauth
            ;;
        test)
            test_oauth
            ;;
        fix)
            fix_oauth
            ;;
        urls)
            show_urls
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Comando desconocido: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"