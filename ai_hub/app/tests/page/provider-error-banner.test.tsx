import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Page from '../../page';

// jsdom does not implement scrollIntoView — stub it out so the useEffect
// in Page doesn't throw when messages change.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Same 429 shape captured from the Aug 28, 2026 all-provider eval run
// (evals/results/2026-08-28T18-05-14-036Z.json).
const RATE_LIMIT_MESSAGE =
  '429 Rate limit reached for gpt-4.1-mini in organization org-xyz on requests per day (RPD): Limit 50, Used 50, Requested 1.';

const server = setupServer(
  http.post('http://localhost/api/chat', () =>
    HttpResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Per-provider error boundary', () => {
  it('shows a provider-tagged banner with a fallback switch on a rate-limit failure', async () => {
    render(<Page />);

    const textarea = screen.getByPlaceholderText('Ask anything...');
    await userEvent.type(textarea, 'Hello');
    await userEvent.click(screen.getByTitle('Send'));

    await waitFor(() => {
      expect(screen.getByText('Rate limit reached')).toBeInTheDocument();
    });
    expect(screen.getByText(RATE_LIMIT_MESSAGE)).toBeInTheDocument();

    // default model is OpenAI's — fallback should offer the next chat provider
    const switchBtn = screen.getByRole('button', {
      name: /switch to claude sonnet 4\.6/i,
    });

    await userEvent.click(switchBtn);

    // switching clears the banner and actually changes the active model
    expect(screen.queryByText('Rate limit reached')).not.toBeInTheDocument();
    expect(screen.getByLabelText('anthropic')).toBeInTheDocument();
  });

  it('unpacks a mid-stream provider error instead of rendering it as the AI reply', async () => {
    // Reproduces the real Aug 28, 2026 Gemini failure: route.ts already committed
    // a 200 status before the provider call resolved, so the failure arrives
    // embedded in an otherwise-200 stream body, not as a non-ok response.
    const embeddedError =
      '\n\n[Error: Failed after 3 attempts. Last error: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. ]';
    server.use(
      http.post('http://localhost/api/chat', () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode(embeddedError));
            controller.close();
          },
        });
        return new HttpResponse(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }),
    );

    render(<Page />);

    const textarea = screen.getByPlaceholderText('Ask anything...');
    await userEvent.type(textarea, 'Hello');
    await userEvent.click(screen.getByTitle('Send'));

    await waitFor(() => {
      expect(screen.getByText('Quota exceeded')).toBeInTheDocument();
    });

    // the raw "[Error: ...]" text must never appear as if the AI said it
    expect(screen.queryByText(/\[Error:/)).not.toBeInTheDocument();
  });

  it('dismisses the banner without changing the selected model', async () => {
    render(<Page />);

    const textarea = screen.getByPlaceholderText('Ask anything...');
    await userEvent.type(textarea, 'Hello');
    await userEvent.click(screen.getByTitle('Send'));

    await waitFor(() => {
      expect(screen.getByText('Rate limit reached')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Dismiss'));

    expect(screen.queryByText('Rate limit reached')).not.toBeInTheDocument();
    expect(screen.getByLabelText('openai')).toBeInTheDocument();
  });
});
