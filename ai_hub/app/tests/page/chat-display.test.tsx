import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Page from '../../page';

// jsdom does not implement scrollIntoView — stub it out so the useEffect
// in Page doesn't throw when messages change.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const AI_RESPONSE = 'Hello! How can I assist you today?';

// Intercept POST /api/chat and return a plain text stream (same format as
// toTextStreamResponse() from the AI SDK v6 used in the real route).
const server = setupServer(
  http.post('http://localhost/api/chat', () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(AI_RESPONSE));
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Chat UI — AI response display', () => {
  it('shows the AI response text in the chat after a 200 plain-text stream', async () => {
    render(<Page />);

    // type a user message
    const textarea = screen.getByPlaceholderText('Ask anything...');
    await userEvent.type(textarea, 'Hello');

    // click send
    const sendBtn = screen.getByTitle('Send');
    await userEvent.click(sendBtn);

    // user message appears first
    expect(await screen.findByText('Hello')).toBeInTheDocument();

    // AI response text must appear in the DOM
    await waitFor(
      () => {
        expect(screen.getByText(AI_RESPONSE)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('does not show AI text when the API returns a non-200 status', async () => {
    // override the handler for this test only
    server.use(
      http.post('http://localhost/api/chat', () => {
        return HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        );
      }),
    );

    render(<Page />);

    const textarea = screen.getByPlaceholderText('Ask anything...');
    await userEvent.type(textarea, 'Hello');
    await userEvent.click(screen.getByTitle('Send'));

    // error message should appear instead of AI text
    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
    });

    // the AI response text must NOT be in the DOM
    expect(screen.queryByText(AI_RESPONSE)).not.toBeInTheDocument();
  });
});
