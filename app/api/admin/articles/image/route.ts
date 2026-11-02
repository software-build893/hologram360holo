import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ARTICLE_DIR } from "@/lib/db";

// Pictures placed inside an article body by the editor. Stored under data/articles/body/ and served
// publicly at /api/articles/img/<name>; the name is random, so it can be cached forever.
const MAX = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
export const BODY_IMAGE_DIR = path.join(ARTICLE_DIR, "body");

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose a picture." }, { status: 422 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Pictures must be JPG, PNG, WebP or GIF." }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: "Pictures must be under 8 MB." }, { status: 413 });
  await mkdir(BODY_IMAGE_DIR, { recursive: true });
  const stored = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  await pipeline(Readable.fromWeb(file.stream() as NodeReadableStream), createWriteStream(path.join(BODY_IMAGE_DIR, stored)));
  return NextResponse.json({ url: `/api/articles/img/${stored}` });
}
