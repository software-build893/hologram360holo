
## Analytics dashboard and customer portal

- **`/admin`** — visitors (daily uniques, the billing basis), page views, quote requests, phone share, a per-day chart, referrers, a billing panel (visitors × rate, rate and currency editable) and a CSV export of the raw visits. Sign in with an email and password. The first account is created from `ADMIN_EMAIL` + `ADMIN_PASSWORD` the first time someone signs in while no account exists; after that the **Account** tab manages your email, your password (scrypt-hashed in the `admins` table) and other admins. The session is a signed cookie bound to the password hash, so changing a password signs every device out; six wrong tries from one address lock sign-in for a minute.
- **`/admin?tab=orders`** — after a customer pays (outside the site), create an order; the dashboard shows its unique upload link to send them, and their files appear under the order with download links.
- **`/upload/<token>`** — the customer's page: order summary, three plain steps, drag-and-drop upload (logo / product / other, up to 12 files, 60 MB each), progress bar, confirmation. The token is the only credential, so links must stay private.

- **`/admin?tab=articles`** — the blog. "New article" opens an editor: title (the address follows it), summary, a rich-text body (headings, lists, quotes, links, pictures uploaded in place), a 16:9 cover (JPG/PNG/WebP, 8 MB). *Save draft* keeps it private, *Publish* puts it at `/articles/<slug>` and in the sitemap; a draft can still be previewed at its address while signed in. The list shows views and readers per article from the same event store as the billing numbers.
- **`/articles`** — the public list, newest first, and **`/articles/<slug>`** for each one; both counted as page views. Only signed-in admins write, but the HTML is reduced to the editor's own elements on save and on render anyway. `SITE_URL` in the environment sets the origin used in `sitemap.xml` and share images.

Storage is PostgreSQL (`pg`), one database with `events`, `quotes`, `settings`, `orders`, `uploads` and `articles`; the schema in `scripts/schema.sql` is applied with `create … if not exists` on the first query, so a fresh database needs no migration step. Files that belong to rows live on disk under `data/` (gitignored): uploads in `data/uploads/<order id>/`, article covers and body pictures in `data/articles/`. Visitor ids are a salted hash of day + IP + user agent, so one person counts once per day and nothing in the browser is stored. Back up the `pgdata` volume and `data/` together.

## Run it locally

```bash
docker compose up -d db
```

That starts PostgreSQL on `127.0.0.1:${DB_PORT:-5432}`; put the matching `DATABASE_URL` (and `ADMIN_PASSWORD`) in `.env.local`, `POSTGRES_PASSWORD` in `.env`, then `npm run dev`. `docker compose up -d --build` runs the whole stack in containers instead (web on `127.0.0.1:${WEB_PORT:-3101}`).

## Deploy

The site runs as two containers on the VPS (`mac@100.81.148.15` over Tailscale), built from `Dockerfile` and `compose.yaml`: `web` (this app, standalone Next build, port 3101 on the host loopback) and `db` (PostgreSQL 17, data in the `pgdata` volume). nginx terminates TLS at **https://hologram-alt.afdillah.com** (Let's Encrypt via certbot webroot, Cloudflare Full strict) and proxies to 3101.

```bash
./deploy.sh              # rsync the source, build the image on the server, roll the containers
MIGRATE=1 ./deploy.sh    # ...and import the pre-Docker SQLite store (keeps ids; safe to re-run)
```

One-time server setup: Docker + compose, `/var/www/hologram-alt.afdillah.com/.env` with `POSTGRES_PASSWORD`, `ADMIN_SECRET`, `SITE_URL`, and `ADMIN_EMAIL` + `ADMIN_PASSWORD` for the first account (generate the secrets with `openssl rand -base64 24`, keep the file mode 600), the nginx vhost from the previous setup, and the old `hologram-alt` systemd service stopped and disabled. `deploy.sh` links that `.env` and the `data/` directory into the synced source so compose finds them.

