import { NextResponse } from "next/server";
import { record } from "@/lib/store";

// Page-view beacon: no cookies, no identifiers, just a line per visit with the path and referrer.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* an empty beacon still counts */
  }
  await record("pageview", {
    path: String(body.path ?? "/").slice(0, 200),
    referrer: String(body.referrer ?? "").slice(0, 300),
    width: Number(body.width) || null,
  });
  return new NextResponse(null, { status: 204 });
}
