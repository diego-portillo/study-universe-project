import { describe, it, expect } from 'vitest';
import {
  makeSystemMessage,
  MAX_PROMPT_CHARS,
  MAX_AUDIO_LENGTH,
  MODEL_OPTIONS,
  DEFAULT_MODEL,
  DEFAULT_AUDIO_PROVIDER,
} from '../constants';

describe('makeSystemMessage', () => {
  it('returns a message with role system', () => {
    const msg = makeSystemMessage('GPT-4o');
    expect(msg.role).toBe('system');
  });

  it('includes the model label in the content', () => {
    const msg = makeSystemMessage('Claude Sonnet 4.6');
    expect(msg.content).toContain('Claude Sonnet 4.6');
  });

  it('produces different content for different model labels', () => {
    const a = makeSystemMessage('GPT-4o');
    const b = makeSystemMessage('Gemini 2.5 Flash');
    expect(a.content).not.toBe(b.content);
  });
});

describe('MODEL_OPTIONS', () => {
  it('has at least one model per provider', () => {
    const providers = MODEL_OPTIONS.map((m) => m.provider);
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('google');
    expect(providers).toContain('elevenlabs');
  });

  it('every model has a non-empty id, label, and provider', () => {
    for (const model of MODEL_OPTIONS) {
      expect(model.id.length).toBeGreaterThan(0);
      expect(model.label.length).toBeGreaterThan(0);
      expect(model.provider.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate model ids', () => {
    const ids = MODEL_OPTIONS.map((m) => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('DEFAULT_MODEL', () => {
  it('is included in MODEL_OPTIONS', () => {
    const found = MODEL_OPTIONS.find((m) => m.id === DEFAULT_MODEL.id);
    expect(found).toBeDefined();
  });
});

describe('constants values', () => {
  it('MAX_PROMPT_CHARS is a positive number', () => {
    expect(MAX_PROMPT_CHARS).toBeGreaterThan(0);
  });

  it('MAX_AUDIO_LENGTH is a positive number', () => {
    expect(MAX_AUDIO_LENGTH).toBeGreaterThan(0);
  });

  it('DEFAULT_AUDIO_PROVIDER is openai or elevenlabs', () => {
    expect(['openai', 'elevenlabs']).toContain(DEFAULT_AUDIO_PROVIDER);
  });
});
