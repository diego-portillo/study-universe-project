import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('ai', () => ({
  experimental_generateSpeech: vi.fn().mockResolvedValue({
    audio: { uint8Array: new Uint8Array([1, 2, 3]) },
  }),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: Object.assign(
    vi.fn(() => 'openai-model'),
    {
      speech: vi.fn(() => 'tts-model'),
    },
  ),
}));

vi.mock('@ai-sdk/elevenlabs', () => ({
  elevenlabs: Object.assign(
    vi.fn(() => 'elevenlabs-model'),
    {
      speech: vi.fn(() => 'elevenlabs-tts-model'),
    },
  ),
}));

const { POST } = await import('../../api/text_to_audio/route');

function makeJsonRequest(body: object) {
  return new NextRequest('http://localhost/api/text_to_audio', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/text_to_audio', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('ELEVENLABS_API_KEY', 'el-test');
  });

  it('returns 400 when no text is provided', async () => {
    const res = await POST(makeJsonRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/text is required/i);
  });

  it('returns 200 with audio for openai provider', async () => {
    const res = await POST(
      makeJsonRequest({ text: 'hello world', provider: 'openai' }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('audio/mpeg');
  });

  it('returns 200 with audio for elevenlabs provider', async () => {
    const res = await POST(
      makeJsonRequest({ text: 'hello world', provider: 'elevenlabs' }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('audio/mpeg');
  });

  it('returns 500 when generateSpeech throws', async () => {
    const { experimental_generateSpeech } = await import('ai');
    vi.mocked(experimental_generateSpeech).mockRejectedValueOnce(
      new Error('API failure'),
    );
    const res = await POST(makeJsonRequest({ text: 'hello world' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Speech generation failed/);
  });
});
