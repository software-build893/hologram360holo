// One-off import of the SQLite store that ran before PostgreSQL, keeping every id.
//   docker compose exec web node scripts/migrate-sqlite.mjs            (reads /app/data/analytics.sqlite)
//   DATABASE_URL=... node scripts/migrate-sqlite.mjs path/to/analytics.sqlite
// Safe to re-run: rows whose id already exists are skipped.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Pool } = require("pg");

const file = process.argv[2] ?? path.join(process.env.DATA_DIR ?? "data", "analytics.sqlite");
if (!existsSync(file)) {
  console.log(`no SQLite file at ${file}; nothing to import`);
  process.exit(0);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sqlite = new DatabaseSync(file, { readOnly: true });
const pg = new Pool({ connectionString: process.env.DATABASE_URL });
const tables = sqlite.prepare("select name from sqlite_master where type = 'table'").all().map((r) => r.name);
const has = (t) => tables.includes(t);

// the same schema the app applies on its first query
await pg.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

async function copy(table, columns, map = (r) => r, idSeq = true) {
  if (!has(table)) return console.log(`${table}: not in SQLite, skipped`);
  const rows = sqlite.prepare(`select * from ${table}`).all();
  let n = 0;
  for (const raw of rows) {
    const r = map(raw);
    const cols = columns.filter((c) => c in r);
    const res = await pg.query(
      `insert into ${table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) on conflict do nothing`,
      cols.map((c) => r[c]),
    );
    n += res.rowCount;
  }
  if (idSeq && rows.length) {
    await pg.query(`select setval(pg_get_serial_sequence('${table}', 'id'), (select coalesce(max(id), 1) from ${table}))`);
  }
  console.log(`${table}: ${n} of ${rows.length} rows imported`);
}

await copy("events", ["id", "at", "day", "vid", "path", "referrer", "width", "ua"]);
await copy("quotes", ["id", "at", "day", "vid", "name", "business", "email", "notes", "items", "total", "ua"]);
await copy("settings", ["key", "value"], (r) => r, false);
await copy("orders", ["id", "token", "created_at", "business", "name", "email", "items", "note", "status"]);
await copy("uploads", ["id", "order_id", "at", "kind", "filename", "stored", "size", "mime", "note"]);
await copy("articles", ["id", "slug", "title", "summary", "body", "cover", "cover_alt", "status", "created_at", "updated_at", "published_at"]);

await pg.end();
sqlite.close();
console.log("done");
