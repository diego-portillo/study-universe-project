import { NextResponse } from "next/server";
import OpenAI from "openai";

import {
  applyLowDetailToImages,
  messagesIncludeVision,
} from "../lib/messages.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages } = body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on the server (.env.local)" },
      { status: 500 }
    );
  }

  let normalized;
  try {
    normalized = applyLowDetailToImages(messages);
  } catch (e) {
    return NextResponse.json({ error: e.message ?? "Invalid messages" }, { status: 400 });
  }

  const hasVision = messagesIncludeVision(normalized);
  // Text: default gpt-5-nano. Vision: gpt-4o-mini supports image_url + low detail efficiently.
  const model = hasVision
    ? (process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini")
    : (process.env.OPENAI_MODEL ?? "gpt-5-nano");

  const maxTokens = Math.min(
    4096,
    Math.max(64, Number(process.env.OPENAI_MAX_TOKENS) || 512)
  );

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages: normalized,
      max_tokens: maxTokens,
    });

    const assistantMessage = completion.choices[0]?.message;
    if (!assistantMessage) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    const message = err?.message ?? String(err);
    console.error("[api/chat]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
