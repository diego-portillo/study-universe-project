import { NextResponse } from "next/server";
import OpenAI from "openai";

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

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages,
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
