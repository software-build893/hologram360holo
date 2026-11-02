import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { type Admin, adminByEmail, adminById, countAdmins, createAdmin, touchAdminLogin } from "@/lib/db";

// Dashboard sign-in: admins are rows in the `admins` table with an email and a scrypt password hash.
// The first admin is seeded from ADMIN_EMAIL + ADMIN_PASSWORD when the table is empty; after that the
// environment values are not consulted again, so change the password in the dashboard, not in .env.
// The session is a signed, expiring token in an httpOnly cookie; nothing is stored server-side.
export const SESSION_COOKIE = "hologram_admin";
const SESSION_DAYS = 14;

function secret(): string {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_SECRET is not set");
  return s;
}

export function secretConfigured(): boolean {
  return Boolean(process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD);
}

// ---------- passwords ----------

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const want = Buffer.from(hash, "base64url");
  const got = scryptSync(password, Buffer.from(salt, "base64url"), want.length, SCRYPT);
  return got.length === want.length && timingSafeEqual(got, want);
}

export const PASSWORD_MIN = 10;

// ---------- sign in ----------

/** Seeds the first admin from the environment when nobody exists yet. */
async function seedFirstAdmin() {
  if ((await countAdmins()) > 0) return;
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) return;
  await createAdmin({ email, name: "", password_hash: hashPassword(password) });
}

/** True when someone can sign in: an admin row exists, or the environment can seed one. */
export async function signInPossible(): Promise<boolean> {
  if (!secretConfigured()) return false;
  if ((await countAdmins()) > 0) return true;
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export async function authenticate(email: string, password: string): Promise<Admin | null> {
  await seedFirstAdmin();
  const admin = await adminByEmail(email.trim().toLowerCase());
  // an unknown email still runs one hash, so both outcomes take about the same time
  const ok = verifyPassword(password, admin?.password_hash ?? UNKNOWN_EMAIL_HASH);
  if (!admin || !ok) return null;
  await touchAdminLogin(admin.id);
  return admin;
}
const UNKNOWN_EMAIL_HASH = hashPassword(randomBytes(12).toString("hex"));

// ---------- sessions ----------

/** The token binds the admin id and a fingerprint of the password hash, so a password change signs every session out. */
export function issueToken(admin: Admin): string {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${admin.id}.${exp}.${fingerprint(admin.password_hash)}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function fingerprint(passwordHash: string): string {
  return createHmac("sha256", secret()).update(passwordHash).digest("base64url").slice(0, 12);
}

async function adminFromToken(token: string | undefined): Promise<Admin | null> {
  if (!token) return null;
  const [idStr, expStr, fp, sig] = token.split(".");
  const id = Number(idStr);
  const exp = Number(expStr);
  if (!id || !exp || !fp || !sig || exp < Date.now()) return null;
  const want = createHmac("sha256", secret()).update(`${idStr}.${expStr}.${fp}`).digest("base64url");
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  const admin = await adminById(id);
  if (!admin || fingerprint(admin.password_hash) !== fp) return null;
  return admin;
}

/** The signed-in admin for this request, or null. */
export async function currentAdmin(): Promise<Admin | null> {
  if (!secretConfigured()) return null;
  const jar = await cookies();
  return adminFromToken(jar.get(SESSION_COOKIE)?.value);
}

export async function isAdmin(): Promise<boolean> {
  return (await currentAdmin()) !== null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
};

// ---------- a small brake on password guessing ----------

const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 6;
const LOCK_MS = 60_000;

export function loginLocked(key: string): boolean {
  const a = attempts.get(key);
  return Boolean(a && a.n >= MAX_ATTEMPTS && a.until > Date.now());
}

export function noteLoginFailure(key: string) {
  const a = attempts.get(key);
  if (a && a.until > Date.now()) {
    a.n += 1;
    a.until = Date.now() + LOCK_MS;
  } else {
    attempts.set(key, { n: 1, until: Date.now() + LOCK_MS });
  }
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
