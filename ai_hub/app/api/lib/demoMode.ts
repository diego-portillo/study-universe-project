export function isPublicDemoMode(): boolean {
  return process.env.PUBLIC_DEMO_MODE === 'true';
}

const DEFAULT_DEMO_DAILY_TOKEN_CAP = 150_000;

export function demoDailyTokenCap(): number {
  return Number(process.env.DEMO_DAILY_TOKEN_CAP) || DEFAULT_DEMO_DAILY_TOKEN_CAP;
}

// Cheapest currently-active (non-deprecated, non-restricted) model per
// provider as of Oct 2026 — see chat route usage for rationale. Forced
// regardless of vision/tool needs when demo mode is on; an unsupported input
// failing is an accepted tradeoff for a public demo (see demoMode.ts callers).
const DEMO_CHEAP_MODEL_BY_PROVIDER = {
  openai: 'gpt-5-nano',
  anthropic: 'claude-haiku-5-5',
  google: 'gemini-3.5-flash-lite',
} as const;

export function demoCheapModel(provider: keyof typeof DEMO_CHEAP_MODEL_BY_PROVIDER): string {
  return DEMO_CHEAP_MODEL_BY_PROVIDER[provider];
}
