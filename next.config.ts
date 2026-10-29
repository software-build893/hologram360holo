import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The dev badge adds ink the comp never shows; the fidelity captures run against the dev server.
  devIndicators: false,
  turbopack: { root: __dirname },
};

export default nextConfig;
