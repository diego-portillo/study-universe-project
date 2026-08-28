import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../../page';

// jsdom does not implement scrollIntoView — stub it out so the useEffect
// in Page doesn't throw when messages change.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// jsdom does not implement navigator.mediaDevices at all.
Object.defineProperty(window.navigator, 'mediaDevices', {
  configurable: true,
  value: {
    getUserMedia: vi
      .fn()
      .mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError'),
      ),
  },
});

describe('Audio mode — microphone permission errors', () => {
  it('shows a visible error when getUserMedia is rejected', async () => {
    render(<Page />);

    await userEvent.click(screen.getByText('🔊 Audio'));
    await userEvent.click(screen.getByTitle('Record audio'));

    await waitFor(() => {
      expect(
        screen.getByText('Microphone permission denied or unavailable'),
      ).toBeInTheDocument();
    });
  });
});
