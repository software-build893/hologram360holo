import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { authenticate, clearLoginFailures, issueToken, loginLocked, noteLoginFailure, SESSION_COOKIE, sessionCookieOptions, signInPossible } from "@/lib/auth";

function clientKey(req: Request): string {
  return req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") ?? "").split(",").pop()?.trim() || "local";
}

export async function POST(req: Request) {
  // the sign-in form must be submitted from this site's own page
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!(await signInPossible())) return NextResponse.json({ error: "No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server to create the first one." }, { status: 503 });
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  const back = `/admin/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(email)}`;
  const key = clientKey(req);
  if (loginLocked(key)) return redirectTo(req, `${back}&error=locked`);
  const admin = email && password ? await authenticate(email, password) : null;
  if (!admin) {
    noteLoginFailure(key);
    return redirectTo(req, `${back}&error=1`);
  }
  clearLoginFailures(key);
  const res = redirectTo(req, next.startsWith("/admin") ? next : "/admin");
  res.cookies.set(SESSION_COOKIE, issueToken(admin), sessionCookieOptions);
  return res;
}
