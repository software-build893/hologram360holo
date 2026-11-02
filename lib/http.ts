import { NextResponse } from "next/server";

/**
 * Behind nginx the standalone server sees itself as 127.0.0.1:3101, so `new URL(path, req.url)` would send the
 * browser to localhost. Build redirects from the forwarded host and scheme instead.
 */
export function publicUrl(req: Request, path: string): URL {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") || host?.startsWith("127.") ? "http" : "https");
  const base = host ? `${proto}://${host}` : req.url;
  return new URL(path, base);
}

/**
 * Admin form posts must come from this site's own pages. SameSite=Lax still sends the cookie on posts from sibling
 * *.afdillah.com hosts, so compare the browser's Origin header with our public origin.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return Boolean(origin) && origin === publicUrl(req, "/").origin;
}

export function redirectTo(req: Request, path: string) {
  return NextResponse.redirect(publicUrl(req, path), 303);
}
