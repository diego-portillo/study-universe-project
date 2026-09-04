import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { applyLowDetailToImages, messagesIncludeVision } from '../lib/messages';
import { estimateCostUsd } from '../lib/cost';
import { recordCompletion } from '../lib/metrics';
import { PROMPT_VERSION } from '../../constants';
import type { ChatBody } from '../lib/types';
import type { Message } from '../../types';

const MAX_MESSAGES = 8;
const memoryStore = new Map<string, Message[]>();

import type { ModelMessage } from 'ai';

function toAISDKMessages(messages: Message[]): ModelMessage[] {
  return messages
    .filter((message) => message.role !== 'system')
    .map((message) => {
      if (typeof message.content === 'string') {
        return { role: message.role as 'user' | 'assistant', content: message.content };
      }

      const parts = message.content.map((part) => {
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
  const systemMessage = messages.find((message) => message.role === 'system');
  if (!systemMessage) return undefined;
  if (typeof systemMessage.content === 'string' && systemMessage.content.trim().length > 0) {
    return systemMessage.content;
  }
  return undefined;
}

function missingApiKeyResponse(envVarName: string): Response {
  return new Response(JSON.stringify({ error: `Missing ${envVarName}` }), {
    status: 500,
  });
}

type ProviderConfig = {
  modelId: string;
  resolvedModel: ReturnType<typeof anthropic> | ReturnType<typeof google> | ReturnType<typeof openai>;
  tools: Parameters<typeof streamText>[0]['tools'];
};

function resolveProvider(
  provider: ChatBody['provider'],
  model: string | undefined,
  normalizedMessages: Message[],
): ProviderConfig | Response {
  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) return missingApiKeyResponse('ANTHROPIC_API_KEY');

    const modelId = model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
    return {
      modelId,
      resolvedModel: anthropic(modelId),
      tools: { web_search: anthropic.tools.webSearch_20250305({ maxUses: 3 }) },
    };
  }

  if (provider === 'google') {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      return missingApiKeyResponse('GOOGLE_GENERATIVE_AI_API_KEY');

    const modelId = model ?? process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview';
    return {
      modelId,
      resolvedModel: google(modelId),
      tools: { google_search: google.tools.googleSearch({}) },
    };
  }

  if (!process.env.OPENAI_API_KEY) return missingApiKeyResponse('OPENAI_API_KEY');

  const hasVision = messagesIncludeVision(normalizedMessages);
  const defaultModel = hasVision
    ? (process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini')
    : (process.env.OPENAI_MODEL ?? 'gpt-4o-mini');
  const modelId = model ?? defaultModel;

  return {
    modelId,
    resolvedModel: openai(modelId),
    tools: { web_search: openai.tools.webSearch({ searchContextSize: 'low' }) },
  };
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
    const aiMessages = toAISDKMessages(fullMessages).filter((message) =>
      typeof message.content === 'string'
        ? message.content.trim().length > 0
        : Array.isArray(message.content) && message.content.length > 0,
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

    const providerConfig = resolveProvider(provider, model, normalized);
    if (providerConfig instanceof Response) return providerConfig;
    const { modelId, resolvedModel, tools } = providerConfig;

    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    let firstTokenTime: number | null = null;

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
        const latencyMs = Date.now() - startTime;
        const ttftMs = firstTokenTime !== null ? firstTokenTime - startTime : null;
        const generationMs = firstTokenTime !== null ? Date.now() - firstTokenTime : latencyMs;
        const tokensPerSec =
          generationMs > 0 ? outputTokens / (generationMs / 1000) : null;

        console.log(JSON.stringify({
          event: 'chat_completion',
          request_id: requestId,
          provider,
          model: modelId,
          prompt_version: PROMPT_VERSION,
          conversationId,
          tokens_in: inputTokens,
          tokens_out: outputTokens,
          latency_ms: latencyMs,
          ttft_ms: ttftMs,
          tokens_per_sec: tokensPerSec,
          estimated_cost_usd: estimatedCostUsd,
        }));

        recordCompletion({
          conversationId,
          requestId,
          provider,
          model: modelId,
          promptVersion: PROMPT_VERSION,
          ttftMs,
          latencyMs,
          tokensIn: inputTokens,
          tokensOut: outputTokens,
          tokensPerSec,
          costUsd: estimatedCostUsd,
          timestamp: new Date().toISOString(),
        });
      },
    });

    // toTextStreamResponse() commits a 200 response synchronously, before the
    // provider call resolves, so a stream error can't change the status here.
    // Its textStream also silently drops error parts, which left callers with
    // a blank 200 body on provider failures (e.g. quota errors). Build the
    // response from fullStream instead so error parts render as visible text.
    const encoder = new TextEncoder();
    const responseBody = new ReadableStream({
      async start(controller) {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            if (firstTokenTime === null) firstTokenTime = Date.now();
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === 'error') {
            controller.enqueue(encoder.encode(`\n\n[Error: ${describeStreamError(part.error)}]`));
          }
        }
        controller.close();
      },
    });
    return new Response(responseBody, {
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
