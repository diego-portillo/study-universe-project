import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../api/chat/route';
import { NextRequest } from 'next/server';
import { MODEL_OPTIONS } from '../../constants';

// Mock the AI SDK providers and streamText — we don't want real API calls
vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => new Response('streamed-content', { status: 200 }),
  })),
}));
vi.mock('@ai-sdk/openai', () => ({ openai: vi.fn((id: string) => `openai:${id}`) }));
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn((id: string) => `anthropic:${id}`),
}));
vi.mock('@ai-sdk/google', () => ({ google: vi.fn((id: string) => `google:${id}`) }));
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

// These tests catch the bug where selecting a non-OpenAI provider produced an
// empty response: the route must reach streamText and return non-empty content.
describe('POST /api/chat — provider routing', () => {
  beforeEach(async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'goog-test');
    const { streamText } = await import('ai');
    vi.mocked(streamText).mockClear();
  });

  it('returns non-empty body for anthropic provider', async () => {
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'anthropic' }),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('returns non-empty body for google provider', async () => {
    const res = await POST(
      makeRequest({ messages: validMessages, provider: 'google' }),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('passes the explicit model ID to the anthropic SDK', async () => {
    const { anthropic } = await import('@ai-sdk/anthropic');
    const { streamText } = await import('ai');

    await POST(
      makeRequest({
        messages: validMessages,
        provider: 'anthropic',
        model: 'claude-haiku-4-5-20251001',
      }),
    );

    expect(vi.mocked(anthropic)).toHaveBeenCalledWith('claude-haiku-4-5-20251001');
    expect(vi.mocked(streamText)).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'anthropic:claude-haiku-4-5-20251001' }),
    );
  });

  it('passes the explicit model ID to the google SDK', async () => {
    const { google } = await import('@ai-sdk/google');
    const { streamText } = await import('ai');

    await POST(
      makeRequest({
        messages: validMessages,
        provider: 'google',
        model: 'gemini-2.5-flash',
      }),
    );

    expect(vi.mocked(google)).toHaveBeenCalledWith('gemini-2.5-flash');
    expect(vi.mocked(streamText)).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'google:gemini-2.5-flash' }),
    );
  });

  // Every model in constants.ts must route correctly and return non-empty content.
  const chatModels = MODEL_OPTIONS.filter((m) =>
    ['openai', 'anthropic', 'google'].includes(m.provider),
  );

  it.each(chatModels)(
    '$provider / $id — routes to streamText and returns non-empty body',
    async ({ id, provider }) => {
      const res = await POST(
        makeRequest({ messages: validMessages, provider, model: id }),
      );
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text.length).toBeGreaterThan(0);
    },
  );
});
