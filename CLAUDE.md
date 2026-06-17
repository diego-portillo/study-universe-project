# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a multi-project monorepo. Each top-level directory is an independent project; there is no shared build at the root (only Prettier/Tailwind config).

- `ai_hub/` — **primary active subproject.** Next.js 16 + React 19 chat/image/audio UI over OpenAI, Anthropic, Google, and ElevenLabs via the Vercel AI SDK.
- `backend_flask/`, `backend_node/` — tiny Flask and Express hello-world services, wired into `docker-compose.yaml` and the `static_website/` frontend.
- `static_website/` — static HTML/JS frontend that calls `backend_flask` (served via the root `docker-compose.yaml`).
- `balancer/` — docker compose / swarm nginx load-balancer experiments.
- `RAG/`, `data/algorithms/` — RAG loader for indexing algorithm files in `data/`.

When asked to work "on the app" without further context, assume `ai_hub/`.

## Dependencies convention

Each subproject manages its own dependencies and is independently deployable — do not hoist or share `node_modules` across projects.

- **Root `package.json` / `node_modules`** — repo-wide tooling only (Prettier, Tailwind plugin, ESLint-Prettier config). Used by format-on-save across every subproject. Not for app code.
- **Subproject `package.json` / `node_modules`** (e.g. `ai_hub/`) — that app's runtime + dev deps. Each subproject pins its own versions and ships in its own Docker image with only its own deps installed.

No npm workspaces: subprojects don't share code (different runtimes — Next.js, Flask, static HTML, Python RAG), so workspaces would be ceremony for no benefit.

## Deployment target

