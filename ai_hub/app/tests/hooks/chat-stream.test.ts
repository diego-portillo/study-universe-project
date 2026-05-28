import { describe, it, expect } from 'vitest';

// These tests document the chat stream format contract between the server
// (api/chat/route.ts → toTextStreamResponse) and the client parser (useChat.ts).
//
// Root cause of the original bug: the server returned plain text chunks but the
// client parsed the AI SDK *data stream* format (lines prefixed with `0:"`).
// Plain text never matched, so assistantText stayed empty and nothing rendered.

describe('chat stream format — plain text', () => {
  it('accumulates plain text chunks into a full response', async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const chunks = ['Hello', ', ', 'world', '!'];

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const c of chunks) controller.enqueue(encoder.encode(c));
        controller.close();
      },
    });

    let result = '';
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // this is exactly what useChat.ts does now
      result += decoder.decode(value, { stream: true });
    }

    expect(result).toBe('Hello, world!');
  });

  // Regression: shows why the old parser silently dropped all text.
  it('old 0: parser yields empty string for plain text (documents the bug)', () => {
    const plainText = 'Hello, world!';
    let accumulated = '';

    for (const line of plainText.split('\n')) {
      if (line.startsWith('0:')) {
        const match = line.match(/^0:"(.*)"/);
        if (match) accumulated += match[1];
      }
    }

    // plain text has no 0: prefix → nothing is ever captured
    expect(accumulated).toBe('');
  });

  it('handles multi-line responses correctly', async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const text = 'Line one\nLine two\nLine three';

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // simulate chunk boundaries that split mid-line
        controller.enqueue(encoder.encode('Line one\nLine'));
        controller.enqueue(encoder.encode(' two\nLine three'));
        controller.close();
      },
    });

    let result = '';
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    expect(result).toBe(text);
  });
});
