import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadById, UPLOAD_DIR } from "@/lib/db";

// Download a customer's upload (admin only).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const u = await uploadById(Number(id));
  if (!u) return NextResponse.json({ error: "not found" }, { status: 404 });
  const file = path.join(UPLOAD_DIR, String(u.order_id), u.stored);
  let size = 0;
  try {
    size = statSync(file).size;
  } catch {
    return NextResponse.json({ error: "file missing on disk" }, { status: 410 });
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "content-type": u.mime || "application/octet-stream",
      "content-length": String(size),
      "content-disposition": `attachment; filename="${u.filename.replace(/[^\x20-\x7e]|"/g, "_")}"; filename*=UTF-8''${encodeURIComponent(u.filename)}`,
    },
  });
}
