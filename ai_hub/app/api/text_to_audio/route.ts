import { NextRequest, NextResponse } from 'next/server';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';
import { elevenlabs } from '@ai-sdk/elevenlabs';
import { MAX_PROMPT_CHARS } from '../../constants';
import type { SpeechVoice } from '../../types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = 'alloy',
      provider = 'openai',
    }: {
      text: string;
      voice?: SpeechVoice;
      provider?: string;
    } = await request.json();

    if (!text || typeof text !== 'string')
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    if (text.length > MAX_PROMPT_CHARS)
      return NextResponse.json(
        { error: `Text exceeds ${MAX_PROMPT_CHARS} characters` },
        { status: 400 },
      );

    let audioBytes: Uint8Array;

    if (provider === 'elevenlabs') {
      if (!process.env.ELEVENLABS_API_KEY)
        return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 });
      const result = await generateSpeech({
        model: elevenlabs.speech('eleven_multilingual_v2'),
        text,
        voice: '21m00Tcm4TlvDq8ikWAM', // default ElevenLabs voice
      });
      audioBytes = result.audio.uint8Array;
    } else {
      const result = await generateSpeech({
        model: openai.speech('tts-1'),
        text,
        voice: voice ?? 'alloy', // default OpenAI voice
      });
      audioBytes = result.audio.uint8Array;
    }

    const buffer = Buffer.from(audioBytes);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('[api/text_to_audio]', message);
    return NextResponse.json({ error: 'Speech generation failed' }, { status: 500 });
  }
}
