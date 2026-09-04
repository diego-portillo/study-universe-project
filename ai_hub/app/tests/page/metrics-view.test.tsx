import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsView } from '../../metrics/MetricsView';
import type { MetricsSnapshot } from '../../api/lib/metrics';

const emptySnapshot: MetricsSnapshot = {
  summary: {
    sessionCount: 0,
    requestCount: 0,
    totalCostUsd: null,
    avgTtftMs: null,
    avgTokensPerSec: null,
  },
  sessions: [],
};

describe('MetricsView', () => {
  it('shows an empty state when no sessions have been recorded', () => {
    render(<MetricsView snapshot={emptySnapshot} />);
    expect(screen.getByText(/no completions recorded yet/i)).toBeInTheDocument();
  });

  it('renders session rows and formatted stat tiles', () => {
    const snapshot: MetricsSnapshot = {
      summary: {
        sessionCount: 1,
        requestCount: 2,
        totalCostUsd: 0.0034,
        avgTtftMs: 150,
        avgTokensPerSec: 42.5,
      },
      sessions: [
        {
          conversationId: 'abcdef1234',
          requestCount: 2,
          totalTokensIn: 30,
          totalTokensOut: 60,
          totalCostUsd: 0.0034,
          avgTtftMs: 150,
          avgTokensPerSec: 42.5,
        },
      ],
    };

    render(<MetricsView snapshot={snapshot} />);

    // summary tiles and the single session row show the same numbers here,
    // so each formatted value legitimately appears twice.
    expect(screen.getAllByText('$0.0034')).toHaveLength(2);
    expect(screen.getAllByText('150 ms')).toHaveLength(2);
    expect(screen.getAllByText('42.5 tok/s')).toHaveLength(2);
    expect(screen.getByText('abcdef12')).toBeInTheDocument();
  });
});
