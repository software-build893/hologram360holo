import { NextResponse } from "next/server";
import { currentAdmin, hashPassword, issueToken, PASSWORD_MIN, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { adminByEmail, adminById, setAdminEmail, setAdminPassword } from "@/lib/db";
import { redirectTo, sameOrigin } from "@/lib/http";

// The signed-in admin's own account: change the email/name, or the password (which re-issues this session's cookie
// because the token is bound to the password hash).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const back = (msg: string, ok = false) => `/admin?tab=account&${ok ? "ok" : "error"}=${encodeURIComponent(msg)}`;

export async function POST(req: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData();
  const action = String(form.get("action") ?? "");

  if (action === "profile") {
    const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 200);
    const name = String(form.get("name") ?? "").trim().slice(0, 120);
    if (!EMAIL.test(email)) return redirectTo(req, back("That doesn't look like an email address."));
    const other = await adminByEmail(email);
    if (other && other.id !== me.id) return redirectTo(req, back("Another admin already uses that email."));
    await setAdminEmail(me.id, email, name);
    return redirectTo(req, back("Account details saved.", true));
  }

  if (action === "password") {
    const current = String(form.get("current") ?? "");
    const next = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (!verifyPassword(current, me.password_hash)) return redirectTo(req, back("The current password didn't match."));
    if (next.length < PASSWORD_MIN) return redirectTo(req, back(`The new password needs at least ${PASSWORD_MIN} characters.`));
    if (next !== confirm) return redirectTo(req, back("The new password and its confirmation differ."));
    await setAdminPassword(me.id, hashPassword(next));
    const res = redirectTo(req, back("Password changed. Other devices are signed out.", true));
    res.cookies.set(SESSION_COOKIE, issueToken((await adminById(me.id))!), sessionCookieOptions);
    return res;
  }

  return NextResponse.json({ error: "bad request" }, { status: 422 });
}
