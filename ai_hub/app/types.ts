export type Mode = 'chat' | 'image' | 'audio';

export type AudioProvider = 'openai' | 'elevenlabs';

export type SpeechVoice =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer';

export type TextPart = {
  type: 'text';
  text: string;
};

export type ImageUrlPart = {
  type: 'image_url';
  image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
};

export type MessageContent = string | Array<TextPart | ImageUrlPart>;

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
};

export type Provider = 'openai' | 'anthropic' | 'google' | 'elevenlabs';

export interface ModelOption {
  id: string;
  label: string;
  provider: Provider;
}

export type ProviderErrorKind =
  | 'rate_limit'
  | 'quota'
  | 'missing_key'
  | 'network'
  | 'empty_response'
  | 'unknown';

export type ProviderError = {
  kind: ProviderErrorKind;
  provider: Provider;
  message: string;
};
