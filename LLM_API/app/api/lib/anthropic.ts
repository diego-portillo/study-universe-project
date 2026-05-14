import Anthropic from '@anthropic-ai/sdk';
import type { Message, ChatResult, TextPart, ImageUrlPart } from './types';

export const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function extractSystemPrompt(messages: Message[]): string | undefined {
  const sys = messages.find((m) => m.role === 'system');
  return typeof sys?.content === 'string' ? sys.content : undefined;
}

export function toAnthropicMessages(
  messages: Message[],
): Anthropic.MessageParam[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (typeof m.content === 'string') {
        return { role: m.role as 'user' | 'assistant', content: m.content };
      }
      const parts = m.content.map((part) => {
        if (part.type === 'text')
          return { type: 'text' as const, text: part.text };
        const url = (part as ImageUrlPart).image_url.url;
        const matches = url.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return { type: 'text' as const, text: '[image]' };
        const [, mediaType, data] = matches;
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mediaType as
              | 'image/jpeg'
              | 'image/png'
              | 'image/gif'
              | 'image/webp',
            data,
          },
        };
      });
      return { role: m.role as 'user' | 'assistant', content: parts };
    });
}

export async function runAnthropicChat(
  messages: Message[],
  model: string,
  maxTokens: number,
): Promise<ChatResult> {
  const system = extractSystemPrompt(messages);
  const anthropicMessages = toAnthropicMessages(messages);

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: anthropicMessages,
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const text = textBlock?.type === 'text' ? textBlock.text : '';

  return { message: { role: 'assistant', content: text } };
}
