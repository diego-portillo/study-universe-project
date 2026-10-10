import type { Provider } from '../../types';

export type CompletionMetric = {
  conversationId: string;
  requestId: string;
  provider: Provider;
  model: string;
  promptVersion: string;
  ttftMs: number | null;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  tokensPerSec: number | null;
  costUsd: number | null;
  timestamp: string;
};

export type SessionMetrics = {
  conversationId: string;
  requestCount: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number | null;
  avgTtftMs: number | null;
  avgTokensPerSec: number | null;
};

export type MetricsSummary = {
  sessionCount: number;
  requestCount: number;
  totalCostUsd: number | null;
  avgTtftMs: number | null;
  avgTokensPerSec: number | null;
};

export type MetricsSnapshot = {
  summary: MetricsSummary;
  sessions: SessionMetrics[];
};

// Route handlers and page Server Components compile into separate module
// graphs in Next.js dev, so a plain module-level array would give each side
// its own copy. Pinning it on globalThis keeps writes from api/chat/route.ts
// visible to reads from metrics/page.tsx.
type MetricsGlobal = typeof globalThis & {
  __aiHubMetricsCompletions?: CompletionMetric[];
};

const globalForMetrics = globalThis as MetricsGlobal;

const completions: CompletionMetric[] = (globalForMetrics.__aiHubMetricsCompletions ??= []);

export function recordCompletion(metric: CompletionMetric): void {
  completions.push(metric);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sumCostUsd(metrics: CompletionMetric[]): number | null {
  const known = metrics.map((metric) => metric.costUsd).filter((cost) => cost !== null);
  if (known.length === 0) return null;
  return known.reduce((sum, cost) => sum + cost, 0);
}

function summarizeSession(conversationId: string, metrics: CompletionMetric[]): SessionMetrics {
  return {
    conversationId,
    requestCount: metrics.length,
    totalTokensIn: metrics.reduce((sum, metric) => sum + metric.tokensIn, 0),
    totalTokensOut: metrics.reduce((sum, metric) => sum + metric.tokensOut, 0),
    totalCostUsd: sumCostUsd(metrics),
    avgTtftMs: average(
      metrics.map((metric) => metric.ttftMs).filter((ttft) => ttft !== null),
    ),
    avgTokensPerSec: average(
      metrics.map((metric) => metric.tokensPerSec).filter((tps) => tps !== null),
    ),
  };
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const conversationIds = [...new Set(completions.map((metric) => metric.conversationId))];
  const sessions = conversationIds.map((conversationId) =>
    summarizeSession(
      conversationId,
      completions.filter((metric) => metric.conversationId === conversationId),
    ),
  );

  const summary: MetricsSummary = {
    sessionCount: sessions.length,
    requestCount: completions.length,
    totalCostUsd: sumCostUsd(completions),
    avgTtftMs: average(
      completions.map((metric) => metric.ttftMs).filter((ttft) => ttft !== null),
    ),
    avgTokensPerSec: average(
      completions.map((metric) => metric.tokensPerSec).filter((tps) => tps !== null),
    ),
  };

  return { summary, sessions };
}

export function resetMetrics(): void {
  completions.length = 0;
}

export function getTodayTokenUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  return completions
    .filter((metric) => metric.timestamp.slice(0, 10) === today)
    .reduce((sum, metric) => sum + metric.tokensIn + metric.tokensOut, 0);
}
