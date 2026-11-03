import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createOrder, quoteById } from "@/lib/db";
import { offers } from "@/lib/content";

const ids = new Set<string>(offers.map((o) => o.id));

// Create a paid order; the response redirects back to the dashboard where its unique link is shown.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData();
  const business = String(form.get("business") ?? "").trim().slice(0, 160);
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const items = form.getAll("items").map(String).filter((i) => ids.has(i));
  // an order made from a quote request remembers it, so the quote shows as converted
  const quoteRaw = Number(form.get("quote_id") ?? "");
  if (!business || !name) {
    const back = Number.isInteger(quoteRaw) && quoteRaw > 0 ? `&quote=${quoteRaw}` : "";
    return redirectTo(req, `/admin?tab=orders${back}&error=business+and+contact+name+are+required`);
  }
  const quote = Number.isInteger(quoteRaw) && quoteRaw > 0 ? await quoteById(quoteRaw) : null;
  const token = randomBytes(18).toString("base64url");
  const order = await createOrder({ token, business, name, email, items: items.length ? items : ["content"], note, quoteId: quote?.id ?? null });
  return redirectTo(req, `/admin?tab=orders&created=${order.id}`);
}
