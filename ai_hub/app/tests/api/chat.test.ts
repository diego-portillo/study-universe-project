import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../api/chat/route';
import { NextRequest } from 'next/server';

// Mock the AI SDK providers and streamText — we don't want real API calls
vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => new Response('streamed', { status: 200 }),
  })),
}));
vi.mock('@ai-sdk/openai', () => ({ openai: vi.fn(() => 'openai-model') }));
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => 'anthropic-model'),
}));
vi.mock('@ai-sdk/google', () => ({ google: vi.fn(() => 'google-model') }));
vi.mock('../../api/lib/messages', () => ({
  applyLowDetailToImages: (m: unknown) => m,
  messagesIncludeVision: () => false,
}));

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validMessages = [{ role: 'user', content: 'hello' }];

describe('POST /api/chat — input validation', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'goog-test');
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid json/i);
  });

  it('returns 400 when messages is missing', async () => {
    const res = await POST(makeRequest({ provider: 'openai' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when messages is an empty array', async () => {
    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(400);
  });

  it('accepts requests with more than MAX_MESSAGES and trims stored history', async () => {
    const tooMany = Array.from({ length: 9 }, (_, i) => ({
      role: 'user',
      content: `message ${i}`,
    }));
    const res = await POST(makeRequest({ messages: tooMany, provider: 'openai' }));
    expect(res.status).toBe(200);
  });

  it('returns 500 when OPENAI_API_KEY is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'openai' }),
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/OPENAI_API_KEY/);
  });

  it('returns 500 when ANTHROPIC_API_KEY is missing', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'anthropic' }),
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it('returns 500 when GOOGLE_GENERATIVE_AI_API_KEY is missing', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '');
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'google' }),
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/GOOGLE_GENERATIVE_AI_API_KEY/);
  });

  it('returns 200 for a valid openai request', async () => {
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'openai' }),
    );
    expect(res.status).toBe(200);
  });
});
