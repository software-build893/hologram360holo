import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { addUpload, orderByToken, UPLOAD_DIR } from "@/lib/db";

// The customer's upload endpoint: the unique link is the only credential, so the token must match an order.
const MAX_BYTES = 60 * 1024 * 1024; // 60 MB per file, enough for a layered logo or a short product clip
const MAX_FILES = 12;
const ALLOWED = new Set([
  "image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "image/heic", "image/tiff",
  "application/pdf", "application/postscript", "application/illustrator", "application/zip",
  "video/mp4", "video/quicktime", "video/webm", "application/octet-stream",
]);
const KINDS = new Set(["logo", "product", "other"]);

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const order = orderByToken(token);
  if (!order) return NextResponse.json({ error: "This link is not valid." }, { status: 404 });
  if (order.status === "done") return NextResponse.json({ error: "This order is complete; write to us if you need to send more." }, { status: 409 });

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "other");
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "Choose at least one file." }, { status: 422 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Up to ${MAX_FILES} files at a time.` }, { status: 422 });

  const dir = path.join(UPLOAD_DIR, String(order.id));
  await mkdir(dir, { recursive: true });
  const saved = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: `${file.name} is over 60 MB.` }, { status: 413 });
    const mime = file.type || "application/octet-stream";
    if (!ALLOWED.has(mime)) return NextResponse.json({ error: `${file.name}: ${mime} is not a file type we can use. Send PNG, SVG, PDF, AI, JPG, ZIP or MP4.` }, { status: 415 });
    const ext = path.extname(file.name).toLowerCase().slice(0, 10) || "";
    const stored = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
    await writeFile(path.join(dir, stored), Buffer.from(await file.arrayBuffer()));
    saved.push(addUpload({ order_id: order.id, kind: KINDS.has(kind) ? kind : "other", filename: file.name.slice(0, 200), stored, size: file.size, mime, note }));
  }
  return NextResponse.json({ ok: true, files: saved.map((u) => ({ id: u.id, filename: u.filename, size: u.size, kind: u.kind })) });
}
