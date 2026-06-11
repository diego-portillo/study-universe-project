import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ImageRequestBody } from '../lib/types';

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-2';
const IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE ?? '256x256';

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

  const maxLen = IMAGE_MODEL.startsWith('dall-e-3')
    ? 4000
    : IMAGE_MODEL.startsWith('dall-e-2')
      ? 1000
      : 32000;

  const clipped = prompt.slice(0, maxLen);

  try {
    let img;

    if (IMAGE_MODEL.startsWith('gpt-image')) {
      img = await openaiClient.images.generate({
        model: IMAGE_MODEL,
        prompt: clipped,
        n: 1,
        size: '1024x1024',
        quality: 'low',
      });
    } else if (IMAGE_MODEL === 'dall-e-3') {
      img = await openaiClient.images.generate({
        model: 'dall-e-3',
        prompt: clipped,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
    } else {
      const dalle2Size: '256x256' | '512x512' | '1024x1024' =
        IMAGE_SIZE === '512x512' ||
        IMAGE_SIZE === '1024x1024' ||
        IMAGE_SIZE === '256x256'
          ? IMAGE_SIZE
          : '256x256';

      img = await openaiClient.images.generate({
        model: 'dall-e-2',
        prompt: clipped,
        n: 1,
        size: dalle2Size,
      });
    }

    // response_format is no longer accepted by the API — dall-e-2/3 default to
    // `url`, gpt-image-* models always return `b64_json`. Handle either.
    const result = img.data?.[0];
    const url = result?.b64_json
      ? `data:image/png;base64,${result.b64_json}`
      : result?.url;

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
    console.error('[api/image]', message);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 });
  }
}
