export type Mode = 'chat' | 'image' | 'audio';

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

export type Provider = 'openai' | 'anthropic';

export interface ModelOption {
  id: string;
  label: string;
  provider: Provider;
}
