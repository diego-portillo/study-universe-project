import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the openai package so importing the route never calls new OpenAI() with
// a real key — and so the module loads cleanly with no env vars set.
vi.mock('openai', () => ({
  default: class OpenAI {
    static APIError = class APIError extends Error {};
    images = { generate: vi.fn() };
  },
}));

import { POST } from '../../api/image/route';
import { NextRequest } from 'next/server';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/image', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/image', () => {
  const savedKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (savedKey !== undefined) process.env.OPENAI_API_KEY = savedKey;
    else delete process.env.OPENAI_API_KEY;
  });

  // Regression: before the fix, `new OpenAI()` ran at module load time and
  // threw immediately when OPENAI_API_KEY was missing — crashing the build.
  // Now it is instantiated inside the handler, after the key guard.
  it('returns 500 (not a crash) when OPENAI_API_KEY is missing', async () => {
    const res = await POST(makeRequest({ prompt: 'a cat' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/OPENAI_API_KEY/);
  });

  it('returns 400 when prompt is empty', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const res = await POST(makeRequest({ prompt: '' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/prompt/i);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/image', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
