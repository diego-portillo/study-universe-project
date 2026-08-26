import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import OpenAI from 'openai';
import type { ImageUrlPart, Message } from '../app/types';

type GoldenEntry = {
  id: string;
  category: string;
  providers: string[];
  messages: Message[];
  criteria: string;
  tags: string[];
};

type RunResult = {
  id: string;
  category: string;
  provider: string;
  pass: boolean;
  reason: string;
  skip?: boolean;
};

// route.ts surfaces provider stream errors as `[Error: ...]` text in an otherwise-200
// response (see app/api/chat/route.ts). A quota/rate-limit exhaustion isn't something
// this entry's fix or prompt controls, so score it as skipped rather than a fail.
const QUOTA_ERROR_PATTERN = /\[Error:.*\b(quota|rate.?limit)\b/i;

const REPO_ROOT = join(import.meta.dirname, '..', '..');
const BASE_URL = process.env.EVAL_BASE_URL ?? 'http://localhost:3000';
const JUDGE_MODEL = process.env.JUDGE_MODEL ?? 'gpt-4o-mini';
// Comma-separated allowlist, e.g. EVAL_PROVIDER=openai — lets a first run stay cheap
// and scoped to one provider instead of hitting every provider in the dataset.
const PROVIDER_FILTER = process.env.EVAL_PROVIDER?.split(',').map((p) => p.trim());
// Comma-separated golden entry ids, e.g. EVAL_ID=image-005 — for re-checking a single
// entry after a fix without re-running (and re-paying for) the whole dataset.
const ID_FILTER = process.env.EVAL_ID?.split(',').map((p) => p.trim());
// A hung provider/judge call shouldn't block the rest of the suite — skip to the next
// entry after this many ms and report it as a timeout instead of waiting forever.
const ENTRY_TIMEOUT_MS = Number(process.env.EVAL_TIMEOUT_MS) || 10 * 60 * 1000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Aborts the underlying request on timeout (not just the wait) — otherwise a hung
// request keeps a socket open in Node's connection pool, and enough of those pile up
// to starve later requests too, turning one timeout into a cascade of them.
async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error(`TIMEOUT after ${ENTRY_TIMEOUT_MS}ms: ${label}`)),
    ENTRY_TIMEOUT_MS,
  );
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function mimeTypeFor(path: string): string {
  const ext = extname(path).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported image extension: ${ext}`);
}

function toDataUrl(localImage: string): string {
  const filePath = join(REPO_ROOT, localImage);
  const bytes = readFileSync(filePath);
  return `data:${mimeTypeFor(filePath)};base64,${bytes.toString('base64')}`;
}

// Golden entries reference images via a `localImage` path (see golden_dataset.json) so
// samples never need to be committed as base64 blobs. Resolve them to real data: URLs
// here, right before the request goes out — the API route only accepts data:/https:.
function resolveMessages(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (typeof m.content === 'string') return m;
    return {
      ...m,
      content: m.content.map((part) => {
        if (part.type !== 'image_url') return part;
        const raw = part.image_url as ImageUrlPart['image_url'] & { localImage?: string };
        if (!raw.localImage) return part;
        return {
          type: 'image_url',
          image_url: { url: toDataUrl(raw.localImage), detail: raw.detail },
        } satisfies ImageUrlPart;
      }),
    };
  });
}

function lastUserText(messages: Message[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return '';
  if (typeof last.content === 'string') return last.content;
  return last.content
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ');
}

type ChatRouteResponse = { status: number; text: string };

// Non-2xx isn't necessarily a failure — some entries (e.g. invalid image URL scheme)
// have criteria that expect a rejection. Hand status + body to the judge instead of
// throwing, so it can compare the actual outcome against what the entry's criteria wants.
async function callChatRoute(
  entry: GoldenEntry,
  provider: string,
  signal: AbortSignal,
): Promise<ChatRouteResponse> {
  const messages = resolveMessages(entry.messages);
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      provider,
      conversationId: `eval-${entry.id}-${provider}`,
      reset: true,
    }),
    signal,
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function judge(
  entry: GoldenEntry,
  response: ChatRouteResponse,
  signal: AbortSignal,
): Promise<{ pass: boolean; reason: string }> {
  const completion = await openai.chat.completions.create(
    {
      model: JUDGE_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `Today's real-world date is ${new Date().toISOString().slice(0, 10)} — your own training cutoff is earlier than this, so do not treat dates at or before today as "future" or "invalid" just because they postdate your training data. ` +
            'You grade a chatbot response against pass/fail criteria for an eval harness. ' +
            'Judge strictly against the given criteria only — do not apply outside opinions. ' +
            'Respond with strict JSON: {"pass": boolean, "reason": string}. Keep "reason" to one sentence.',
        },
        {
          role: 'user',
          content: `Prompt sent to the chatbot:\n${lastUserText(entry.messages)}\n\nHTTP status: ${response.status}\nChatbot's response:\n${response.text}\n\nCriteria:\n${entry.criteria}`,
        },
      ],
    },
    { signal },
  );
  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { pass?: boolean; reason?: string };
  return { pass: Boolean(parsed.pass), reason: parsed.reason ?? '' };
}

