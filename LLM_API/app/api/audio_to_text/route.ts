import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openaiClient } from '../lib/openai';

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

    const transcription = await openaiClient.audio.transcriptions.create({
      model: 'whisper-1',
      file: audio,
    });

    if (!transcription?.text || transcription.text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not transcribe audio. Please try again with clearer audio.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text: transcription.text });
  } catch (error: unknown) {
    let message = 'Audio transcription failed';
    if (error instanceof OpenAI.APIError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error('[api/audio_to_text]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
