import OpenAI from 'openai';
import type { Message, ChatResult } from './types';

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runOpenAIChat(
  messages: Message[],
  model: string,
  maxTokens: number,
): Promise<ChatResult> {
  const completion = await openaiClient.chat.completions.create({
    model,
    messages: messages as OpenAI.ChatCompletionMessageParam[],
    max_completion_tokens: maxTokens,
  });

  const choice = completion.choices?.[0]?.message;
  if (!choice) throw new Error('Empty model response');

  return {
    message: { role: 'assistant', content: choice.content ?? '' },
  };
}