async function main() {
  const golden = JSON.parse(
    readFileSync(join(import.meta.dirname, 'golden_dataset.json'), 'utf-8'),
  ) as GoldenEntry[];

  const results: RunResult[] = [];

  for (const entry of golden) {
    if (ID_FILTER && !ID_FILTER.includes(entry.id)) continue;
    const providers = PROVIDER_FILTER
      ? entry.providers.filter((p) => PROVIDER_FILTER.includes(p))
      : entry.providers;
    for (const provider of providers) {
      process.stdout.write(`${entry.id} [${provider}] ... `);
      try {
        const response = await withTimeout(
          (signal) => callChatRoute(entry, provider, signal),
          `${entry.id} [${provider}] chat route`,
        );
        if (QUOTA_ERROR_PATTERN.test(response.text)) {
          const reason = response.text.trim();
          results.push({ id: entry.id, category: entry.category, provider, pass: false, reason, skip: true });
          console.log(`SKIPPED — ${reason}`);
          continue;
        }
        const verdict = await withTimeout(
          (signal) => judge(entry, response, signal),
          `${entry.id} [${provider}] judge`,
        );
        results.push({ id: entry.id, category: entry.category, provider, ...verdict });
        console.log(verdict.pass ? 'PASS' : `FAIL — ${verdict.reason}`);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        results.push({ id: entry.id, category: entry.category, provider, pass: false, reason });
        console.log(`ERROR — ${reason}`);
      }
    }
  }

  const skipped = results.filter((r) => r.skip);
  const scored = results.filter((r) => !r.skip);
  const passed = scored.filter((r) => r.pass).length;
  const total = scored.length;
  console.log(`\n${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)`);
  if (skipped.length > 0) {
    console.log(`${skipped.length} SKIPPED (quota/rate-limit, not scored):`);
    for (const r of skipped) console.log(`  ${r.id} [${r.provider}] — ${r.reason}`);
  }
  console.log();

  const byCategory = new Map<string, { pass: number; total: number }>();
  for (const r of scored) {
    const bucket = byCategory.get(r.category) ?? { pass: 0, total: 0 };
    bucket.total += 1;
    if (r.pass) bucket.pass += 1;
    byCategory.set(r.category, bucket);
  }
  console.log('By category:');
  for (const [category, { pass, total: catTotal }] of byCategory) {
    console.log(`  ${category}: ${pass}/${catTotal}`);
  }

  const resultsDir = join(import.meta.dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = join(resultsDir, `${timestamp}.json`);
  writeFileSync(
    outputPath,
    JSON.stringify({ timestamp, judgeModel: JUDGE_MODEL, passed, total, results }, null, 2),
  );
  console.log(`\nFull results: evals/results/${timestamp}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
