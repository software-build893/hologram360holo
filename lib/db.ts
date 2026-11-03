import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, types } from "pg";

// First-party store on PostgreSQL: visits, quote requests, settings, paid orders with their uploads, and articles.
// The database runs in the `db` container next to the site (see compose.yaml); DATABASE_URL points at it.
// Files that belong to rows (customer uploads, article covers) live under DATA_DIR, which is a bind mount.
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const ARTICLE_DIR = path.join(DATA_DIR, "articles");

// timestamps come back as ISO strings and dates as YYYY-MM-DD, the shapes the pages already format
types.setTypeParser(types.builtins.TIMESTAMPTZ, (v) => new Date(v).toISOString());
types.setTypeParser(types.builtins.DATE, (v) => v);
types.setTypeParser(types.builtins.INT8, (v) => Number(v));

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  pool = new Pool({ connectionString: url, max: 8 });
  return pool;
}

/** The schema (scripts/schema.sql) is applied on first use, so a fresh database needs no separate migration step. */
function ensureSchema(): Promise<void> {
  if (ready) return ready;
  ready = getPool()
    .query(readFileSync(path.join(process.cwd(), "scripts", "schema.sql"), "utf8"))
    .then(() => undefined)
    .catch((e) => {
      ready = null; // let the next call retry, e.g. while the db container is still starting
      throw e;
    });
  return ready;
}

async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

const today = () => new Date().toISOString().slice(0, 10);

export type PageviewInput = { vid: string; path: string; referrer: string; width: number | null; ua: string };
export type QuoteInput = { vid: string; name: string; business: string; email: string; notes: string; items: string[]; total: number; ua: string };

export async function recordPageview(e: PageviewInput) {
  await q("insert into events (at, day, vid, path, referrer, width, ua) values (now(), $1, $2, $3, $4, $5, $6)", [today(), e.vid, e.path, e.referrer, e.width, e.ua]);
}

export async function recordQuote(r: QuoteInput) {
  await q("insert into quotes (at, day, vid, name, business, email, notes, items, total, ua) values (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9)", [
    today(), r.vid, r.name, r.business, r.email, r.notes, JSON.stringify(r.items), r.total, r.ua,
  ]);
}

// ---------- settings ----------

export async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await one<{ value: string }>("select value from settings where key = $1", [key]);
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  await q("insert into settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value", [key, value]);
}

// ---------- reads for the dashboard ----------

export type DayRow = { day: string; visitors: number; pageviews: number; quotes: number };

/** Per-day counts, inclusive of both ends; days with no traffic are filled with zeros. */
export async function dailySeries(from: string, to: string): Promise<DayRow[]> {
  const views = await q<{ day: string; pageviews: number; visitors: number }>(
    "select day, count(*)::int as pageviews, count(distinct vid)::int as visitors from events where day between $1 and $2 group by day",
    [from, to],
  );
  const quotes = await q<{ day: string; n: number }>("select day, count(*)::int as n from quotes where day between $1 and $2 group by day", [from, to]);
  const byDay = new Map<string, DayRow>();
  for (let t = Date.parse(from + "T00:00:00Z"); t <= Date.parse(to + "T00:00:00Z"); t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    byDay.set(day, { day, visitors: 0, pageviews: 0, quotes: 0 });
  }
  for (const v of views) {
    const row = byDay.get(v.day);
    if (row) {
      row.pageviews = v.pageviews;
      row.visitors = v.visitors;
    }
  }
  for (const r of quotes) {
    const row = byDay.get(r.day);
    if (row) row.quotes = r.n;
  }
  return [...byDay.values()];
}

export type Totals = { visitors: number; pageviews: number; quotes: number; desktop: number; phone: number };

/** Range totals. Visitors are daily uniques summed across days: one person counts once per day they visit. */
export async function totals(from: string, to: string): Promise<Totals> {
  const v = await one<{ visitors: number; pageviews: number }>(
    "select count(distinct (day, vid))::int as visitors, count(*)::int as pageviews from events where day between $1 and $2",
    [from, to],
  );
  const quotes = await one<{ n: number }>("select count(*)::int as n from quotes where day between $1 and $2", [from, to]);
  // each daily visitor counts once, as a phone when their widest window that day was under 768 px
  const devices = await one<{ desktop: number; phone: number }>(
    `select count(*) filter (where w >= 768)::int as desktop, count(*) filter (where w < 768)::int as phone
     from (select max(width) as w from events where day between $1 and $2 and width is not null group by day, vid) v`,
    [from, to],
  );
  return {
    visitors: v?.visitors ?? 0,
    pageviews: v?.pageviews ?? 0,
    quotes: quotes?.n ?? 0,
    desktop: devices?.desktop ?? 0,
    phone: devices?.phone ?? 0,
  };
}

