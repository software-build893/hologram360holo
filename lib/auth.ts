import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Single shared password for the analytics dashboard, set as ADMIN_PASSWORD in the environment.
// The session is a signed, expiring token in an httpOnly cookie; nothing is stored server-side.
export const SESSION_COOKIE = "hologram_admin";
const SESSION_DAYS = 14;

function secret(): string {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set");
  return s;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}

export function issueToken(): string {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const sig = createHmac("sha256", secret()).update(String(exp)).digest("base64url");
  return `${exp}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  const want = createHmac("sha256", secret()).update(expStr).digest("base64url");
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
};
