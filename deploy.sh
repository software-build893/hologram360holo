#!/usr/bin/env bash
# Build and deploy the Next.js site to the VPS behind hologram-alt.afdillah.com.
#   ./deploy.sh            # build + upload + restart the service
#   SKIP_BUILD=1 ./deploy.sh
# Needs: ssh access as mac@100.81.148.15 (Tailscale) with passwordless sudo there,
# and the one-time server setup in README.md (Node 22 in /opt/node22, the systemd unit, nginx vhost).
set -euo pipefail
cd "$(dirname "$0")"

HOST="${DEPLOY_HOST:-mac@100.81.148.15}"
SITE="${SITE:-hologram-alt.afdillah.com}"
APP="/var/www/$SITE"

if [ -z "${SKIP_BUILD:-}" ]; then
  npm run build
fi

# standalone output needs the static chunks and public/ beside server.js
rm -rf .deploy && mkdir -p .deploy
cp -R .next/standalone/. .deploy/
mkdir -p .deploy/.next/static && cp -R .next/static/. .deploy/.next/static/
mkdir -p .deploy/public && cp -R public/. .deploy/public/

echo "→ uploading to $HOST:~/$SITE.new"
rsync -az --delete .deploy/ "$HOST:~/$SITE.new/"

echo "→ swapping into $APP and restarting"
ssh "$HOST" "set -e
  sudo mkdir -p $APP/data
  sudo rm -rf $APP.prev
  if [ -d $APP/app ]; then sudo mv $APP/app $APP.prev; fi
  sudo mv ~/$SITE.new $APP/app
  sudo chown -R mac:mac $APP
  sudo systemctl restart hologram-alt
  sleep 2
  sudo systemctl is-active hologram-alt
  curl -s -o /dev/null -w 'local %{http_code}\n' http://127.0.0.1:3101/"

echo "✓ deployed https://$SITE"
