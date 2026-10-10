// Prices in USD per 1M tokens (input / output).
// Sources: provider pricing pages as of Jun 2026, demo-mode cheap models
// added Oct 2026 (see app/api/lib/demoMode.ts) from each provider's own
// current pricing page.
// Add new models here when MODEL_OPTIONS in constants.ts is updated.
const COST_PER_1M: Record<string, { in: number; out: number }> = {
  // OpenAI
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-5.4-nano': { in: 0.2, out: 1.25 },
  'gpt-5-nano': { in: 0.05, out: 0.4 },
  // Anthropic
  'claude-sonnet-4-6': { in: 3, out: 15 },
  'claude-haiku-4-5-20251001': { in: 1, out: 5 },
  'claude-haiku-5-5': { in: 0.1, out: 0.5 }, // ≤100k-token prompts; demo conversations stay well under that
  // Google
  'gemini-3-flash-preview': { in: 0.5, out: 3 },
  'gemini-3.5-flash-lite': { in: 0.3, out: 2.5 },
};

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const rate = COST_PER_1M[model];
  if (!rate) return null;
  return (inputTokens * rate.in + outputTokens * rate.out) / 1_000_000;
}
