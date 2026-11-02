import { createHash, randomBytes } from "node:crypto";

// Used only when neither secret is configured (local dev): ids stay unguessable but reset on restart.
const FALLBACK_SALT = randomBytes(16).toString("hex");

/**
 * A daily visitor id: the same person on the same device counts once per day, and the id cannot be
 * turned back into an address because it is salted with the day and the server secret.
 * No cookie is set and nothing is stored in the browser.
 */
export function visitorId(req: Request): string {
  // nginx sets X-Real-IP to the visitor's address (Cloudflare's CF-Connecting-IP, trusted only from Cloudflare);
  // the client can't choose it, unlike the first X-Forwarded-For entry.
  const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") ?? "").split(",").pop()?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || FALLBACK_SALT;
  return createHash("sha256").update(`${day}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 16);
}

export function userAgent(req: Request): string {
  return (req.headers.get("user-agent") ?? "").slice(0, 200);
}
