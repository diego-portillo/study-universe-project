import { getMetricsSnapshot } from '../api/lib/metrics';
import { MetricsView } from './MetricsView';
import { RefreshButton } from './RefreshButton';
import './metrics.css';

// This reads a mutable in-memory store that changes as chat completions
// happen, not cookies/headers/params — Next can't infer dynamism on its own,
// so without this the page gets prerendered once at build time and the
// snapshot freezes on empty (see build output: "/metrics" was "○ (Static)").
export const dynamic = 'force-dynamic';

export default function MetricsPage() {
  const snapshot = getMetricsSnapshot();

  return (
    <div className="metrics-layout">
      <header className="metrics-header">
        <h1>Session Metrics</h1>
        <RefreshButton />
      </header>
      <MetricsView snapshot={snapshot} />
    </div>
  );
}
