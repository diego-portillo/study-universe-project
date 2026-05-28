import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { applyLowDetailToImages, messagesIncludeVision } from '../lib/messages';
import type { ChatBody } from '../lib/types';
import type { Message } from '../../types';

const MAX_MESSAGES = 8;
const memoryStore = new Map<string, Message[]>();

import type { ModelMessage } from 'ai';

function toAISDKMessages(messages: Message[]): ModelMessage[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (typeof m.content === 'string') {
        return { role: m.role as 'user' | 'assistant', content: m.content };
      }

      const parts = m.content.map((part) => {
        if (part.type === 'text') {
          return { type: 'text' as const, text: part.text };
        }
        return {
          type: 'image' as const,
          image: part.image_url.url,
        };
      });

      // multipart is always user — assistants don't send images
      return { role: 'user' as const, content: parts };
    });
}

function extractSystemPrompt(messages: Message[]): string | undefined {
  const sys = messages.find((m) => m.role === 'system');
  if (!sys) return undefined;
  if (typeof sys.content === 'string' && sys.content.trim().length > 0) {
    return sys.content;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
    });
  }

  const {
    messages,
    conversationId = 'default',
    provider = 'openai',
    model,
    reset,
  } = body;

  if (!Array.isArray(messages) || messages.length === 0)
    return new Response(
      JSON.stringify({ error: 'messages must be a non-empty array' }),
      { status: 400 },
    );

  if (reset) memoryStore.delete(conversationId);

  const previous = memoryStore.get(conversationId) ?? [];

  try {
    const normalized = applyLowDetailToImages(messages);
    const fullMessages = [...previous, ...normalized];

    const systemPrompt = extractSystemPrompt(fullMessages);
    const aiMessages = toAISDKMessages(fullMessages).filter((m) =>
      typeof m.content === 'string'
        ? m.content.trim().length > 0
        : Array.isArray(m.content) && m.content.length > 0,
    );

    const maxTokens =
      provider === 'anthropic'
        ? Math.min(4096, Math.max(64, Number(process.env.ANTHROPIC_MAX_TOKENS) || 1024))
        : undefined;

    let resolvedModel;

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }),
          { status: 500 },
        );

      resolvedModel = anthropic(
        model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
      );
    } else if (provider === 'google') {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' }),
          { status: 500 },
        );

      resolvedModel = google(
        model ?? process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      );
    } else {
      if (!process.env.OPENAI_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
          { status: 500 },
        );

      const hasVision = messagesIncludeVision(normalized);
      const defaultModel = hasVision
        ? (process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini')
        : (process.env.OPENAI_MODEL ?? 'gpt-4o');

      resolvedModel = openai(model ?? defaultModel);
    }

    const result = streamText({
      model: resolvedModel,
      system: systemPrompt,
      messages: aiMessages,
      maxOutputTokens: maxTokens,
      onFinish: ({ text }) => {
        const updated = [...fullMessages, { role: 'assistant' as const, content: text }];
        memoryStore.set(conversationId, updated.slice(-MAX_MESSAGES));
      },
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[api/chat] ${provider} error:`, message);
    return new Response(
      JSON.stringify({ error: 'Upstream provider error' }),
      { status: 502 },
    );
  }
}
