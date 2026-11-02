import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { ARTICLE_DIR } from "@/lib/db";

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
const NAME = /^\d+-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

// A picture inside an article body (see /api/admin/articles/image). Names are generated, never user text.
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!NAME.test(name)) return new NextResponse(null, { status: 404 });
  const file = path.join(ARTICLE_DIR, "body", name);
  let size = 0;
  try {
    size = statSync(file).size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "content-type": MIME[path.extname(name)] ?? "application/octet-stream",
      "content-length": String(size),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
