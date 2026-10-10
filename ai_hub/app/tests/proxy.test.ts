import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, resetRateLimitState } from '../../proxy';

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/chat', { headers });
}

describe('proxy — daily demo request cap', () => {
  beforeEach(() => {
    resetRateLimitState();
    vi.stubEnv('PUBLIC_DEMO_MODE', 'true');
    vi.stubEnv('DEMO_DAILY_REQUEST_CAP', '2');
  });

  it('rejects requests once the daily cap is reached', () => {
    expect(proxy(makeRequest()).status).not.toBe(429);
    expect(proxy(makeRequest()).status).not.toBe(429);

    const res = proxy(makeRequest());
    expect(res.status).toBe(429);
  });

  it('does not enforce the cap when demo mode is off', () => {
    vi.stubEnv('PUBLIC_DEMO_MODE', 'false');

    for (let i = 0; i < 5; i++) {
      expect(proxy(makeRequest()).status).not.toBe(429);
    }
  });
});

describe('proxy — request size cap', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('rejects a request body over the size cap before it reaches a route handler', () => {
    const res = proxy(makeRequest({ 'content-length': String(1_048_576 + 1) }));
    expect(res.status).toBe(413);
  });

  it('allows a request body within the size cap', () => {
    const res = proxy(makeRequest({ 'content-length': '1000' }));
    expect(res.status).not.toBe(413);
  });
});
