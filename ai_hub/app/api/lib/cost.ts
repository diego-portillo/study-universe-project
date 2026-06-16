// Prices in USD per 1M tokens (input / output).
// Sources: provider pricing pages as of Jun 2026.
// Add new models here when MODEL_OPTIONS in constants.ts is updated.
const COST_PER_1M: Record<string, { in: number; out: number }> = {
  // OpenAI
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-5.4-nano': { in: 0.2, out: 1.25 },
  // Anthropic
  'claude-sonnet-4-6': { in: 3, out: 15 },
  'claude-haiku-4-5-20251001': { in: 1, out: 5 },
  // Google
  'gemini-3-flash-preview': { in: 0.5, out: 3 },
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
