import { getMetricsSnapshot } from '../lib/metrics';

export async function GET() {
  return Response.json(getMetricsSnapshot());
}
