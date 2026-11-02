import { NextResponse } from "next/server";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

// HTML forms can only POST, so sign-out is its own route.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const res = redirectTo(req, "/admin/login");
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