export type QuoteRow = { id: number; at: string; name: string; business: string; email: string; notes: string; items: string[]; total: number };

export async function quotesList(from: string, to: string, limit = 200): Promise<QuoteRow[]> {
  return q<QuoteRow>("select id, at, name, business, email, notes, items, total from quotes where day between $1 and $2 order by at desc limit $3", [from, to, limit]);
}

export type QuoteSummary = { count: number; value: number; average: number; ordered: number; items: Record<string, number> };

/** Quote requests in a date range: how many, what they add up to, how many became orders, and how often each item was picked. */
export async function quoteSummary(from: string, to: string): Promise<QuoteSummary> {
  const t = await one<{ count: number; value: number; ordered: number }>(
    `select count(*)::int as count, coalesce(sum(total), 0)::int as value,
            count(*) filter (where exists (select 1 from orders o where o.quote_id = quotes.id))::int as ordered
     from quotes where day between $1 and $2`,
    [from, to],
  );
  const picks = await q<{ item: string; n: number }>(
    "select item, count(*)::int as n from quotes, jsonb_array_elements_text(items) as item where day between $1 and $2 group by item",
    [from, to],
  );
  const count = t?.count ?? 0;
  const value = t?.value ?? 0;
  return { count, value, average: count ? value / count : 0, ordered: t?.ordered ?? 0, items: Object.fromEntries(picks.map((r) => [r.item, r.n])) };
}

export async function topReferrers(from: string, to: string, limit = 8): Promise<{ referrer: string; visitors: number }[]> {
  return q(
    `select case when referrer = '' then '(direct)' else referrer end as referrer, count(distinct (day, vid))::int as visitors
     from events where day between $1 and $2 group by 1 order by visitors desc limit $3`,
    [from, to, limit],
  );
}

export async function eventsCsv(from: string, to: string): Promise<string> {
  const rows = await q<{ at: string; day: string; vid: string; path: string; referrer: string; width: number | null }>(
    "select at, day, vid, path, referrer, width from events where day between $1 and $2 order by at",
    [from, to],
  );
  // a leading = + - @ tab or CR would run as a formula in Excel/Sheets; the apostrophe makes it plain text
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  return ["at,day,visitor,path,referrer,width", ...rows.map((r) => [r.at, r.day, r.vid, r.path, r.referrer, r.width ?? ""].map(esc).join(","))].join("\n");
}

// ---------- orders and uploads (customer portal) ----------

export type Order = { id: number; token: string; created_at: string; business: string; name: string; email: string; items: string[]; note: string; status: "awaiting" | "received" | "done"; quote_id: number | null };
export type Upload = { id: number; order_id: number; at: string; kind: string; filename: string; stored: string; size: number; mime: string; note: string };

export async function createOrder(o: { token: string; business: string; name: string; email: string; items: string[]; note: string; quoteId?: number | null }): Promise<Order> {
  const row = await one<Order>(
    "insert into orders (token, created_at, business, name, email, items, note, quote_id) values ($1, now(), $2, $3, $4, $5, $6, $7) returning *",
    [o.token, o.business, o.name, o.email, JSON.stringify(o.items), o.note, o.quoteId ?? null],
  );
  return row!;
}

/** A quote request with the order made from it, if any; for the Orders tab. */
export type QuoteForOrders = QuoteRow & { order_id: number | null };

/** The latest quote requests regardless of the dashboard's date range, newest first. */
export async function quotesForOrders(limit = 50): Promise<QuoteForOrders[]> {
  return q<QuoteForOrders>(
    `select qu.id, qu.at, qu.name, qu.business, qu.email, qu.notes, qu.items, qu.total,
            (select o.id from orders o where o.quote_id = qu.id order by o.created_at limit 1) as order_id
     from quotes qu order by qu.at desc limit $1`,
    [limit],
  );
}

export async function quoteById(id: number): Promise<QuoteRow | null> {
  return one<QuoteRow>("select id, at, name, business, email, notes, items, total from quotes where id = $1", [id]);
}

export async function orderById(id: number): Promise<Order | null> {
  return one<Order>("select * from orders where id = $1", [id]);
}

export async function orderByToken(token: string): Promise<Order | null> {
  return one<Order>("select * from orders where token = $1", [token]);
}

export async function ordersList(limit = 100): Promise<Order[]> {
  return q<Order>("select * from orders order by created_at desc limit $1", [limit]);
}

export async function setOrderStatus(id: number, status: Order["status"]) {
  await q("update orders set status = $1 where id = $2", [status, id]);
}

export async function addUpload(u: Omit<Upload, "id" | "at">): Promise<Upload> {
  const row = await one<Upload>(
    "insert into uploads (order_id, at, kind, filename, stored, size, mime, note) values ($1, now(), $2, $3, $4, $5, $6, $7) returning *",
    [u.order_id, u.kind, u.filename, u.stored, u.size, u.mime, u.note],
  );
  await q("update orders set status = 'received' where id = $1 and status = 'awaiting'", [u.order_id]);
  return row!;
}

