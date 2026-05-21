import { describe, it, expect } from 'vitest';
import {
  applyLowDetailToImages,
  messagesIncludeVision,
} from '../../api/lib/messages';
import type { Message } from '../../api/lib/messages';

// ─── helpers ────────────────────────────────────────────────────────────────

const textMsg = (role: Message['role'], text: string): Message => ({
  role,
  content: text,
});

const imgMsg = (url: string): Message => ({
  role: 'user',
  content: [
    { type: 'text', text: 'look' },
    { type: 'image_url', image_url: { url, detail: 'high' } },
  ],
});

// ─── applyLowDetailToImages ──────────────────────────────────────────────────

describe('applyLowDetailToImages', () => {
  it('returns plain string messages unchanged', () => {
    const messages = [textMsg('user', 'hello'), textMsg('assistant', 'hi')];
    expect(applyLowDetailToImages(messages)).toEqual(messages);
  });

  it('forces detail to "low" on data: URL images', () => {
    const msg = imgMsg('data:image/jpeg;base64,abc');
    const [result] = applyLowDetailToImages([msg]);
    const imgPart = (
      result.content as Array<{ type: string; image_url?: { detail?: string } }>
    ).find((p) => p.type === 'image_url');
    expect(imgPart?.image_url?.detail).toBe('low');
  });

  it('forces detail to "low" on https: URL images', () => {
    const msg = imgMsg('https://example.com/photo.jpg');
    const [result] = applyLowDetailToImages([msg]);
    const imgPart = (
      result.content as Array<{ type: string; image_url?: { detail?: string } }>
    ).find((p) => p.type === 'image_url');
    expect(imgPart?.image_url?.detail).toBe('low');
  });

  it('throws on disallowed URL schemes (e.g. http:)', () => {
    const msg = imgMsg('http://example.com/photo.jpg');
    expect(() => applyLowDetailToImages([msg])).toThrow(
      'image_url must be a data: or https: URL',
    );
  });

  it('throws on blob: URLs', () => {
    const msg = imgMsg('blob:http://localhost/abc');
    expect(() => applyLowDetailToImages([msg])).toThrow(
      'image_url must be a data: or https: URL',
    );
  });

  it('does not mutate the original message', () => {
    const original = imgMsg('data:image/jpeg;base64,abc');
    const originalDetail = (
      original.content as Array<{
        type: string;
        image_url?: { detail?: string };
      }>
    ).find((p) => p.type === 'image_url')?.image_url?.detail;
    applyLowDetailToImages([original]);
    const afterDetail = (
      original.content as Array<{
        type: string;
        image_url?: { detail?: string };
      }>
    ).find((p) => p.type === 'image_url')?.image_url?.detail;
    // Original should be unchanged
    expect(afterDetail).toBe(originalDetail);
  });

  it('leaves text parts inside multipart messages untouched', () => {
    const msg = imgMsg('data:image/jpeg;base64,abc');
    const [result] = applyLowDetailToImages([msg]);
    const textPart = (
      result.content as Array<{ type: string; text?: string }>
    ).find((p) => p.type === 'text');
    expect(textPart?.text).toBe('look');
  });

  it('handles a mix of string and multipart messages', () => {
    const messages: Message[] = [
      textMsg('system', 'you are helpful'),
      imgMsg('data:image/jpeg;base64,abc'),
      textMsg('assistant', 'I see an image'),
    ];
    expect(() => applyLowDetailToImages(messages)).not.toThrow();
    expect(applyLowDetailToImages(messages)).toHaveLength(3);
  });
});

// ─── messagesIncludeVision ───────────────────────────────────────────────────

describe('messagesIncludeVision', () => {
  it('returns false for all-text messages', () => {
    const messages = [textMsg('user', 'hello'), textMsg('assistant', 'hi')];
    expect(messagesIncludeVision(messages)).toBe(false);
  });

  it('returns true when any message has an image_url part', () => {
    const messages = [
      textMsg('user', 'check this'),
      imgMsg('data:image/jpeg;base64,abc'),
    ];
    expect(messagesIncludeVision(messages)).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(messagesIncludeVision([])).toBe(false);
  });

  it('returns false when multipart content has only text parts', () => {
    const messages: Message[] = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'no image here' }],
      },
    ];
    expect(messagesIncludeVision(messages)).toBe(false);
  });
});
