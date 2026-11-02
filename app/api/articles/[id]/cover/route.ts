import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { articleById, ARTICLE_DIR } from "@/lib/db";

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

// An article's cover image. Public, since the article is; the file name changes on every re-upload,
// so the URL carries ?v=<updated_at> and can be cached hard.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const a = await articleById(Number(id));
  if (!a || !a.cover) return new NextResponse(null, { status: 404 });
  const file = path.join(ARTICLE_DIR, a.cover);
  let size = 0;
  try {
    size = statSync(file).size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "content-type": MIME[path.extname(a.cover)] ?? "application/octet-stream",
      "content-length": String(size),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
