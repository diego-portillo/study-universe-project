import type { MetricsSnapshot, SessionMetrics } from '../api/lib/metrics';

function formatCost(costUsd: number | null): string {
  if (costUsd === null) return '—';
  return `$${costUsd.toFixed(4)}`;
}

function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  return `${Math.round(ms)} ms`;
}

function formatTokensPerSec(tokensPerSec: number | null): string {
  if (tokensPerSec === null) return '—';
  return `${tokensPerSec.toFixed(1)} tok/s`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function SessionRow({ session }: { session: SessionMetrics }) {
  return (
    <tr>
      <td title={session.conversationId} className="conversation-id">
        {session.conversationId.slice(0, 8)}
      </td>
      <td>{session.requestCount}</td>
      <td>{session.totalTokensIn}</td>
      <td>{session.totalTokensOut}</td>
      <td>{formatCost(session.totalCostUsd)}</td>
      <td>{formatMs(session.avgTtftMs)}</td>
      <td>{formatTokensPerSec(session.avgTokensPerSec)}</td>
    </tr>
  );
}

export function MetricsView({ snapshot }: { snapshot: MetricsSnapshot }) {
  return (
    <>
      <div className="stat-grid">
        <StatTile label="Sessions" value={String(snapshot.summary.sessionCount)} />
        <StatTile label="Requests" value={String(snapshot.summary.requestCount)} />
        <StatTile label="Total cost" value={formatCost(snapshot.summary.totalCostUsd)} />
        <StatTile label="Avg TTFT" value={formatMs(snapshot.summary.avgTtftMs)} />
        <StatTile
          label="Avg throughput"
          value={formatTokensPerSec(snapshot.summary.avgTokensPerSec)}
        />
      </div>

      {snapshot.sessions.length === 0 ? (
        <p className="metrics-empty">
          No completions recorded yet — send a chat message, then refresh.
        </p>
      ) : (
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Requests</th>
              <th>Tokens in</th>
              <th>Tokens out</th>
              <th>Cost</th>
              <th>Avg TTFT</th>
              <th>Avg throughput</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.sessions.map((session) => (
              <SessionRow key={session.conversationId} session={session} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
