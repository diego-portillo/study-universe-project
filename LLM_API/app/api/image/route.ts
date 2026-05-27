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
    if (IMAGE_MODEL.startsWith('gpt-image')) {
      const img = await openaiClient.images.generate({
        model: IMAGE_MODEL,
        prompt: clipped,
        n: 1,
        size: '1024x1024',
        quality: 'low',
      });

      const b64 = img.data?.[0]?.b64_json;
      if (!b64)
        return NextResponse.json(
          { error: 'No image returned' },
          { status: 502 },
        );

      return NextResponse.json({
        url: `data:image/png;base64,${b64}`,
        revised_prompt: img.data?.[0]?.revised_prompt,
      });
    }

    if (IMAGE_MODEL === 'dall-e-3') {
      const img = await openaiClient.images.generate({
        model: 'dall-e-3',
        prompt: clipped,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      });

      const url = img.data?.[0]?.url;
      if (!url)
        return NextResponse.json(
          { error: 'No image URL returned' },
          { status: 502 },
        );

      return NextResponse.json({
        url,
        revised_prompt: img.data?.[0]?.revised_prompt,
      });
    }

    const dalle2Size: '256x256' | '512x512' | '1024x1024' =
      IMAGE_SIZE === '512x512' ||
      IMAGE_SIZE === '1024x1024' ||
      IMAGE_SIZE === '256x256'
        ? IMAGE_SIZE
        : '256x256';

    const img = await openaiClient.images.generate({
      model: 'dall-e-2',
      prompt: clipped,
      n: 1,
      size: dalle2Size,
      response_format: 'url',
    });

    const url = img.data?.[0]?.url;
    if (!url)
      return NextResponse.json(
        { error: 'No image URL returned' },
        { status: 502 },
      );

    return NextResponse.json({ url });
  } catch (error: unknown) {
    let message = 'Unknown image generation error';
    if (error instanceof OpenAI.APIError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error('[api/image]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
