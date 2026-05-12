import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import {
  applyLowDetailToImages,
  messagesIncludeVision,
} from "../lib/messages";

type TextPart = {
  type: "text";
  text: string;
};

type ImageUrlPart = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
};

type ChatBody = {
  messages: Message[];
  conversationId?: string;
};

type MessageContent = string | Array<TextPart | ImageUrlPart>;

type Message = {
  role: "system" | "user" | "assistant";
  content: MessageContent;
};

const MAX_MESSAGES = 8;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const memoryStore = new Map<string, Message[]>();

export async function POST(request: NextRequest) {
  let body: ChatBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, conversationId = "default" } = body;

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: "Conversation reached MAX_MESSAGES limit. Please reload the page to start a new chat." },
      { status: 413 }
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages must be a non-empty array" },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  let normalized: Message[];

  try {
    normalized = applyLowDetailToImages(messages);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid messages",
      },
      { status: 400 }
    );
  }

  const hasVision = messagesIncludeVision(normalized);

  const model = hasVision
    ? process.env.OPENAI_VISION_MODEL || "gpt-4o-mini"
    : process.env.OPENAI_MODEL || "gpt-5-nano";

  const maxTokens = Math.min(
    4096,
    Math.max(64, Number(process.env.OPENAI_MAX_TOKENS) || 512)
  );

  try {
    // 🧠 LOAD MEMORY
    const previous = memoryStore.get(conversationId) || [];

    // 🧠 MERGE CONTEXT
    const fullMessages = [...previous, ...normalized];

    const completion = await client.chat.completions.create({
      model,
      messages: fullMessages,
      max_completion_tokens: maxTokens,
    });

    const assistantMessage = completion.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "Empty model response" },
        { status: 502 }
      );
    }

    // 🧠 SAVE MEMORY
    memoryStore.set(conversationId, [
      ...fullMessages,
      assistantMessage,
    ]);

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error";

    console.error("[api/chat]", message);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}