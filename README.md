
## Analytics dashboard and customer portal

- **`/admin`** — visitors (daily uniques, the billing basis), page views, quote requests, phone share, a per-day chart, referrers, a billing panel (visitors × rate, rate and currency editable) and a CSV export of the raw visits. Protected by `ADMIN_PASSWORD` (copy `.env.example` to `.env.local`). The session is a signed cookie; nothing else to configure.
- **`/admin?tab=orders`** — after a customer pays (outside the site), create an order; the dashboard shows its unique upload link to send them, and their files appear under the order with download links.
- **`/upload/<token>`** — the customer's page: order summary, three plain steps, drag-and-drop upload (logo / product / other, up to 12 files, 60 MB each), progress bar, confirmation. The token is the only credential, so links must stay private.

Storage is SQLite via Node's built-in driver, in `data/analytics.sqlite` (gitignored); uploads go to `data/uploads/<order id>/`. Visitor ids are a salted hash of day + IP + user agent, so one person counts once per day and nothing in the browser is stored. Back up `data/` with the deploy.
