import type { Message, ModelOption, AudioProvider, Provider, ProviderErrorKind } from './types';
export const MAX_PROMPT_CHARS = 2000;
export const MAX_AUDIO_LENGTH = 60;

// Bump when the wording below changes, so cost/metrics logs can be
// correlated with which prompt produced them.
export const PROMPT_VERSION = 'v1';

export function makeSystemMessage(modelLabel: string): Message {
  return {
    role: 'system',
    content: `You are a helpful, concise assistant. Keep answers short. You are currently running as ${modelLabel}.`,
  };
}

export const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  elevenlabs: 'ElevenLabs',
};

export const UNSUPPORTED_AUDIO_TEXT_PROVIDERS = 'Anthropic, Google' as const;

// Google billing is opt-in, so the provider is hidden unless explicitly enabled —
// the public demo deployment leaves this unset (and GOOGLE_GENERATIVE_AI_API_KEY
// unset) to avoid taking on Google API cost. Set to "true" in .env.local for
// local dev.
const GOOGLE_PROVIDER_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PROVIDER === 'true';

const ALL_MODEL_OPTIONS: ModelOption[] = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai' },
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    provider: 'anthropic',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku 4.5',
    provider: 'anthropic',
  },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', provider: 'google' },
  {
    id: 'elevenlabs-tts',
    label: 'ElevenLabs TTS / Scribe V2',
    provider: 'elevenlabs',
  },
];

export const MODEL_OPTIONS: ModelOption[] = GOOGLE_PROVIDER_ENABLED
  ? ALL_MODEL_OPTIONS
  : ALL_MODEL_OPTIONS.filter((model) => model.provider !== 'google');

export const DEFAULT_MODEL = MODEL_OPTIONS[0];

export const UNSUPPORTED_IMAGE_PROVIDERS =
  'Anthropic, Google, ElevenLabs' as const;
export const UNSUPPORTED_AUDIO_PROVIDERS = 'Anthropic, Google' as const;

export const AUDIO_PROVIDER_OPTIONS: { id: AudioProvider; label: string }[] = [
  { id: 'openai', label: 'OpenAI Whisper / TTS' },
  { id: 'elevenlabs', label: 'ElevenLabs TTS / Scribe V2' },
];

export const DEFAULT_AUDIO_PROVIDER: AudioProvider = 'openai';

export const PROVIDER_ERROR_TITLES: Record<ProviderErrorKind, string> = {
  rate_limit: 'Rate limit reached',
  quota: 'Quota exceeded',
  missing_key: 'Provider not configured',
  network: 'Network error',
  empty_response: 'No response received',
  unknown: 'Request failed',
};

// Chat mode supports openai/anthropic/google — picks the first other chat
// provider in MODEL_OPTIONS order so a failing provider always has a suggested
// fallback (elevenlabs is audio-only and never eligible here).
export function nextChatModel(currentProvider: Provider): ModelOption | undefined {
  return MODEL_OPTIONS.find(
    (model) => model.provider !== currentProvider && model.provider !== 'elevenlabs',
  );
}

// Audio mode only ever runs on openai or elevenlabs (see UNSUPPORTED_AUDIO_PROVIDERS),
// so the fallback is just the other of the two.
export function nextAudioModel(currentProvider: Provider): ModelOption | undefined {
  const fallbackProvider = currentProvider === 'elevenlabs' ? 'openai' : 'elevenlabs';
  return MODEL_OPTIONS.find((model) => model.provider === fallbackProvider);
}
