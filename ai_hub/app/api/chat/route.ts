import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { applyLowDetailToImages, messagesIncludeVision } from '../lib/messages';
import { estimateCostUsd } from '../lib/cost';
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

// Provider stream errors aren't always Error instances — e.g. OpenAI's hosted-tool
// stream emits rate-limit failures as a plain { error: { message, code, ... } }
// object, which String() collapses to "[object Object]" and loses the message.
function describeStreamError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const nested = (error as Record<string, unknown>).error;
    if (nested && typeof nested === 'object' && typeof (nested as Record<string, unknown>).message === 'string') {
      return (nested as Record<string, unknown>).message as string;
    }
    if (typeof (error as Record<string, unknown>).message === 'string') {
      return (error as Record<string, unknown>).message as string;
    }
    try {
      return JSON.stringify(error);
    } catch {
      // fall through to String() below
    }
  }
  return String(error);
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

  let normalized: Message[];
  try {
    normalized = applyLowDetailToImages(messages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }

  try {
    const fullMessages = [...previous, ...normalized];

    const systemPrompt = extractSystemPrompt(fullMessages);
    const aiMessages = toAISDKMessages(fullMessages).filter((m) =>
      typeof m.content === 'string'
        ? m.content.trim().length > 0
        : Array.isArray(m.content) && m.content.length > 0,
    );

    if (aiMessages.length === 0)
      return new Response(
        JSON.stringify({ error: 'messages must contain non-empty content' }),
        { status: 400 },
      );

    const maxTokens =
      provider === 'anthropic'
        ? Math.min(4096, Math.max(64, Number(process.env.ANTHROPIC_MAX_TOKENS) || 1024))
        : undefined;

    let modelId: string;
    let resolvedModel;
    let tools: Parameters<typeof streamText>[0]['tools'];

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }),
          { status: 500 },
        );

      modelId = model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
      resolvedModel = anthropic(modelId);
      tools = { web_search: anthropic.tools.webSearch_20250305({ maxUses: 3 }) };
    } else if (provider === 'google') {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' }),
          { status: 500 },
        );

      modelId = model ?? process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview';
      resolvedModel = google(modelId);
      tools = { google_search: google.tools.googleSearch({}) };
    } else {
      if (!process.env.OPENAI_API_KEY)
        return new Response(
          JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
          { status: 500 },
        );

      const hasVision = messagesIncludeVision(normalized);
      const defaultModel = hasVision
        ? (process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini')
        : (process.env.OPENAI_MODEL ?? 'gpt-4o-mini');

      modelId = model ?? defaultModel;
      resolvedModel = openai(modelId);
      tools = { web_search: openai.tools.webSearch({ searchContextSize: 'low' }) };
    }

    const startTime = Date.now();

    const result = streamText({
      model: resolvedModel,
      system: systemPrompt,
      messages: aiMessages,
      tools,
      maxOutputTokens: maxTokens,
      onError: ({ error }) => {
        console.error(`[api/chat] ${provider} stream error:`, describeStreamError(error));
      },
      onFinish: ({ text, usage }) => {
        const updated = [...fullMessages, { role: 'assistant' as const, content: text }];
        memoryStore.set(conversationId, updated.slice(-MAX_MESSAGES));

        const inputTokens = usage.inputTokens ?? 0;
        const outputTokens = usage.outputTokens ?? 0;
        const estimatedCostUsd = estimateCostUsd(modelId, inputTokens, outputTokens);

        console.log(JSON.stringify({
          event: 'chat_completion',
          provider,
          model: modelId,
          conversationId,
          tokens_in: inputTokens,
          tokens_out: outputTokens,
          latency_ms: Date.now() - startTime,
          estimated_cost_usd: estimatedCostUsd,
        }));
      },
    });

    // toTextStreamResponse() commits a 200 response synchronously, before the
    // provider call resolves, so a stream error can't change the status here.
    // Its textStream also silently drops error parts, which left callers with
    // a blank 200 body on provider failures (e.g. quota errors). Build the
    // response from fullStream instead so error parts render as visible text.
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === 'error') {
            controller.enqueue(encoder.encode(`\n\n[Error: ${describeStreamError(part.error)}]`));
          }
        }
        controller.close();
      },
    });
    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[api/chat] ${provider} error:`, message);
    return new Response(
      JSON.stringify({ error: 'Upstream provider error' }),
      { status: 502 },
    );
  }
}
