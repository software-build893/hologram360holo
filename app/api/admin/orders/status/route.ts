import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setOrderStatus } from "@/lib/db";

// Status change from the dashboard's inline form (forms can only POST).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const id = Number(form.get("id"));
  const status = String(form.get("status"));
  if (!id || !["awaiting", "received", "done"].includes(status)) return NextResponse.json({ error: "bad request" }, { status: 422 });
  setOrderStatus(id, status as "awaiting" | "received" | "done");
  return NextResponse.redirect(new URL("/admin?tab=orders", req.url), 303);
}
