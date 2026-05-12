import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing OPENAI_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error: "Audio file is required",
        },
        { status: 400 }
      );
    }

    const transcription =
      await client.audio.transcriptions.create({
        model: "whisper-1",
        file: audio,
      });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error: unknown) {
    console.error("[api/sound_to_text]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}