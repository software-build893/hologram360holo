import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, issueToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server" }, { status: 503 });
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&next=${encodeURIComponent(next)}`, req.url), 303);
  }
  const res = NextResponse.redirect(new URL(next.startsWith("/admin") ? next : "/admin", req.url), 303);
  res.cookies.set(SESSION_COOKIE, issueToken(), sessionCookieOptions);
  return res;
}

export async function DELETE(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
