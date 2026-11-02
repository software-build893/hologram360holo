#!/usr/bin/env bash
# Deploy the site to the VPS behind hologram-alt.afdillah.com as two containers: web (this app) and db (PostgreSQL).
#   ./deploy.sh                 # sync the source, build the image on the server, roll the containers
#   MIGRATE=1 ./deploy.sh       # ...then import the old SQLite store into Postgres (first Docker deploy)
# Needs: ssh as mac@100.81.148.15 (Tailscale) with passwordless sudo, Docker + compose on the server,
# and $APP/.env there with POSTGRES_PASSWORD, ADMIN_PASSWORD, ADMIN_SECRET (see README.md).
set -euo pipefail
cd "$(dirname "$0")"

HOST="${DEPLOY_HOST:-mac@100.81.148.15}"
SITE="${SITE:-hologram-alt.afdillah.com}"
APP="/var/www/$SITE"

echo "→ syncing source to $HOST:~/$SITE.src"
rsync -az --delete --exclude-from=.dockerignore --exclude='.env*' ./ "$HOST:~/$SITE.src/"

echo "→ building and starting on the server"
ssh "$HOST" "set -e
  sudo mkdir -p $APP/data
  sudo rsync -a --delete ~/$SITE.src/ $APP/src/
  test -f $APP/.env || { echo '!! $APP/.env is missing (POSTGRES_PASSWORD, ADMIN_PASSWORD, ADMIN_SECRET)'; exit 1; }
  sudo ln -sfn $APP/.env $APP/src/.env
  # compose mounts the data directory from this path rather than from inside the synced source
  sudo grep -q '^DATA_DIR_HOST=' $APP/.env || echo DATA_DIR_HOST=$APP/data | sudo tee -a $APP/.env >/dev/null
  # the web container runs as uid 1000 and writes uploads and covers here
  sudo chown -R 1000:1000 $APP/data
  # the pre-Docker systemd service held port 3101; harmless once it is gone
  sudo systemctl disable --now hologram-alt 2>/dev/null || true
  cd $APP/src
  sudo docker compose up -d --build --remove-orphans
  if [ -n '${MIGRATE:-}' ]; then
    sudo docker compose exec -T web node scripts/migrate-sqlite.mjs
  fi
  sudo docker image prune -f >/dev/null
  for i in 1 2 3 4 5 6 7 8 9 10; do
    code=\$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3101/ || true)
    [ \"\$code\" = 200 ] && break
    sleep 3
  done
  echo \"local \$code\"
  sudo docker compose ps --format '{{.Name}} {{.Status}}'"

echo "✓ deployed https://$SITE"
