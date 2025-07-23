#!/bin/bash

# Script simplificado para configurar OAuth en desarrollo
echo "🔐 Configuración OAuth para Desarrollo Local"
echo "============================================"
echo ""
echo "📋 PASOS EN GOOGLE CLOUD CONSOLE:"
echo "1. Ve a: https://console.cloud.google.com/"
echo "2. Crea/selecciona proyecto"
echo "3. Habilita Google Identity API"
echo "4. Crea OAuth 2.0 Client ID con estas configuraciones:"
echo ""
echo "   Name: Wedding App - Development"
echo ""
echo "   Authorized JavaScript origins:"
echo "   - http://localhost:3001"
echo "   - http://localhost:4321"
echo ""
echo "   Authorized redirect URIs:"
echo "   - http://localhost:3001/auth/google/callback"
echo ""
echo "🔑 INGRESA TUS CREDENCIALES:"
echo ""

read -p "Google Client ID: " CLIENT_ID
read -s -p "Google Client Secret: " CLIENT_SECRET
echo ""

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Ambas credenciales son requeridas"
    exit 1
fi

# Crear backup
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup del .env creado"
fi

# Actualizar .env
sed -i.tmp "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env
sed -i.tmp "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env
rm .env.tmp 2>/dev/null || true

echo "✅ Credenciales configuradas"

# Reiniciar API si está ejecutándose
if docker-compose ps | grep -q "wedding-api.*Up"; then
    echo "🔄 Reiniciando API..."
    docker-compose restart api
    sleep 3
    echo "✅ API reiniciado"
fi

echo ""
echo "🎉 OAuth configurado para desarrollo!"
echo "Prueba en: http://localhost/rsvp/login"