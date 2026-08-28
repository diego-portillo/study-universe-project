import { NextRequest, NextResponse } from 'next/server';
import { experimental_transcribe as generateTranscription } from 'ai';
import { openai } from '@ai-sdk/openai';

async function transcribeWithElevenLabs(audio: File): Promise<string> {
  const elevenLabsForm = new FormData();
  elevenLabsForm.append('file', audio);
  elevenLabsForm.append('model_id', 'scribe_v2');

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
    body: elevenLabsForm,
  });

  if (response.ok) {
    const data = await response.json();
    return data.text;
  }

  const errorData = await response.json().catch(() => ({}));
  throw new Error(
    errorData?.detail?.message ??
      errorData?.detail ??
      `ElevenLabs STT failed: ${response.status}`,
  );
}

async function transcribeWithOpenAI(audio: File): Promise<string> {
  const arrayBuffer = await audio.arrayBuffer();

  const result = await generateTranscription({
    model: openai.transcription('whisper-1'),
    audio: new Uint8Array(arrayBuffer),
    providerOptions: {
      openai: { language: 'en' },
    },
  });

  return result.text;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const provider = (formData.get('provider') as string) ?? 'openai';

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 },
      );
    }

    if (provider === 'elevenlabs' && !process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Missing ELEVENLABS_API_KEY in .env.local' },
        { status: 500 },
      );
    }

    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY in .env.local' },
        { status: 500 },
      );
    }

    const text =
      provider === 'elevenlabs'
        ? await transcribeWithElevenLabs(audio)
        : await transcribeWithOpenAI(audio);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not transcribe audio. Please try again with clearer audio.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[api/audio_to_text]', message);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
