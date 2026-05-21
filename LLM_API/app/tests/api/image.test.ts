import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGenerate = vi.fn();

// OpenAI must be mocked as a real class, not a plain function
vi.mock('openai', () => {
  class MockOpenAI {
    images = { generate: mockGenerate };
    constructor(_opts: unknown) {}
  }
  // APIError needs to be a real class for instanceof checks in the route
  class APIError extends Error {}

  return { default: MockOpenAI, APIError };
});

// Import AFTER the mock is set up
const { POST } = await import('../../api/image/route');

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/image — input validation', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('OPENAI_IMAGE_MODEL', 'dall-e-2');
    vi.stubEnv('OPENAI_IMAGE_SIZE', '256x256');
    mockGenerate.mockResolvedValue({
      data: [{ url: 'https://example.com/img.png' }],
    });
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/image', {
      method: 'POST',
      body: 'bad json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when prompt is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/prompt is required/i);
  });

  it('returns 400 when prompt is an empty string', async () => {
    const res = await POST(makeRequest({ prompt: '   ' }));
    expect(res.status).toBe(400);
  });

  it('returns 500 when OPENAI_API_KEY is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const res = await POST(makeRequest({ prompt: 'a cat' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/OPENAI_API_KEY/);
  });

  it('returns 200 with url for a valid dall-e-2 request', async () => {
    const res = await POST(makeRequest({ prompt: 'a cat' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe('https://example.com/img.png');
  });

  it('returns 502 when OpenAI returns no image data', async () => {
    mockGenerate.mockResolvedValue({ data: [] });
    const res = await POST(makeRequest({ prompt: 'a cat' }));
    expect(res.status).toBe(502);
  });
});
