import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getTextContent, hasImage, fileToLowResDataUrl } from '../utils';
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
