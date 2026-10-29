import { NextResponse } from "next/server";
import { recordPageview } from "@/lib/db";
import { userAgent, visitorId } from "@/lib/visitor";

// Page-view beacon: one row per page load with a daily visitor id, the path, referrer and viewport width.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* an empty beacon still counts */
  }
  const path = String(body.path ?? "/").slice(0, 200);
  if (path.startsWith("/admin")) return new NextResponse(null, { status: 204 });
  recordPageview({
    vid: visitorId(req),
    path,
    referrer: String(body.referrer ?? "").slice(0, 300),
    width: Number(body.width) || null,
    ua: userAgent(req),
  });
  return new NextResponse(null, { status: 204 });
}
