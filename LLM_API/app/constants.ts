import type { Message } from './types';

import type { ModelOption } from './types';

export const MAX_PROMPT_CHARS = 2000;

export const MAX_AUDIO_LENGTH = 60;

export const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content:
    'You are a helpful, concise assistant. Keep answers short. For audio only transcribe.',
};

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'openai' },
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
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', provider: 'anthropic' },
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0];
