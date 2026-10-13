import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output and outputFileTracingRoot below are both Docker/AWS-
  // only concerns — they tell Next.js to treat this ai_hub/ folder as its
  // own tracing root, independent of the monorepo, for a self-contained
  // Docker build. On Vercel, Root Directory (set to ai_hub in project
  // settings) already does that scoping, and layering our own override on
  // top of it hits a known Next.js 16 + Turbopack bug: outputFileTracingRoot
  // pointing below the repo root doubles the app's subpath in traced file
  // paths, so Vercel's "Deploying outputs" step looks for
  // .next/server/pages-manifest.json in the wrong place and fails with
  // ENOENT (see vercel/next.js#88579). Vercel sets VERCEL=1 during its
  // builds, so skip both settings there.
  ...(process.env.VERCEL
    ? {}
    : {
        output: "standalone" as const,
        // Without this, Next detects the root-level package-lock.json and
        // nests .next/standalone output under an extra ai_hub/ directory,
        // which breaks scripts that assume .next/standalone/server.js.
        outputFileTracingRoot: import.meta.dirname,
      }),
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
