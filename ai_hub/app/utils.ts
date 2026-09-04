import type { MessageContent, ProviderErrorKind, TextPart } from './types';

export function getTextContent(content: MessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter((part) => part.type === 'text')
    .map((part) => (part as TextPart).text)
    .join(' ');
}

export function hasImage(content: MessageContent): boolean {
  if (typeof content === 'string') return false;
  return content.some((part) => part.type === 'image_url');
}

// Classifies a raw error message from a provider request into a UI-actionable
// kind, so the error boundary can render a targeted fallback (e.g. "switch
// provider" for rate_limit/quota) instead of dumping the same string for every
// failure. Matches the actual error shapes seen from route.ts / provider SDKs:
// OpenAI/Anthropic 429s say "rate limit", Gemini says "exceeded ... quota",
// and missingApiKeyResponse() in route.ts always starts with "Missing ".
//
// quota is checked before rate_limit: Gemini's real quota-exceeded message
// (evals/results/2026-08-28T18-05-14-036Z.json) links to
// https://ai.google.dev/gemini-api/docs/rate-limits as boilerplate, which
// would otherwise false-match the rate_limit check first and mislabel a
// quota error as a rate limit.
export function classifyProviderError(message: string): ProviderErrorKind {
  if (/quota/i.test(message)) return 'quota';
  if (/rate.?limit/i.test(message)) return 'rate_limit';
  if (/^Missing [A-Z_]+/.test(message)) return 'missing_key';
  if (/failed to fetch|networkerror|network error/i.test(message)) return 'network';
  return 'unknown';
}

// api/chat/route.ts commits a 200 status before the provider call resolves, so a
// mid-stream provider failure can't change the HTTP status — it gets appended to
// the stream body instead, as `\n\n[Error: <message>]` (see the fullStream loop in
// route.ts). Without unpacking this, that text renders as if the assistant said it.
const STREAM_ERROR_MARKER = '\n\n[Error: ';

export function extractStreamError(
  text: string,
): { cleanText: string; errorMessage: string } | null {
  const markerIndex = text.indexOf(STREAM_ERROR_MARKER);
  if (markerIndex === -1) return null;
  const cleanText = text.slice(0, markerIndex);
  const rawMessage = text.slice(markerIndex + STREAM_ERROR_MARKER.length);
  const errorMessage = rawMessage.endsWith(']') ? rawMessage.slice(0, -1) : rawMessage;
  return { cleanText, errorMessage };
}

export async function fileToLowResDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 512;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) throw new Error('Canvas error');
  canvasContext.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', 0.6);
}
