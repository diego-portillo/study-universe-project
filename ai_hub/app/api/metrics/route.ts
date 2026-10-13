import { getMetricsSnapshot } from '../lib/metrics';
import { isPublicDemoMode } from '../lib/demoMode';

// Metrics expose aggregate cost/usage across every visitor's sessions, with
// no auth — fine for local/internal use, not for a publicly-reachable demo.
export async function GET() {
  if (isPublicDemoMode()) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(getMetricsSnapshot());
}
