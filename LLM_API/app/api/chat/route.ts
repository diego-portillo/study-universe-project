import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { applyLowDetailToImages, messagesIncludeVision } from '../lib/messages';
import { runOpenAIChat } from '../lib/openai';
import { runAnthropicChat } from '../lib/anthropic';
import type { ChatBody } from '../lib/types';

const MAX_MESSAGES = 8;
const memoryStore = new Map();

export async function POST(request: NextRequest) {
  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    messages,
    conversationId = 'default',
    provider = 'openai',
    model,
    reset,
  } = body;

  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json(
      { error: 'messages must be a non-empty array' },
      { status: 400 },
    );

  if (messages.length > MAX_MESSAGES)
    return NextResponse.json(
      { error: 'Conversation reached MAX_MESSAGES limit.' },
      { status: 413 },
    );

  if (reset) memoryStore.delete(conversationId);

  const normalized = applyLowDetailToImages(messages);
  const previous = memoryStore.get(conversationId) || [];
  const fullMessages = [...previous, ...normalized];

  const maxTokens = Math.min(
    4096,
    Math.max(64, Number(process.env.ANTHROPIC_MAX_TOKENS) || 1024),
  );

  try {
    let result;

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY)
        return NextResponse.json(
          { error: 'Missing ANTHROPIC_API_KEY' },
          { status: 500 },
        );

      const resolvedModel =
        model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
      result = await runAnthropicChat(fullMessages, resolvedModel, maxTokens);
    } else {
      if (!process.env.OPENAI_API_KEY)
        return NextResponse.json(
          { error: 'Missing OPENAI_API_KEY' },
          { status: 500 },
        );

      const hasVision = messagesIncludeVision(normalized);
      const resolvedModel =
        model ||
        (hasVision
          ? process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
          : process.env.OPENAI_MODEL || 'gpt-4o');
      result = await runOpenAIChat(fullMessages, resolvedModel, maxTokens);
    }

    memoryStore.set(conversationId, [...fullMessages, result.message]);
    return NextResponse.json({ message: result.message });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Anthropic.APIError) {
      const body = error.error as { error?: { message?: string } } | undefined;
      message = body?.error?.message ?? error.message;
    } else if (error instanceof OpenAI.APIError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error(`[api/chat] ${provider} error:`, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
