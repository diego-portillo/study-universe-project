import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../api/audio_to_text/route';
import { NextRequest } from 'next/server';

vi.mock('ai', () => ({
  experimental_transcribe: vi.fn().mockResolvedValue({ text: 'hello world' }),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: Object.assign(
    vi.fn(() => 'openai-model'),
    {
      transcription: vi.fn(() => 'whisper-model'),
    },
  ),
}));

const fakeAudio = new File([new Uint8Array([1, 2, 3])], 'test.mp3', {
  type: 'audio/mpeg',
});

// jsdom's File doesn't implement arrayBuffer() — polyfill it
vi.spyOn(File.prototype, 'arrayBuffer').mockResolvedValue(
  new Uint8Array([1, 2, 3]).buffer,
);

function makeFormRequest(audio: File | null, provider = 'openai') {
  const formData = new FormData();
  if (audio) formData.append('audio', audio);
  formData.append('provider', provider);

  const request = new NextRequest('http://localhost/api/audio_to_text', {
    method: 'POST',
  });
  request.formData = () => Promise.resolve(formData);

  return request;
}

describe('POST /api/audio_to_text — input validation', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('ELEVENLABS_API_KEY', 'el-test');
  });

  it('returns 400 when no audio file is provided', async () => {
    const res = await POST(makeFormRequest(null));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/audio file is required/i);
  });

  it('returns 500 when OPENAI_API_KEY is missing for openai provider', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const res = await POST(makeFormRequest(fakeAudio, 'openai'));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/OPENAI_API_KEY/);
  });

  it('returns 500 when ELEVENLABS_API_KEY is missing for elevenlabs provider', async () => {
    vi.stubEnv('ELEVENLABS_API_KEY', '');
    const res = await POST(makeFormRequest(fakeAudio, 'elevenlabs'));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/ELEVENLABS_API_KEY/);
  });

  it('returns 200 with transcribed text for openai provider', async () => {
    const res = await POST(makeFormRequest(fakeAudio, 'openai'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBe('hello world');
  });
});
