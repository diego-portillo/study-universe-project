import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '../../api/metrics/route';
import { recordCompletion, resetMetrics } from '../../api/lib/metrics';

describe('GET /api/metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('returns an empty snapshot when no completions have been recorded', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary.sessionCount).toBe(0);
    expect(data.sessions).toEqual([]);
  });

  it('returns recorded session data', async () => {
    recordCompletion({
      conversationId: 'session-1',
      requestId: 'req-1',
      provider: 'openai',
      model: 'gpt-4o-mini',
      promptVersion: 'v1',
      ttftMs: 120,
      latencyMs: 480,
      tokensIn: 12,
      tokensOut: 34,
      tokensPerSec: 60,
      costUsd: 0.0007,
      timestamp: '2026-09-01T00:00:00.000Z',
    });

    const res = await GET();
    const data = await res.json();
    expect(data.summary.sessionCount).toBe(1);
    expect(data.summary.requestCount).toBe(1);
    expect(data.sessions[0].conversationId).toBe('session-1');
    expect(data.sessions[0].totalTokensOut).toBe(34);
  });
});