- **Domain:** `www.diegoportillo.dev` (owned by Diego).
- **Host:** AWS (not Vercel).
- **Routing:** each subproject is served at a subpath, e.g. `www.diegoportillo.dev/ai_hub`. A reverse proxy (nginx / ALB / CloudFront) fans the subpaths out to per-subproject containers.
- **Container model:** one Docker image per subproject (see [Dependencies convention](#dependencies-convention)). No global app image.

Implications when writing code or infra:

- Next.js subprojects need `basePath` set to their subpath for production builds (e.g. `basePath: '/ai_hub'`) so client-side links and `_next/static` assets resolve correctly behind the proxy. `basePath` is build-time in Next.js — gate it behind an env var so local dev (`localhost:3000`) stays prefix-free.
- Don't lean on Vercel-isms (Vercel-specific env vars, the Vercel image optimizer's defaults, Edge runtime assumptions). Stick to what runs on a generic Node container.
- For AWS, expect: ECR (image registry) + ECS Express Mode (Fargate-based, auto-provisions ALB and auto-scaling) + CloudFront or ALB in front for TLS and subpath routing.

## ai_hub — important constraint

`ai_hub/AGENTS.md` (referenced from `ai_hub/CLAUDE.md`) warns:

> This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Before writing or refactoring Next.js code in `ai_hub/`, consult `ai_hub/node_modules/next/dist/docs/` for the actual current API rather than relying on training-data recall.

## Common commands (run from `ai_hub/`)

```
npm run dev            # next dev (localhost:3000)
npm run build          # next build
npm run lint           # eslint
npm test               # vitest (watch)
npm run test:ui        # vitest UI
npm run test:coverage  # vitest run --coverage
npx vitest run app/tests/api/chat.test.ts   # single test file
```

Tests live under `ai_hub/app/tests/` (mirrors `app/`). Vitest uses jsdom + `@testing-library/react`; setup is `app/tests/setup.ts`.

## ai_hub architecture

The whole app is one client page (`app/page.tsx`) with three modes — `chat`, `image`, `audio` — backed by four route handlers under `app/api/`:

- `api/chat/route.ts` — streaming chat. Picks provider from request body (`openai` | `anthropic` | `google`), resolves the SDK model, calls `streamText`, returns a text stream.
- `api/image/route.ts` — OpenAI image generation (DALL·E 2/3 or `gpt-image-*`), selected by `OPENAI_IMAGE_MODEL`.
- `api/text_to_audio/route.ts` — TTS via OpenAI or ElevenLabs (`experimental_generateSpeech`).
- `api/audio_to_text/route.ts` — STT via OpenAI Whisper (`experimental_transcribe`) or ElevenLabs Scribe v2 (direct REST).

**Key cross-cutting concepts:**

- **Conversation memory** lives in a per-request in-memory `Map<conversationId, Message[]>` inside `api/chat/route.ts`. It persists across requests in the same Node process but is wiped on restart and not shared across instances. `MAX_MESSAGES = 8` caps history; `reset: true` in the body clears it.
- **Message shape** is defined in two places: the client-facing `app/types.ts` (`Message`, `TextPart`, `ImageUrlPart` with `image_url: { url, detail }`) and the AI-SDK-facing types in `app/api/lib/types.ts` + `app/api/lib/messages.ts`. The chat route converts between them via `toAISDKMessages` (OpenAI-style `image_url` parts → AI SDK `image` parts).
- **Image inputs** always get `detail: "low"` applied server-side (`applyLowDetailToImages` in `app/api/lib/messages.ts`), and only `data:` or `https:` URLs are accepted.
- **Provider capability matrix** is enforced in the UI (`app/page.tsx` + `app/constants.ts`):
  - Chat: all providers
  - Image: OpenAI only (`UNSUPPORTED_IMAGE_PROVIDERS = 'Anthropic, Google, ElevenLabs'`)
  - Audio: OpenAI + ElevenLabs (`UNSUPPORTED_AUDIO_PROVIDERS = 'Anthropic, Google'`)
  - ElevenLabs is audio-only — selecting it forces `mode = 'audio'`.
- **Streaming on the client** (`app/hooks/useChat.ts`) reads the raw AI SDK data-stream format and parses `0:"..."` lines manually rather than using `useChat` from `ai/react`. If switching to the SDK helper, the manual parser can be removed.
- **Model list** is hardcoded in `app/constants.ts` (`MODEL_OPTIONS`). Add new models there; the page groups them by `provider`.

### Required env vars (`ai_hub/.env.local`)

`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `ELEVENLABS_API_KEY` — each provider's route returns 500 if its key is missing. Optional overrides: `OPENAI_MODEL`, `OPENAI_VISION_MODEL`, `OPENAI_IMAGE_MODEL`, `OPENAI_IMAGE_SIZE`, `ANTHROPIC_MODEL`, `ANTHROPIC_MAX_TOKENS`, `GEMINI_MODEL`.

## Root project (Flask + static site)

`docker-compose.yaml` at the repo root builds and runs `backend_flask` (port 8082) + `static_website` (port 8080, nginx). `static_website/request.js` calls the Flask backend. Bring up with `docker compose up --build`.

## Formatting

Prettier is configured at the root (`.prettierrc`) with `prettier-plugin-tailwindcss`. VS Code is set to format on save. There is no root-level lint/test script — each subproject manages its own.

## Commit messages — keep generic

Keep commit messages short and conceptual. Do not mention specific values like model names, version strings, account IDs, ARNs, instance/task IDs, API key prefixes, or internal hostnames. Describe the intent, not the specifics (e.g. "Updated deprecated OpenAI models" not "Migrate gpt-5-nano to gpt-5.4-nano and dall-e-2 to gpt-image-2").

---

# Diego – AI Backend Engineering Portfolio

## About Me

- **Goal:** Land an AI backend engineering role (targeting US market from Paraguay)
- **Portfolio:** [study-universe-project](https://github.com/diego-portillo/study-universe-project) — private repo
- **Timeline:** Portfolio development through December → interview prep after

## Background

- 100+ Platzi courses: RAG/Azure, LangChain, Agents, MCP, Prompt Engineering, NLP, PyTorch, AWS, Node.js, React, Docker (gap), algorithms/DS
- Primary language: Python
- Tools in use: LangChain, Azure, MCP, Claude (browser + Cursor IDE)

## Current Priorities

1. **Docker** — highest-priority skill gap (common job filter); closes "can't ship" problem
2. Portfolio visibility strategy (private repo / commit timestamp concern — undecided)
3. Demonstrate existing AI knowledge through deployable projects, not course lists

## Behavior Instructions

1. **Keep answers short.**
2. **Coding problems:** Teach Socratically — break into steps, ask guiding questions, don't give solutions directly. Build problem-solving skills.
3. **Strategic decisions** (what to study, how long, job market): Give direct answers.
4. **Stay market-aware:** Pull current job posting requirements for AI backend roles, US-remote LATAM-friendly positions, realistic salaries for Paraguay-based devs. Context over general advice.

## Reference Files

- @./a.txt
- https://github.com/alexeygrigorev/ai-engineering-field-guide — **read `.md` files only; skip all other extensions (raw data)**
