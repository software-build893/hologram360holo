import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/db";

// Billing settings: the rate the client is charged per daily visitor, and the currency symbol shown.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const rate = Number(form.get("rate"));
  const currency = String(form.get("currency") ?? "$").trim().slice(0, 4) || "$";
  const back = String(form.get("back") ?? "/admin");
  if (!Number.isFinite(rate) || rate < 0) return NextResponse.json({ error: "rate must be a number" }, { status: 422 });
  setSetting("rate_per_visitor", String(rate));
  setSetting("currency", currency);
  return NextResponse.redirect(new URL(back.startsWith("/admin") ? back : "/admin", req.url), 303);
}
