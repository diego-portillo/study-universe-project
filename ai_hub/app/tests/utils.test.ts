import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getTextContent,
  hasImage,
  fileToLowResDataUrl,
  classifyProviderError,
  extractStreamError,
} from '../utils';
import type { MessageContent } from '../types';

describe('getTextContent', () => {
  it('returns the string as-is when content is a plain string', () => {
    expect(getTextContent('hello world')).toBe('hello world');
  });

  it('returns empty string for an empty string', () => {
    expect(getTextContent('')).toBe('');
  });

  it('extracts text from a single text part', () => {
    const content: MessageContent = [{ type: 'text', text: 'hello' }];
    expect(getTextContent(content)).toBe('hello');
  });

  it('joins multiple text parts with a space', () => {
    const content: MessageContent = [
      { type: 'text', text: 'hello' },
      { type: 'text', text: 'world' },
    ];
    expect(getTextContent(content)).toBe('hello world');
  });

  it('ignores image_url parts and returns only text', () => {
    const content: MessageContent = [
      { type: 'text', text: 'describe this' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } },
    ];
    expect(getTextContent(content)).toBe('describe this');
  });

  it('returns empty string when array has only image parts', () => {
    const content: MessageContent = [
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } },
    ];
    expect(getTextContent(content)).toBe('');
  });
});

describe('hasImage', () => {
  it('returns false for a plain string', () => {
    expect(hasImage('just text')).toBe(false);
  });

  it('returns false when array has only text parts', () => {
    const content: MessageContent = [{ type: 'text', text: 'no image here' }];
    expect(hasImage(content)).toBe(false);
  });

  it('returns true when array contains an image_url part', () => {
    const content: MessageContent = [
      { type: 'text', text: 'look at this' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } },
    ];
    expect(hasImage(content)).toBe(true);
  });

  it('returns true when array has only an image part', () => {
    const content: MessageContent = [
      { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
    ];
    expect(hasImage(content)).toBe(true);
  });
});

describe('classifyProviderError', () => {
  // Real error strings captured from the Aug 28, 2026 all-provider eval run
  // (evals/results/2026-08-28T18-05-14-036Z.json) — the harness's judge model
  // hit an OpenAI RPD 429, and every Google request failed with a quota error.
  it('classifies OpenAI-style 429 messages as rate_limit', () => {
    expect(
      classifyProviderError(
        '429 Rate limit reached for gpt-4.1-mini in organization org-xyz on requests per day (RPD): Limit 50, Used 50, Requested 1.',
      ),
    ).toBe('rate_limit');
  });

  it('classifies Gemini quota-exceeded messages as quota, not rate_limit', () => {
    // Full real message: the boilerplate links contain "rate-limits"/"rate-limit",
    // which must not shadow the actual "quota" failure reason.
    expect(
      classifyProviderError(
        'Failed after 3 attempts. Last error: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit.',
      ),
    ).toBe('quota');
  });

  it('classifies route.ts missingApiKeyResponse messages as missing_key', () => {
    expect(classifyProviderError('Missing ANTHROPIC_API_KEY')).toBe('missing_key');
  });

  it('classifies fetch network failures as network', () => {
    expect(classifyProviderError('Failed to fetch')).toBe('network');
  });

  it('falls back to unknown for an unrecognized message', () => {
    expect(classifyProviderError('Internal Server Error')).toBe('unknown');
  });
});

describe('extractStreamError', () => {
  // route.ts commits a 200 before the provider call resolves, so a mid-stream
  // failure gets appended to the body as `\n\n[Error: <message>]` instead of
  // changing the HTTP status (see the fullStream loop in api/chat/route.ts).
  it('returns null for plain text with no error marker', () => {
    expect(extractStreamError('Hello, world!')).toBeNull();
  });

  it('splits clean text from a trailing embedded error', () => {
    const result = extractStreamError(
      'Partial answer before it broke.\n\n[Error: Rate limit reached]',
    );
    expect(result).toEqual({
      cleanText: 'Partial answer before it broke.',
      errorMessage: 'Rate limit reached',
    });
  });

  it('handles the error marker with no preceding text', () => {
    // real shape from the Aug 28, 2026 eval run — Gemini failed before
    // emitting any text at all.
    const result = extractStreamError(
      '\n\n[Error: You exceeded your current quota, please check your plan and billing details. ]',
    );
    expect(result?.cleanText).toBe('');
    expect(result?.errorMessage).toContain('exceeded your current quota');
  });
});

describe('fileToLowResDataUrl', () => {
  beforeEach(() => {
    // Mock createImageBitmap (not available in jsdom)
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({
        width: 1024,
        height: 768,
        close: vi.fn(),
      }),
    );

    // Mock canvas and its context
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,abc123'),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a data URL string', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = await fileToLowResDataUrl(file);
    expect(result).toMatch(/^data:image\/jpeg/);
  });

  it('scales down images larger than 512px', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({
        width: 2048,
        height: 1024,
        close: vi.fn(),
      }),
    );
    const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
    // Should not throw — scale = 512/2048 = 0.25
    await expect(fileToLowResDataUrl(file)).resolves.toBeDefined();
  });

  it('throws when canvas context is unavailable', async () => {
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(null), // simulate failure
          toDataURL: vi.fn(),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await expect(fileToLowResDataUrl(file)).rejects.toThrow('Canvas error');
  });
});
