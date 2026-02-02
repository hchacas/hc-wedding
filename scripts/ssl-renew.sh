#!/bin/bash
set -euo pipefail

DOMAIN="sheilayhabib.com"
SSL_DIR="/opt/hc-wedding/nginx/ssl"

echo "🔒 SSL Renew for $DOMAIN"
echo "================================"

mkdir -p "$SSL_DIR"

if ! command -v certbot &> /dev/null; then
  echo "📦 Installing certbot..."
  apt update
  apt install -y certbot
fi

echo "🛑 Stopping containers (free ports for standalone)..."
cd /opt/hc-wedding
docker compose -f docker-compose.prod.yml --profile production down || true

echo "🔁 Renewing certificates..."
certbot renew --standalone --quiet

echo "📋 Copying certificates..."
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"

echo "🔧 Setting permissions..."
chown root:root "$SSL_DIR/cert.pem" "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"
chmod 600 "$SSL_DIR/key.pem"

echo "🚀 Starting production stack..."
docker compose -f docker-compose.prod.yml --profile production up -d

echo "✅ Done."
