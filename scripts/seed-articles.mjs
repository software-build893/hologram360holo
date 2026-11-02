// Publishes the launch articles (scripts/articles.mjs) that are not in the database yet, with their covers
// copied from public/assets/articles/ into the data directory. Runs on every deploy and is a no-op afterwards:
//   docker compose exec web node scripts/seed-articles.mjs
//   DATABASE_URL=... node scripts/seed-articles.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { articles } from "./articles.mjs";

const require = createRequire(import.meta.url);
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const articleDir = path.join(dataDir, "articles");
const coverSrc = path.join(process.cwd(), "public", "assets", "articles");

const pg = new Pool({ connectionString: process.env.DATABASE_URL });
await pg.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
mkdirSync(articleDir, { recursive: true });

let added = 0;
for (const [i, a] of articles.entries()) {
  const exists = await pg.query("select 1 from articles where slug = $1", [a.slug]);
  if (exists.rowCount) continue;
  let cover = "";
  const src = path.join(coverSrc, a.cover);
  if (existsSync(src)) {
    cover = `seed-${a.cover}`;
    copyFileSync(src, path.join(articleDir, cover));
  } else {
    console.warn(`${a.slug}: cover ${a.cover} not found, publishing without one`);
  }
  // spread the launch set over the past week so the list reads as a sequence, oldest first in the array
  const daysAgo = articles.length - 1 - i;
  await pg.query(
    `insert into articles (slug, title, summary, body, cover, cover_alt, status, created_at, updated_at, published_at)
     values ($1, $2, $3, $4, $5, $6, 'published', now() - ($7 || ' days')::interval, now() - ($7 || ' days')::interval, now() - ($7 || ' days')::interval)`,
    [a.slug, a.title, a.summary, a.body.trim(), cover, a.cover_alt, String(daysAgo)],
  );
  added += 1;
  console.log(`published ${a.slug}`);
}
await pg.end();
console.log(added ? `${added} article(s) added` : "all launch articles already present");
