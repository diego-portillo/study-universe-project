import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openaiClient } from '../lib/openai';
import type { SpeechVoice } from '../../types';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy' }: { text: string; voice?: SpeechVoice } =
      await req.json();

    if (!text || typeof text !== 'string')
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const mp3 = await openaiClient.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    let message = 'Internal server error';
    if (error instanceof OpenAI.APIError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error('[api/text_to_audio]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
