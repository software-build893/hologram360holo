import { NextResponse } from "next/server";
import { currentAdmin, hashPassword, PASSWORD_MIN } from "@/lib/auth";
import { adminByEmail, countAdmins, createAdmin, deleteAdmin } from "@/lib/db";
import { redirectTo, sameOrigin } from "@/lib/http";

// Other dashboard users: any signed-in admin can add one (with a first password to hand over) or remove one,
// never themselves, and never the last account.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const back = (msg: string, ok = false) => `/admin?tab=account&${ok ? "ok" : "error"}=${encodeURIComponent(msg)}`;

export async function POST(req: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData();
  const action = String(form.get("action") ?? "");

  if (action === "add") {
    const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 200);
    const name = String(form.get("name") ?? "").trim().slice(0, 120);
    const password = String(form.get("password") ?? "");
    if (!EMAIL.test(email)) return redirectTo(req, back("That doesn't look like an email address."));
    if (password.length < PASSWORD_MIN) return redirectTo(req, back(`The first password needs at least ${PASSWORD_MIN} characters.`));
    if (await adminByEmail(email)) return redirectTo(req, back("An admin with that email already exists."));
    await createAdmin({ email, name, password_hash: hashPassword(password) });
    return redirectTo(req, back(`${email} can sign in now. Ask them to change the password once they are in.`, true));
  }

  if (action === "remove") {
    const id = Number(form.get("id"));
    if (!id || id === me.id) return redirectTo(req, back("You can't remove your own account."));
    if ((await countAdmins()) <= 1) return redirectTo(req, back("The last admin can't be removed."));
    await deleteAdmin(id);
    return redirectTo(req, back("Admin removed.", true));
  }

  return NextResponse.json({ error: "bad request" }, { status: 422 });
}
