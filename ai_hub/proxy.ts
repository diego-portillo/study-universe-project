import { NextRequest, NextResponse } from "next/server";
import { isPublicDemoMode } from "./app/api/lib/demoMode";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_BODY_BYTES = 1_048_576; // 1 MB
const DEFAULT_DEMO_DAILY_REQUEST_CAP = 100;

const ipStore = new Map<string, number[]>();
let dailyRequestCount = { date: "", count: 0 };

function currentUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function demoDailyRequestCap(): number {
  return Number(process.env.DEMO_DAILY_REQUEST_CAP) || DEFAULT_DEMO_DAILY_REQUEST_CAP;
}

// Resets the counter on the first request of a new UTC day rather than on a
// timer, so an idle proxy doesn't need a background job to roll the cap over.
function demoDailyRequestLimitReached(): boolean {
  const today = currentUtcDate();
  if (dailyRequestCount.date !== today) {
    dailyRequestCount = { date: today, count: 0 };
  }
  if (dailyRequestCount.count >= demoDailyRequestCap()) return true;
  dailyRequestCount.count += 1;
  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const timestamps = (ipStore.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS,
  );
  if (timestamps.length >= MAX_REQUESTS) {
    return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    });
  }

  if (isPublicDemoMode() && demoDailyRequestLimitReached()) {
    return new NextResponse(
      JSON.stringify({ error: "Daily demo request limit reached — try again tomorrow" }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  timestamps.push(now);
  ipStore.set(ip, timestamps);

  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };

// Test-only: clears in-memory rate-limit state between test cases, same
// purpose as resetMetrics() in app/api/lib/metrics.ts.
export function resetRateLimitState(): void {
  ipStore.clear();
  dailyRequestCount = { date: "", count: 0 };
}
