import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";

// First-party event store on SQLite (Node's built-in driver, no native dependency).
// One database file under data/; the earlier JSON-lines files are imported once and renamed.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "analytics.sqlite");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    pragma journal_mode = wal;
    create table if not exists events (
      id integer primary key,
      at text not null,            -- ISO timestamp
      day text not null,           -- YYYY-MM-DD (UTC)
      vid text not null,           -- daily visitor id: hash of day + ip + user agent + secret
      path text not null,
      referrer text not null default '',
      width integer,
      ua text not null default ''
    );
    create index if not exists events_day on events(day);
    create index if not exists events_day_vid on events(day, vid);
    create table if not exists quotes (
      id integer primary key,
      at text not null,
      day text not null,
      vid text not null default '',
      name text not null,
      business text not null,
      email text not null,
      notes text not null default '',
      items text not null,         -- JSON array of offer ids
      total integer not null,
      ua text not null default ''
    );
    create index if not exists quotes_day on quotes(day);
    create table if not exists settings (
      key text primary key,
      value text not null
    );
    -- a paid order: the admin creates it after payment and sends the customer its unique upload link
    create table if not exists orders (
      id integer primary key,
      token text not null unique,  -- the unique link, 24 url-safe chars
      created_at text not null,
      business text not null,
      name text not null,
      email text not null,
      items text not null,         -- JSON array of offer ids
      note text not null default '',
      status text not null default 'awaiting'  -- awaiting | received | done
    );
    create table if not exists uploads (
      id integer primary key,
      order_id integer not null references orders(id),
      at text not null,
      kind text not null,          -- logo | product | other
      filename text not null,      -- the customer's file name
      stored text not null,        -- file name on disk under data/uploads/<order_id>/
      size integer not null,
      mime text not null default '',
      note text not null default ''
    );
    create index if not exists uploads_order on uploads(order_id);
  `);
  importLegacy(db);
  return db;
}

/** Pull in the JSON-lines files written before SQLite existed, then move them aside so this runs once. */
function importLegacy(d: DatabaseSync) {
  const pv = path.join(DATA_DIR, "pageview.jsonl");
  const q = path.join(DATA_DIR, "quote.jsonl");
  if (existsSync(pv)) {
    const ins = d.prepare("insert into events (at, day, vid, path, referrer, width, ua) values (?, ?, ?, ?, ?, ?, ?)");
    for (const line of readFileSync(pv, "utf8").split("\n").filter(Boolean)) {
      try {
        const e = JSON.parse(line);
        const at = String(e.at ?? new Date().toISOString());
        ins.run(at, at.slice(0, 10), "legacy", String(e.path ?? "/"), String(e.referrer ?? ""), e.width ?? null, "");
      } catch {
        /* skip a malformed line */
      }
    }
    renameSync(pv, pv + ".imported");
  }
  if (existsSync(q)) {
    const ins = d.prepare("insert into quotes (at, day, vid, name, business, email, notes, items, total, ua) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const line of readFileSync(q, "utf8").split("\n").filter(Boolean)) {
      try {
        const e = JSON.parse(line);
        const at = String(e.at ?? new Date().toISOString());
        ins.run(at, at.slice(0, 10), "legacy", String(e.name ?? ""), String(e.business ?? ""), String(e.email ?? ""), String(e.notes ?? ""), JSON.stringify(e.items ?? []), Number(e.total) || 0, String(e.ua ?? ""));
      } catch {
        /* skip */
      }
    }
    renameSync(q, q + ".imported");
  }
}

export type PageviewInput = { vid: string; path: string; referrer: string; width: number | null; ua: string };
export type QuoteInput = { vid: string; name: string; business: string; email: string; notes: string; items: string[]; total: number; ua: string };

export function recordPageview(e: PageviewInput) {
  const at = new Date().toISOString();
  getDb()
    .prepare("insert into events (at, day, vid, path, referrer, width, ua) values (?, ?, ?, ?, ?, ?, ?)")
    .run(at, at.slice(0, 10), e.vid, e.path, e.referrer, e.width, e.ua);
}

export function recordQuote(q: QuoteInput) {
  const at = new Date().toISOString();
  getDb()
    .prepare("insert into quotes (at, day, vid, name, business, email, notes, items, total, ua) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(at, at.slice(0, 10), q.vid, q.name, q.business, q.email, q.notes, JSON.stringify(q.items), q.total, q.ua);
}

// ---------- settings ----------

export function getSetting(key: string, fallback: string): string {
  const row = getDb().prepare("select value from settings where key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  getDb().prepare("insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value").run(key, value);
}

// ---------- reads for the dashboard ----------

export type DayRow = { day: string; visitors: number; pageviews: number; quotes: number };

/** Per-day counts, inclusive of both ends; days with no traffic are filled with zeros. */
export function dailySeries(from: string, to: string): DayRow[] {
  const d = getDb();
  const views = d
    .prepare("select day, count(*) as pageviews, count(distinct vid) as visitors from events where day between ? and ? group by day")
    .all(from, to) as { day: string; pageviews: number; visitors: number }[];
  const quotes = d.prepare("select day, count(*) as n from quotes where day between ? and ? group by day").all(from, to) as { day: string; n: number }[];
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
  for (const q of quotes) {
    const row = byDay.get(q.day);
    if (row) row.quotes = q.n;
  }
  return [...byDay.values()];
}

export type Totals = { visitors: number; pageviews: number; quotes: number; phoneShare: number };

/** Range totals. Visitors are daily uniques summed across days: one person counts once per day they visit. */
export function totals(from: string, to: string): Totals {
  const d = getDb();
  const v = d
    .prepare("select count(*) as pageviews, sum(c) as visitors from (select day, vid, count(*) as c from events where day between ? and ? group by day, vid)")
    .get(from, to) as { pageviews: number; visitors: number | null };
  // count(*) above counts (day, vid) pairs = daily unique visitors; pageviews need their own sum
  const pv = d.prepare("select count(*) as n from events where day between ? and ?").get(from, to) as { n: number };
  const q = d.prepare("select count(*) as n from quotes where day between ? and ?").get(from, to) as { n: number };
  const phone = d
    .prepare("select sum(case when width is not null and width < 768 then 1 else 0 end) as phone, count(*) as n from events where day between ? and ? and width is not null")
    .get(from, to) as { phone: number | null; n: number };
  return {
    visitors: v.pageviews ?? 0,
    pageviews: pv.n,
    quotes: q.n,
    phoneShare: phone.n ? (phone.phone ?? 0) / phone.n : 0,
  };
}

export type QuoteRow = { id: number; at: string; name: string; business: string; email: string; notes: string; items: string[]; total: number };

export function quotesList(from: string, to: string, limit = 200): QuoteRow[] {
  const rows = getDb()
    .prepare("select id, at, name, business, email, notes, items, total from quotes where day between ? and ? order by at desc limit ?")
    .all(from, to, limit) as (Omit<QuoteRow, "items"> & { items: string })[];
  return rows.map((r) => ({ ...r, items: JSON.parse(r.items) as string[] }));
}

export function topReferrers(from: string, to: string, limit = 8): { referrer: string; visitors: number }[] {
  return getDb()
    .prepare(
      `select case when referrer = '' then '(direct)' else referrer end as referrer, count(distinct day || vid) as visitors
       from events where day between ? and ? group by 1 order by visitors desc limit ?`,
    )
    .all(from, to, limit) as { referrer: string; visitors: number }[];
}

export function eventsCsv(from: string, to: string): string {
  const rows = getDb()
    .prepare("select at, day, vid, path, referrer, width from events where day between ? and ? order by at")
    .all(from, to) as { at: string; day: string; vid: string; path: string; referrer: string; width: number | null }[];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return ["at,day,visitor,path,referrer,width", ...rows.map((r) => [r.at, r.day, r.vid, r.path, r.referrer, r.width ?? ""].map(esc).join(","))].join("\n");
}

// ---------- orders and uploads (customer portal) ----------

export type Order = { id: number; token: string; created_at: string; business: string; name: string; email: string; items: string[]; note: string; status: "awaiting" | "received" | "done" };
export type Upload = { id: number; order_id: number; at: string; kind: string; filename: string; stored: string; size: number; mime: string; note: string };

function rowToOrder(r: Omit<Order, "items"> & { items: string }): Order {
  return { ...r, items: JSON.parse(r.items) as string[] };
}

export function createOrder(o: { token: string; business: string; name: string; email: string; items: string[]; note: string }): Order {
  const at = new Date().toISOString();
  const res = getDb()
    .prepare("insert into orders (token, created_at, business, name, email, items, note) values (?, ?, ?, ?, ?, ?, ?)")
    .run(o.token, at, o.business, o.name, o.email, JSON.stringify(o.items), o.note);
  return orderById(Number(res.lastInsertRowid))!;
}

export function orderById(id: number): Order | null {
  const r = getDb().prepare("select * from orders where id = ?").get(id) as (Omit<Order, "items"> & { items: string }) | undefined;
  return r ? rowToOrder(r) : null;
}

export function orderByToken(token: string): Order | null {
  const r = getDb().prepare("select * from orders where token = ?").get(token) as (Omit<Order, "items"> & { items: string }) | undefined;
  return r ? rowToOrder(r) : null;
}

export function ordersList(limit = 100): Order[] {
  const rows = getDb().prepare("select * from orders order by created_at desc limit ?").all(limit) as (Omit<Order, "items"> & { items: string })[];
  return rows.map(rowToOrder);
}

export function setOrderStatus(id: number, status: Order["status"]) {
  getDb().prepare("update orders set status = ? where id = ?").run(status, id);
}

export function addUpload(u: Omit<Upload, "id" | "at">): Upload {
  const at = new Date().toISOString();
  const res = getDb()
    .prepare("insert into uploads (order_id, at, kind, filename, stored, size, mime, note) values (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(u.order_id, at, u.kind, u.filename, u.stored, u.size, u.mime, u.note);
  getDb().prepare("update orders set status = 'received' where id = ? and status = 'awaiting'").run(u.order_id);
  return { id: Number(res.lastInsertRowid), at, ...u };
}

export function uploadsForOrder(orderId: number): Upload[] {
  return getDb().prepare("select * from uploads where order_id = ? order by at").all(orderId) as Upload[];
}

export function uploadById(id: number): Upload | null {
  return (getDb().prepare("select * from uploads where id = ?").get(id) as Upload | undefined) ?? null;
}

export function uploadsByOrder(): Map<number, Upload[]> {
  const rows = getDb().prepare("select * from uploads order by at").all() as Upload[];
  const m = new Map<number, Upload[]>();
  for (const u of rows) m.set(u.order_id, [...(m.get(u.order_id) ?? []), u]);
  return m;
}

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
