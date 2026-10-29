import { NextResponse } from "next/server";
import { record } from "@/lib/store";
import { offers } from "@/lib/content";

const ids = new Set<string>(offers.map((o) => o.id));

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 120);
  const business = String(body.business ?? "").trim().slice(0, 160);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const notes = String(body.notes ?? "").trim().slice(0, 2000);
  const items = Array.isArray(body.items) ? body.items.filter((i): i is string => typeof i === "string" && ids.has(i)) : [];
  if (!name || !business || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || items.length === 0) {
    return NextResponse.json({ error: "incomplete" }, { status: 422 });
  }
  const total = offers.filter((o) => items.includes(o.id)).reduce((sum, o) => sum + o.price, 0);
  await record("quote", { name, business, email, notes, items, total, ua: req.headers.get("user-agent") ?? "" });
  return NextResponse.json({ ok: true, total });
}