export async function uploadsForOrder(orderId: number): Promise<Upload[]> {
  return q<Upload>("select * from uploads where order_id = $1 order by at", [orderId]);
}

export async function uploadedBytes(orderId: number): Promise<number> {
  const r = await one<{ total: number }>("select coalesce(sum(size), 0)::bigint as total from uploads where order_id = $1", [orderId]);
  return r?.total ?? 0;
}

export async function uploadById(id: number): Promise<Upload | null> {
  return one<Upload>("select * from uploads where id = $1", [id]);
}

export async function uploadsByOrder(): Promise<Map<number, Upload[]>> {
  const rows = await q<Upload>("select * from uploads order by at");
  const m = new Map<number, Upload[]>();
  for (const u of rows) m.set(u.order_id, [...(m.get(u.order_id) ?? []), u]);
  return m;
}

// ---------- articles ----------

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  cover: string;
  cover_alt: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
export type ArticleInput = Pick<Article, "slug" | "title" | "summary" | "body" | "cover" | "cover_alt" | "status">;

export async function createArticle(a: ArticleInput): Promise<Article> {
  const row = await one<Article>(
    `insert into articles (slug, title, summary, body, cover, cover_alt, status, created_at, updated_at, published_at)
     values ($1, $2, $3, $4, $5, $6, $7, now(), now(), case when $7 = 'published' then now() end) returning *`,
    [a.slug, a.title, a.summary, a.body, a.cover, a.cover_alt, a.status],
  );
  return row!;
}

export async function updateArticle(id: number, a: ArticleInput): Promise<Article | null> {
  return one<Article>(
    `update articles set slug = $1, title = $2, summary = $3, body = $4, cover = $5, cover_alt = $6, status = $7, updated_at = now(),
       published_at = case when $7 = 'published' then coalesce(published_at, now()) else published_at end
     where id = $8 returning *`,
    [a.slug, a.title, a.summary, a.body, a.cover, a.cover_alt, a.status, id],
  );
}

export async function deleteArticle(id: number) {
  await q("delete from articles where id = $1", [id]);
}

export async function articleById(id: number): Promise<Article | null> {
  if (!Number.isInteger(id)) return null;
  return one<Article>("select * from articles where id = $1", [id]);
}

export async function articleBySlug(slug: string): Promise<Article | null> {
  return one<Article>("select * from articles where slug = $1", [slug]);
}

/** Every article, newest change first, for the dashboard. */
export async function articlesList(): Promise<Article[]> {
  return q<Article>("select * from articles order by updated_at desc");
}

/** Published articles, newest first, for the public list and the sitemap. */
export async function publishedArticles(): Promise<Article[]> {
  return q<Article>("select * from articles where status = 'published' order by published_at desc");
}

/** Page views per article path, all time, keyed by slug. */
export async function articleViews(): Promise<Map<string, { views: number; visitors: number }>> {
  const rows = await q<{ slug: string; views: number; visitors: number }>(
    "select substr(path, 11) as slug, count(*)::int as views, count(distinct (day, vid))::int as visitors from events where path like '/articles/%' group by path",
  );
  return new Map(rows.map((r) => [r.slug, { views: r.views, visitors: r.visitors }]));
}

// ---------- admins (dashboard sign-in) ----------

export type Admin = { id: number; email: string; name: string; password_hash: string; created_at: string; last_login_at: string | null };

export async function countAdmins(): Promise<number> {
  const r = await one<{ n: number }>("select count(*)::int as n from admins");
  return r?.n ?? 0;
}

export async function adminByEmail(email: string): Promise<Admin | null> {
  return one<Admin>("select * from admins where email = $1", [email]);
}

export async function adminById(id: number): Promise<Admin | null> {
  return one<Admin>("select * from admins where id = $1", [id]);
}

export async function adminsList(): Promise<Admin[]> {
  return q<Admin>("select * from admins order by created_at");
}

export async function createAdmin(a: { email: string; name: string; password_hash: string }): Promise<Admin> {
  const row = await one<Admin>("insert into admins (email, name, password_hash) values ($1, $2, $3) returning *", [a.email, a.name, a.password_hash]);
  return row!;
}

export async function setAdminPassword(id: number, password_hash: string) {
  await q("update admins set password_hash = $1 where id = $2", [password_hash, id]);
}

export async function setAdminEmail(id: number, email: string, name: string) {
  await q("update admins set email = $1, name = $2 where id = $3", [email, name, id]);
}

export async function deleteAdmin(id: number) {
  await q("delete from admins where id = $1", [id]);
}

export async function touchAdminLogin(id: number) {
  await q("update admins set last_login_at = now() where id = $1", [id]);
}
