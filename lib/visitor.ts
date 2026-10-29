import { createHash } from "node:crypto";

/**
 * A daily visitor id: the same person on the same device counts once per day, and the id cannot be
 * turned back into an address because it is salted with the day and the server secret.
 * No cookie is set and nothing is stored in the browser.
 */
export function visitorId(req: Request): string {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const ua = req.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "hologram";
  return createHash("sha256").update(`${day}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 16);
}

export function userAgent(req: Request): string {
  return (req.headers.get("user-agent") ?? "").slice(0, 200);
}
