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

// jsdom does not implement Object URLs — onPickAudio and the TTS flow both
// call URL.createObjectURL/revokeObjectURL.
let urlCounter = 0;
URL.createObjectURL = vi.fn(
  () => `blob:mock-${urlCounter++}`,
) as typeof URL.createObjectURL;
URL.revokeObjectURL = vi.fn();

// jsdom never loads media, so <audio>'s `loadedmetadata` event never fires and
// `duration` is always NaN. onPickAudio awaits `loadedmetadata` to read
// `duration`, so simulate both for every media element.
Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  configurable: true,
  get: () => 1,
});
const srcDescriptor = Object.getOwnPropertyDescriptor(
  window.HTMLMediaElement.prototype,
  'src',
)!;
Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
  configurable: true,
  get: srcDescriptor.get,
  set(this: HTMLMediaElement, value: string) {
    srcDescriptor.set!.call(this, value);
    queueMicrotask(() => {
      this.onloadedmetadata?.(new Event('loadedmetadata'));
    });
  },
});

const server = setupServer(
  http.post('http://localhost/api/text_to_audio', () => {
    // A plain string body — the test only needs res.blob() to resolve, and a
    // Blob body here breaks under Node 20 + jsdom (Blob.stream() missing,
    // which msw's HttpResponse/undici Response needs to extract the body).
    return new HttpResponse('fake-audio', {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Audio mode — generated audio player reset', () => {
  it('clears the previous generated-audio player when a new file is picked', async () => {
    const { container } = render(<Page />);

    await userEvent.click(screen.getByText('🔊 Audio'));

    // Generate TTS audio — this populates the "Generated Audio" player.
    const textarea = screen.getByPlaceholderText(
      'Enter text to convert to speech...',
    );
    await userEvent.type(textarea, 'Hello world');
    await userEvent.click(screen.getByTitle('Send'));

    await waitFor(() => {
      expect(container.querySelector('audio.audio-player')).toHaveAttribute(
        'src',
        'blob:mock-0',
      );
    });

    // Now pick a new audio file to transcribe.
    const fileInput = container.querySelector(
      'input[type="file"][accept="audio/*"]',
    ) as HTMLInputElement;
    const file = new File(['audio-bytes'], 'second-recording.webm', {
      type: 'audio/webm',
    });
    await userEvent.upload(fileInput, file);

    // The stale "Generated Audio" player must be gone, not still showing the
    // first blob src.
    await waitFor(() => {
      expect(container.querySelector('audio.audio-player')).not.toBeInTheDocument();
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-0');

    // The newly picked file is now the active attachment.
    expect(await screen.findByText('second-recording.webm')).toBeInTheDocument();
  });
});
