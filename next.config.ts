import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The admin dashboard reads cookies and the event store on every request, which the cache-components
  // mode refuses without extra boundaries; the marketing page gains nothing from it.
  // The dev badge adds ink the comp never shows; the fidelity captures run against the dev server.
  devIndicators: false,
  turbopack: { root: __dirname },
};

export default nextConfig;
