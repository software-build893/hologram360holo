import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ARTICLE_DIR, articleById, articleBySlug, createArticle, deleteArticle, updateArticle } from "@/lib/db";
import { redirectTo } from "@/lib/http";
import { sanitizeArticleHtml, slugify } from "@/lib/article";

// One form endpoint for the article editor: create, save, publish, unpublish and delete,
// chosen by the submit button's `action` value. Cover images are stored under data/articles/.
const COVER_MAX = 8 * 1024 * 1024;
const COVER_TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const action = String(form.get("action") ?? "save");
  const id = Number(form.get("id")) || 0;
  const existing = id ? await articleById(id) : null;
  if (id && !existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (action === "delete") {
    if (!existing) return redirectTo(req, "/admin?tab=articles");
    await deleteArticle(existing.id);
    if (existing.cover) await unlink(path.join(ARTICLE_DIR, existing.cover)).catch(() => {});
    return redirectTo(req, "/admin?tab=articles&deleted=1");
  }

  const title = String(form.get("title") ?? "").trim().slice(0, 160);
  const summary = String(form.get("summary") ?? "").trim().slice(0, 400);
  const body = sanitizeArticleHtml(String(form.get("body") ?? "").slice(0, 400_000));
  const coverAlt = String(form.get("cover_alt") ?? "").trim().slice(0, 200);
  let slug = slugify(String(form.get("slug") ?? "")) || slugify(title);
  const back = existing ? `/admin/articles/${existing.id}` : "/admin/articles/new";
  if (!title) return redirectTo(req, `${back}?error=${encodeURIComponent("A title is required.")}`);
  if (!slug) return redirectTo(req, `${back}?error=${encodeURIComponent("The address needs at least one letter or digit.")}`);
  const clash = await articleBySlug(slug);
  if (clash && clash.id !== id) {
    // another article already lives at that address: suffix a counter rather than failing the save
    let n = 2;
    while (await articleBySlug(`${slug}-${n}`)) n += 1;
    slug = `${slug}-${n}`;
  }

  const status: "draft" | "published" = action === "publish" ? "published" : action === "unpublish" ? "draft" : existing?.status ?? "draft";

  let cover = existing?.cover ?? "";
  if (form.get("remove_cover") === "1" && cover) {
    await unlink(path.join(ARTICLE_DIR, cover)).catch(() => {});
    cover = "";
  }
  const file = form.get("cover");
  if (file instanceof File && file.size > 0) {
    const ext = COVER_TYPES[file.type];
    if (!ext) return redirectTo(req, `${back}?error=${encodeURIComponent("The cover must be a JPG, PNG or WebP image.")}`);
    if (file.size > COVER_MAX) return redirectTo(req, `${back}?error=${encodeURIComponent("The cover must be under 8 MB.")}`);
    await mkdir(ARTICLE_DIR, { recursive: true });
    const stored = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
    await pipeline(Readable.fromWeb(file.stream() as NodeReadableStream), createWriteStream(path.join(ARTICLE_DIR, stored)));
    if (cover) await unlink(path.join(ARTICLE_DIR, cover)).catch(() => {});
    cover = stored;
  }

  const input = { slug, title, summary, body, cover, cover_alt: coverAlt, status };
  const saved = existing ? (await updateArticle(existing.id, input))! : await createArticle(input);
  return redirectTo(req, `/admin/articles/${saved.id}?saved=${status}`);
}
