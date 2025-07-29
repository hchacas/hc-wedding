#!/bin/bash

# SSL Setup Script for Digital Ocean Droplet
# This script helps set up Let's Encrypt SSL certificates

set -e

DOMAIN="sheilayhabib.com"
WWW_DOMAIN="www.sheilayhabib.com"
SSL_DIR="./nginx/ssl"

echo "🔒 SSL Setup for $DOMAIN"
echo "================================"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt update
    apt install -y certbot
fi

# Stop any running containers
echo "🛑 Stopping containers..."
docker compose --profile production down 2>/dev/null || true
docker compose down 2>/dev/null || true

# Generate certificate
echo "🔐 Generating SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --agree-tos \
    --no-eff-email \
    --email admin@$DOMAIN

# Copy certificates
echo "📋 Copying certificates..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/key.pem

# Fix permissions
echo "🔧 Setting permissions..."
chown root:root $SSL_DIR/cert.pem $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem
chmod 600 $SSL_DIR/key.pem

# Verify certificates
echo "✅ Verifying certificates..."
if openssl x509 -in $SSL_DIR/cert.pem -text -noout > /dev/null 2>&1; then
    echo "✅ Certificate is valid"
else
    echo "❌ Certificate validation failed"
    exit 1
fi

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && docker compose --profile production restart nginx-proxy") | crontab -

echo ""
echo "🎉 SSL setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with HTTPS URLs"
echo "2. Update Google OAuth redirect URIs to use HTTPS"
echo "3. Start production services:"
echo "   docker compose --profile production up -d --build"
echo ""
echo "Test your SSL:"
echo "   curl -I https://$DOMAIN"