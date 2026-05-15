import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message, ChatResult } from './types';

export const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? '',
);

export function toGeminiMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user', // Gemini uses "model" not "assistant"
      parts:
        typeof m.content === 'string'
          ? [{ text: m.content }]
          : m.content.map((part) => {
              if (part.type === 'text') return { text: part.text };
              // Base64 image
              const url = part.image_url.url;
              const matches = url.match(/^data:(.+);base64,(.+)$/);
              if (!matches) return { text: '[image]' };
              const [, mimeType, data] = matches;
              return { inlineData: { mimeType, data } };
            }),
    }));
}

export function extractSystemPrompt(messages: Message[]): string | undefined {
  const sys = messages.find((m) => m.role === 'system');
  return typeof sys?.content === 'string' ? sys.content : undefined;
}

export async function runGeminiChat(
  messages: Message[],
  model: string,
  maxTokens: number,
): Promise<ChatResult> {
  const systemPrompt = extractSystemPrompt(messages);
  const history = toGeminiMessages(messages);

  // Last message is the current user turn — Gemini sends it separately
  const lastMessage = history.pop();
  if (!lastMessage) throw new Error('No user message found');

  const geminiModel = geminiClient.getGenerativeModel({
    model,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  });

  const chat = geminiModel.startChat({
    history,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const result = await chat.sendMessage(lastMessage.parts);
  const text = result.response.text();

  return { message: { role: 'assistant', content: text } };
}
