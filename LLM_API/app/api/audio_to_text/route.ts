import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY in .env.local' },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const audio = formData.get('audio');

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 },
      );
    }

    const transcription = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file: audio,
    });

    // ✅ IMPORTANT FIX: validate output
    if (!transcription?.text || transcription.text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not transcribe audio. Please try again with clearer audio.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      text: transcription.text || '[No speech detected]',
    });
  } catch (error: unknown) {
    console.error('[api/audio_to_text]', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Audio transcription failed',
      },
      { status: 500 },
    );
  }
}
