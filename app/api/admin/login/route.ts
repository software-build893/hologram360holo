import { NextResponse } from "next/server";
import { redirectTo } from "@/lib/http";
import { adminConfigured, checkPassword, issueToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server" }, { status: 503 });
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!checkPassword(password)) {
    return redirectTo(req, `/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const res = redirectTo(req, next.startsWith("/admin") ? next : "/admin");
  res.cookies.set(SESSION_COOKIE, issueToken(), sessionCookieOptions);
  return res;
}

export async function DELETE(req: Request) {
  const res = redirectTo(req, "/admin/login");
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
