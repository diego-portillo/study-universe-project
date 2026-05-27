import { describe, it, expect } from 'vitest';
import { applyLowDetailToImages } from '../../api/lib/messages';

describe('applyLowDetailToImages', () => {
  it('sets detail to "low" on image_url parts', () => {
    const messages = [
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: 'Look at this' },
          {
            type: 'image_url' as const,
            image_url: { url: 'https://example.com/img.png' },
          },
        ],
      },
    ];

    const result = applyLowDetailToImages(messages);
    const part = result[0].content[1] as {
      type: 'image_url';
      image_url: { url: string; detail?: string };
    };

    expect(part.image_url.detail).toBe('low');
  });

  // Regression: before the fix, `detail: "low"` was widened to `string` by
  // TypeScript, making it incompatible with ImageUrlPart's "low"|"high"|"auto"
  // union. This test documents the expected literal type at runtime.
  it('detail value is the literal "low", not an arbitrary string', () => {
    const messages = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'image_url' as const,
            image_url: { url: 'data:image/png;base64,abc' },
          },
        ],
      },
    ];

    const result = applyLowDetailToImages(messages);
    const part = result[0].content[0] as {
      type: 'image_url';
      image_url: { detail: 'low' | 'high' | 'auto' | undefined };
    };

    // must be exactly "low" — not "high", "auto", undefined, or any other string
    const detail: 'low' | 'high' | 'auto' | undefined = part.image_url.detail;
    expect(detail).toBe('low');
  });

  it('leaves text parts unchanged', () => {
    const messages = [
      {
        role: 'user' as const,
        content: [{ type: 'text' as const, text: 'hello' }],
      },
    ];

    const result = applyLowDetailToImages(messages);
    expect(result[0].content[0]).toEqual({ type: 'text', text: 'hello' });
  });

  it('leaves string-content messages unchanged', () => {
    const messages = [{ role: 'user' as const, content: 'plain text' }];
    const result = applyLowDetailToImages(messages);
    expect(result[0].content).toBe('plain text');
  });

  it('throws for non-data non-https image URLs', () => {
    const messages = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'image_url' as const,
            image_url: { url: 'http://insecure.com/img.png' },
          },
        ],
      },
    ];

    expect(() => applyLowDetailToImages(messages)).toThrow(
      'image_url must be a data: or https: URL',
    );
  });
});
