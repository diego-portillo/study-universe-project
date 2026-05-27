import type { MessageContent, TextPart } from './types';

export function getTextContent(content: MessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter((p) => p.type === 'text')
    .map((p) => (p as TextPart).text)
    .join(' ');
}

export function hasImage(content: MessageContent): boolean {
  if (typeof content === 'string') return false;
  return content.some((p) => p.type === 'image_url');
}

export async function fileToLowResDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 512;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', 0.6);
}
