import { NextResponse } from "next/server";
import OpenAI from "openai";

/** Default: DALL·E 2 @ 256×256 (smallest size). Override with e.g. gpt-image-1-mini. */
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-2";
const IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE ?? "256x256";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on the server (.env.local)" },
      { status: 500 }
    );
  }

  const maxLen = IMAGE_MODEL.startsWith("dall-e-3") ? 4000 : IMAGE_MODEL.startsWith("dall-e-2") ? 1000 : 32000;
  const clipped = prompt.slice(0, maxLen);

  try {
    const client = new OpenAI({ apiKey });

    if (IMAGE_MODEL.startsWith("gpt-image")) {
      const img = await client.images.generate({
        model: IMAGE_MODEL,
        prompt: clipped,
        n: 1,
        size: "1024x1024",
        quality: "low",
        output_format: "jpeg",
        output_compression: 35,
        moderation: "low",
      });
      const b64 = img.data?.[0]?.b64_json;
      if (!b64) {
        return NextResponse.json({ error: "No image in response" }, { status: 502 });
      }
      return NextResponse.json({
        url: `data:image/jpeg;base64,${b64}`,
        revised_prompt: img.data?.[0]?.revised_prompt,
      });
    }

    const dalle2Size =
      IMAGE_SIZE === "512x512" || IMAGE_SIZE === "1024x1024" || IMAGE_SIZE === "256x256"
        ? IMAGE_SIZE
        : "256x256";

    if (IMAGE_MODEL === "dall-e-3") {
      const img = await client.images.generate({
        model: "dall-e-3",
        prompt: clipped,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });
      const url = img.data?.[0]?.url;
      if (!url) {
        return NextResponse.json({ error: "No image URL in response" }, { status: 502 });
      }
      return NextResponse.json({ url, revised_prompt: img.data?.[0]?.revised_prompt });
    }

    const img = await client.images.generate({
      model: "dall-e-2",
      prompt: clipped,
      n: 1,
      size: dalle2Size,
      response_format: "url",
    });

    const url = img.data?.[0]?.url;
    if (!url) {
      return NextResponse.json({ error: "No image URL in response" }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err?.message ?? String(err);
    console.error("[api/image]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
