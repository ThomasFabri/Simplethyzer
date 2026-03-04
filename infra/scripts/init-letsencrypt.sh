#!/usr/bin/env sh
set -eu

if [ $# -lt 2 ]; then
  echo "Usage: $0 <domain> <email>"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"
STAGING="${STAGING:-0}"

if [ ! -f compose.yaml ]; then
  echo "Run this script from the project root (where compose.yaml exists)."
  exit 1
fi

echo "Configuring nginx domain: ${DOMAIN}"
sed -i "s/synth.example.com/${DOMAIN}/g" infra/nginx/conf.d/app.conf

echo "Creating dummy certificate so nginx can boot..."
docker compose run --rm --entrypoint \
  "sh -c 'mkdir -p /etc/letsencrypt/live/${DOMAIN} && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /etc/letsencrypt/live/${DOMAIN}/privkey.pem -out /etc/letsencrypt/live/${DOMAIN}/fullchain.pem -subj /CN=localhost'" \
  certbot

echo "Starting nginx..."
docker compose up -d nginx

echo "Requesting real certificate from Let's Encrypt..."
STAGING_ARG=""
if [ "$STAGING" = "1" ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm --entrypoint \
  "certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${EMAIL} --rsa-key-size 4096 --agree-tos --non-interactive --force-renewal ${STAGING_ARG}" \
  certbot

echo "Reloading nginx with real certificate..."
docker compose exec nginx nginx -s reload

echo "Done. You can now start full stack with: docker compose up -d"
