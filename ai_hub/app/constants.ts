import type { Message, ModelOption, AudioProvider } from './types';
export const MAX_PROMPT_CHARS = 2000;
export const MAX_AUDIO_LENGTH = 60;

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

export const MODEL_OPTIONS: ModelOption[] = [
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

export const DEFAULT_MODEL = MODEL_OPTIONS[0];

export const UNSUPPORTED_IMAGE_PROVIDERS =
  'Anthropic, Google, ElevenLabs' as const;
export const UNSUPPORTED_AUDIO_PROVIDERS = 'Anthropic, Google' as const;

export const AUDIO_PROVIDER_OPTIONS: { id: AudioProvider; label: string }[] = [
  { id: 'openai', label: 'OpenAI Whisper / TTS' },
  { id: 'elevenlabs', label: 'ElevenLabs TTS / Scribe V2' },
];

export const DEFAULT_AUDIO_PROVIDER: AudioProvider = 'openai';
