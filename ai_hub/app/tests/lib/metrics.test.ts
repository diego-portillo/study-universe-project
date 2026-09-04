import { describe, it, expect, beforeEach } from 'vitest';
import { recordCompletion, getMetricsSnapshot, resetMetrics } from '../../api/lib/metrics';

describe('metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('returns an empty snapshot when nothing has been recorded', () => {
    const snapshot = getMetricsSnapshot();
    expect(snapshot.summary).toEqual({
      sessionCount: 0,
      requestCount: 0,
      totalCostUsd: null,
      avgTtftMs: null,
      avgTokensPerSec: null,
    });
    expect(snapshot.sessions).toEqual([]);
  });

  it('aggregates multiple completions within the same session', () => {
    recordCompletion({
      conversationId: 'a',
      requestId: 'req-1',
      provider: 'openai',
      model: 'gpt-4o-mini',
      promptVersion: 'v1',
      ttftMs: 100,
      latencyMs: 500,
      tokensIn: 10,
      tokensOut: 20,
      tokensPerSec: 40,
      costUsd: 0.001,
      timestamp: '2026-09-01T00:00:00.000Z',
    });
    recordCompletion({
      conversationId: 'a',
      requestId: 'req-2',
      provider: 'openai',
      model: 'gpt-4o-mini',
      promptVersion: 'v1',
      ttftMs: 200,
      latencyMs: 700,
      tokensIn: 15,
      tokensOut: 25,
      tokensPerSec: 50,
      costUsd: 0.002,
      timestamp: '2026-09-01T00:01:00.000Z',
    });

    const snapshot = getMetricsSnapshot();
    expect(snapshot.sessions).toHaveLength(1);
    const [session] = snapshot.sessions;
    expect(session.conversationId).toBe('a');
    expect(session.requestCount).toBe(2);
    expect(session.totalTokensIn).toBe(25);
    expect(session.totalTokensOut).toBe(45);
    expect(session.totalCostUsd).toBeCloseTo(0.003);
    expect(session.avgTtftMs).toBe(150);
    expect(session.avgTokensPerSec).toBe(45);
  });

  it('keeps separate sessions distinct and rolls them up into the summary', () => {
    recordCompletion({
      conversationId: 'a',
      requestId: 'req-1',
      provider: 'openai',
      model: 'gpt-4o-mini',
      promptVersion: 'v1',
      ttftMs: 100,
      latencyMs: 500,
      tokensIn: 10,
      tokensOut: 20,
      tokensPerSec: 40,
      costUsd: 0.001,
      timestamp: '2026-09-01T00:00:00.000Z',
    });
    recordCompletion({
      conversationId: 'b',
      requestId: 'req-2',
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      promptVersion: 'v1',
      ttftMs: 300,
      latencyMs: 900,
      tokensIn: 5,
      tokensOut: 10,
      tokensPerSec: 20,
      costUsd: 0.004,
      timestamp: '2026-09-01T00:02:00.000Z',
    });

    const snapshot = getMetricsSnapshot();
    expect(snapshot.summary.sessionCount).toBe(2);
    expect(snapshot.summary.requestCount).toBe(2);
    expect(snapshot.summary.totalCostUsd).toBeCloseTo(0.005);
    expect(snapshot.summary.avgTtftMs).toBe(200);
  });

  it('excludes null cost/ttft/tokensPerSec values from averages instead of treating them as zero', () => {
    recordCompletion({
      conversationId: 'a',
      requestId: 'req-1',
      provider: 'openai',
      model: 'unknown-model',
      promptVersion: 'v1',
      ttftMs: null,
      latencyMs: 500,
      tokensIn: 10,
      tokensOut: 20,
      tokensPerSec: null,
      costUsd: null,
      timestamp: '2026-09-01T00:00:00.000Z',
    });

    const snapshot = getMetricsSnapshot();
    const [session] = snapshot.sessions;
    expect(session.totalCostUsd).toBeNull();
    expect(session.avgTtftMs).toBeNull();
    expect(session.avgTokensPerSec).toBeNull();
  });
});
