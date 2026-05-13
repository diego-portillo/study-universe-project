export type Provider = 'openai' | 'anthropic';

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

export type ChatBody = {
  messages: Message[];
  conversationId?: string;
  model?: string;
  provider?: Provider;
  reset?: boolean;
};

export type ChatResult = {
  message: Message;
};

export type ImageRequestBody = {
  prompt?: string;
};
