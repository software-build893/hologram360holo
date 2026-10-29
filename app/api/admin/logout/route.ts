import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

// HTML forms can only POST, so sign-out is its own route.
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
