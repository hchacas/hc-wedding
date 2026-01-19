#!/bin/bash
set -e

DOMAIN="sheilayhabib.com"
WWW_DOMAIN="www.sheilayhabib.com"
SSL_DIR="/opt/hc-wedding/nginx/ssl"

echo "🔒 SSL Setup for $DOMAIN"
echo "================================"

mkdir -p $SSL_DIR

if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt update
    apt install -y certbot
fi

echo "🛑 Stopping containers..."
cd /opt/hc-wedding
docker compose -f docker-compose.prod.yml --profile production down || true

echo "🔐 Generating SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --agree-tos \
    --no-eff-email \
    --email admin@$DOMAIN

echo "📋 Copying certificates..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/key.pem

echo "🔧 Setting permissions..."
chown root:root $SSL_DIR/cert.pem $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem
chmod 600 $SSL_DIR/key.pem

echo "🔄 Restarting nginx-proxy..."
docker compose -f docker-compose.prod.yml --profile production up -d nginx-proxy

echo "🎉 SSL setup complete!"
