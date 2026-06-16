import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ImageRequestBody } from '../lib/types';

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';

export async function POST(request: NextRequest) {
  let body: ImageRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!prompt)
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });

  if (!process.env.OPENAI_API_KEY)
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY in .env.local' },
      { status: 500 },
    );

  const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const maxLen = 32000;

  const clipped = prompt.slice(0, maxLen);

  console.log('[api/image] request', {
    model: IMAGE_MODEL,
    promptLength: clipped.length,
  });

  try {
    console.log('[api/image] calling OpenAI images.generate', {
      model: IMAGE_MODEL,
      n: 1,
      size: '1024x1024',
      quality: 'low',
      promptLength: clipped.length,
    });
    const img = await openaiClient.images.generate({
      model: IMAGE_MODEL,
      prompt: clipped,
      n: 1,
      size: '1024x1024',
      quality: 'low',
    });

    // gpt-image-* models always return b64_json. Handle url fallback for any future model.
    const result = img.data?.[0];
    const url = result?.b64_json
      ? `data:image/png;base64,${result.b64_json}`
      : result?.url;

    console.log('[api/image] OpenAI response', {
      hasB64: !!result?.b64_json,
      hasUrl: !!result?.url,
      hasRevisedPrompt: !!result?.revised_prompt,
    });

    if (!url)
      return NextResponse.json(
        { error: 'No image returned' },
        { status: 502 },
      );

    return NextResponse.json({ url, revised_prompt: result?.revised_prompt });
  } catch (error: unknown) {
    const message =
      error instanceof OpenAI.APIError || error instanceof Error
        ? (error as Error).message
        : 'Unknown image generation error';
    const status =
      error instanceof OpenAI.APIError ? error.status : undefined;
    console.error('[api/image] OpenAI call failed', {
      model: IMAGE_MODEL,
      status,
      name: error instanceof Error ? error.name : typeof error,
      message,
    });
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 });
  }
}
