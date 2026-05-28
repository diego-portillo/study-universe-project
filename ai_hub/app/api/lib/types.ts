import type { Message, Provider } from '../../types';

export type {
  Provider,
  TextPart,
  ImageUrlPart,
  MessageContent,
  Message,
  Mode,
  SpeechVoice,
} from '../../types';

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
