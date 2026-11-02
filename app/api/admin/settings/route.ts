import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/db";

// Billing settings: the rate the client is charged per daily visitor, and the currency symbol shown.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData();
  const rate = Number(form.get("rate"));
  const currency = String(form.get("currency") ?? "$").trim().slice(0, 4) || "$";
  const back = String(form.get("back") ?? "/admin");
  if (!Number.isFinite(rate) || rate < 0) return NextResponse.json({ error: "rate must be a number" }, { status: 422 });
  await setSetting("rate_per_visitor", String(rate));
  await setSetting("currency", currency);
  return redirectTo(req, back.startsWith("/admin") ? back : "/admin");
}
