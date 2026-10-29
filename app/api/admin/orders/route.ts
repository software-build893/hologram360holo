import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { redirectTo } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { createOrder, setOrderStatus } from "@/lib/db";
import { offers } from "@/lib/content";

const ids = new Set<string>(offers.map((o) => o.id));

// Create a paid order; the response redirects back to the dashboard where its unique link is shown.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const business = String(form.get("business") ?? "").trim().slice(0, 160);
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const items = form.getAll("items").map(String).filter((i) => ids.has(i));
  if (!business || !name) {
    return redirectTo(req, "/admin?tab=orders&error=business+and+contact+name+are+required");
  }
  const token = randomBytes(18).toString("base64url");
  const order = createOrder({ token, business, name, email, items: items.length ? items : ["content"], note });
  return redirectTo(req, `/admin?tab=orders&created=${order.id}`);
}
