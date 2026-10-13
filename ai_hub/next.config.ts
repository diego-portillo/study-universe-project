import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only for the Docker/AWS self-hosted build — Vercel runs its own
  // serverless packaging, and forcing "standalone" there too moves
  // .next/server/pages-manifest.json to where Vercel's builder doesn't look
  // for it, breaking the build with "ENOENT ... pages-manifest.json".
  // Vercel sets VERCEL=1 during its builds, so gate on that.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  // Pins tracing to this subproject instead of the monorepo root — without it,
  // Next detects the root-level package-lock.json and nests .next/standalone
  // output under an extra ai_hub/ directory, which breaks scripts that assume
  // .next/standalone/server.js.
  outputFileTracingRoot: import.meta.dirname,
  ...(process.env.NEXT_PUBLIC_BASE_PATH
    ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH }
    : {}),
  async headers() {
    const prod = process.env.NODE_ENV === "production";
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()",
      },
      ...(prod
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
