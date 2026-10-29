
## Analytics dashboard and customer portal

- **`/admin`** — visitors (daily uniques, the billing basis), page views, quote requests, phone share, a per-day chart, referrers, a billing panel (visitors × rate, rate and currency editable) and a CSV export of the raw visits. Protected by `ADMIN_PASSWORD` (copy `.env.example` to `.env.local`). The session is a signed cookie; nothing else to configure.
- **`/admin?tab=orders`** — after a customer pays (outside the site), create an order; the dashboard shows its unique upload link to send them, and their files appear under the order with download links.
- **`/upload/<token>`** — the customer's page: order summary, three plain steps, drag-and-drop upload (logo / product / other, up to 12 files, 60 MB each), progress bar, confirmation. The token is the only credential, so links must stay private.

Storage is SQLite via Node's built-in driver, in `data/analytics.sqlite` (gitignored); uploads go to `data/uploads/<order id>/`. Visitor ids are a salted hash of day + IP + user agent, so one person counts once per day and nothing in the browser is stored. Back up `data/` with the deploy.

## Deploy

The site runs as a Node process on the VPS (`mac@100.81.148.15` over Tailscale) behind nginx at **https://hologram-alt.afdillah.com**, Cloudflare in Full (strict) mode, Let's Encrypt via certbot webroot.

```bash
./deploy.sh
```

That builds (`output: "standalone"`), rsyncs `.next/standalone` + static + `public/` to `~/hologram-alt.afdillah.com.new`, swaps it into `/var/www/hologram-alt.afdillah.com/app` (previous build kept at `.prev`) and restarts the `hologram-alt` systemd service. `SKIP_BUILD=1 ./deploy.sh` reuses the last build.

One-time server setup (already done 2026-10-29): Node 22 in `/opt/node22` (the system Node 18 is untouched), `/etc/systemd/system/hologram-alt.service` (user `mac`, port 3101, `EnvironmentFile=/var/www/hologram-alt.afdillah.com/env`), nginx vhost `/etc/nginx/sites-available/hologram-alt.afdillah.com.conf` proxying to 127.0.0.1:3101 with `client_max_body_size 800m` for uploads. The env file holds `ADMIN_PASSWORD` (generated on the server; read it with `sudo cat /var/www/hologram-alt.afdillah.com/env`), `ADMIN_SECRET` and `DATA_DIR`. Analytics and uploads live in `/var/www/hologram-alt.afdillah.com/data`; back that directory up.

Logs: `sudo journalctl -u hologram-alt -f`.
