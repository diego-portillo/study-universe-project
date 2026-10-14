# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a two-project monorepo (an AI backend engineering portfolio). Each top-level project directory is independent; there is no shared build at the root (only Prettier/Tailwind config).

- `ai_hub/` — **primary active subproject.** Next.js 16 + React 19 chat/image/audio UI over OpenAI, Anthropic, Google, and ElevenLabs via the Vercel AI SDK.
- `finance_rag_agent/` — **second project.** FastAPI RAG + agent system over SEC filings (10-K/10-Q): Postgres+pgvector retrieval, Cohere reranking, a Ragas eval harness, and a LangGraph agent layer.
- `docs/` — planning docs (`PLAN.md`, `interview_prep.md`, etc.); only `docs/LOGBOOK.md` is git-tracked (see `.gitignore`), the rest are local scratch.
- `infra/` — CloudFormation + deploy/teardown scripts for `ai_hub`'s documented-but-dormant AWS ECS path (see `ai_hub/README.md`'s AWS Deployment section).
- `samples/` — test-fixture images used by `ai_hub`'s vision/eval tests.

When asked to work "on the app" without further context, assume `ai_hub/`.

## Dependencies convention

Each subproject manages its own dependencies and is independently deployable — do not hoist or share `node_modules` across projects.

- **Root `package.json` / `node_modules`** — repo-wide tooling only (Prettier, Tailwind plugin, ESLint-Prettier config). Used by format-on-save across every subproject. Not for app code.
- **Subproject `package.json` / `node_modules`** (e.g. `ai_hub/`) — that app's runtime + dev deps. Each subproject pins its own versions and ships in its own Docker image with only its own deps installed.

No npm workspaces: the two subprojects don't share code (Next.js/TypeScript vs. Python/FastAPI, different runtimes entirely), so workspaces would be ceremony for no benefit.

## Deployment target

- **Domain:** `www.diegoportillo.dev` (owned by Diego) is reserved for a separate personal/portfolio site project — not served from this repo.
- **ai_hub:** deployed standalone on Vercel (free Hobby tier). An AWS ECS Express Mode path (ECR + OIDC + Fargate) is also built and documented, but isn't what serves the live demo — see `ai_hub/README.md`'s Cost Estimate section for why.
- **finance_rag_agent:** deployed standalone on Render (free tier) with a free Neon Postgres+pgvector add-on.
- **Container model:** each subproject still ships its own Docker image for local dev/CI (see [Dependencies convention](#dependencies-convention)); no global app image, no shared reverse proxy.

Implications when writing code or infra:

- `ai_hub`'s `basePath` is env-gated (`NEXT_PUBLIC_BASE_PATH`) for a possible future subpath deployment, but builds with no prefix today — don't assume a subpath in local dev or on Vercel.
- Vercel-isms are fine for `ai_hub` now (that's the active deploy target) — just don't assume they'd work unchanged if the documented AWS ECS path is ever revisited.
- For the AWS path specifically, expect: ECR (image registry) + ECS Express Mode (Fargate-based, auto-provisions ALB and auto-scaling) + CloudFront or ALB in front for TLS.

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

## Formatting

Prettier is configured at the root (`.prettierrc`) with `prettier-plugin-tailwindcss`. VS Code is set to format on save. There is no root-level lint/test script — each subproject manages its own.

## Code Style Guidelines

These are standing rules for all code written in this repository, across every subproject. Follow them unless a file's existing conventions clearly differ — in that case, match the file.

### Naming

- Names must reveal intent. No single-letter names except loop indices (`i`, `j`) and standard short-lived lambdas.
- No abbreviations unless they're domain-standard (`id`, `url`, `http`). Prefer `elapsedDays` over `d`, `userCount` over `cnt`.
- Functions/methods are verb phrases: `calculateTotal()`, `fetchActiveUsers()`.
- Variables are noun phrases: `totalPrice`, `activeUsers`.
- Booleans read as predicates: `isValid`, `hasPermission`, `canRetry`.
- Match domain language. Use the business term the team uses, not a technical paraphrase.

### Structure

- Use early returns / guard clauses instead of nested conditionals. Handle edge cases first and return, then write the main path unindented.
- Maximum nesting depth of 2. If you're deeper, extract a function.
- Functions do one thing. If a function needs a comment to explain a section, extract that section into a named function instead.
- Keep functions short. If a function doesn't fit on a screen, it's probably doing too much.
- Prefer composing small, named steps over one long procedure.

### Comments

- Comments explain *why*, not *what*. The code already says what it does.
- Do not write comments that restate the code.
- Never leave commented-out code. Delete it.
- A well-named function or variable is better than a comment.

### Language-specific

#### Python
- Follow PEP 8.
- Use type hints on all function signatures.
- Prefer list/dict comprehensions over manual loops when they stay readable (don't nest comprehensions deeply).
- Use f-strings, not `%` or `.format()`.
- Prefer `pathlib` over `os.path`, dataclasses/Pydantic over bare dicts for structured data.
- Keep business logic out of framework glue (views/routes) — put it in a service layer.
- Before completing any task, run `ruff format .` and `ruff check --fix .` and resolve remaining warnings.

#### TypeScript / Node
- `strict` mode always. No `any` — use `unknown` and narrow, or define the type.
- Prefer `type`/`interface` for shape; avoid type assertions (`as`) unless unavoidable.
- Use `const` by default, `let` only when reassigning. Never `var`.
- Async/await over raw promise chains. Handle rejections explicitly.
- Prefer named exports over default exports.
- Node: keep route handlers thin — delegate to service/domain modules.
- Before completing any task, run the project formatter and linter (Prettier + ESLint) and resolve warnings.

#### React
- Function components with hooks only. No class components.
- One component, one responsibility. Extract when a component grows past a screenful or handles multiple concerns.
- Keep components pure; push side effects into `useEffect` or event handlers, not render.
- Lift derived values out of state — compute during render instead of storing what can be derived.
- Custom hooks for reusable stateful logic; name them `useThing`.
- Keep prop lists small and typed. If a component takes many props, consider composition.
- Co-locate related files (component, styles, tests, hooks).

### General

- Consistency within a file/module wins over these rules when they conflict.
- Don't add dependencies for something the standard library handles cleanly.
- When you finish a change, make sure the formatter/linter passes before considering the task done.

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

Two standing directives from the field guide's Jun 2026 revision (see PLAN.md):

- **Projects are domain-first with an agent component** — start from a real domain and real companies (evidence saved in a PROJECT_PLAN.md), not from a technology; RAG + Agents cover 70%+ of job use cases, so the second project pairs a RAG core with an agentic layer.
- **Take-home practice is part of interview prep** — take-homes (RAG, agentic, conversational) are a dominant interview stage; Phase 3 includes timed practice assignments from the guide's catalogued list.

## Behavior Instructions

1. **Keep answers short.**
2. **Coding problems:** Teach Socratically — break into steps, ask guiding questions, don't give solutions directly. Build problem-solving skills.
3. **Strategic decisions** (what to study, how long, job market): Give direct answers.
4. **Stay market-aware:** Pull current job posting requirements for AI backend roles, US-remote LATAM-friendly positions, realistic salaries for Paraguay-based devs. Context over general advice.

## Reference Files

- https://github.com/alexeygrigorev/ai-engineering-field-guide — **read `.md` files only; skip all other extensions (raw data)**. Substantially revised Jun 2026: role data now spans 4,894 JDs (Feb–Jun 2026 scrapes) and the portfolio section was reworked around domain-first projects.
