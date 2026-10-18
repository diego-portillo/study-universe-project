# study-universe-project

Diego Portillo's AI fullstack engineering portfolio — two deployed, evaluated AI projects demonstrating production RAG, agentic tool use, multi-provider LLM integration, and deployment/cost discipline — plus the personal site they're presented on.

The repo is named for its original purpose: a single place to gather and apply everything studied over the past year — fullstack development, AI engineering, architecture, infrastructure, data, RAG, agents, evals, budget/cost discipline, and design, using tools like LangChain, LangSmith, Ragas, AWS, Next.js, React, and FastAPI — which later matured into the two deployed projects and portfolio site below.

## Why one repo, three projects

This is a monorepo holding three independent projects, each built to demonstrate a different part of shipping AI products end to end: a user-facing fullstack app, a backend RAG + agent system over real-world data, and the site that presents both to employers. They don't share code, a build, or a runtime — each has its own stack, dependencies, Docker image, and deployment, and is independently cloneable and runnable on its own. They're grouped in one repo because they were built together as one portfolio, not because they're one application. Each subproject's own README has the full write-up: problem statement, architecture, and tech stack.

## Projects

- **[`ai_hub/`](ai_hub/)** — a chat/image/audio web app unifying four AI providers (OpenAI, Anthropic, Google, ElevenLabs) behind one interface, built to demonstrate production LLM-integration patterns: streaming responses, an LLM-judged eval harness, CI/CD, and both Vercel and AWS (ECR + ECS Fargate) deployment paths. **Stack:** Next.js 16, React 19, TypeScript, Vercel AI SDK, Docker, AWS (ECS/ECR via CloudFormation).
- **[`finance_rag_agent/`](finance_rag_agent/)** — a RAG + agent backend that answers questions over real SEC filings (10-K/10-Q), built to demonstrate retrieval-system engineering beyond a basic chatbot: reranking, a quantitative eval harness, and an agent layer that reasons across multiple filing periods (e.g. diffing risk factors year over year). **Stack:** FastAPI, LangChain, LangGraph, Postgres + pgvector, Cohere reranking, Ragas evals.
- **[`professional_website/`](professional_website/)** — the personal site presenting the other two: CV, work history, and write-ups of each AI project with a demo video and links to its live deployment and source. **Stack:** Vite, React 19, TypeScript.

See `CLAUDE.md` for cross-project conventions (formatting, dependency management, commit style).

## Deployment

`professional_website`, `ai_hub`, and `finance_rag_agent` are each deployed standalone on their own free-tier host, under subdomains of `diegoportillo.dev` — no shared backend or reverse proxy between them.

**Live — professional_website:** [diegoportillo.dev](https://diegoportillo.dev) — Vercel free tier.

**Live — ai_hub:** [ai-hub.diegoportillo.dev](https://ai-hub.diegoportillo.dev) — Vercel free tier, to avoid paying for always-on infra during active development; see `ai_hub/README.md`'s Cost Estimate section for the full rationale.

**Live — finance_rag_agent:** [rag.diegoportillo.dev](https://rag.diegoportillo.dev) — Render free tier with a free Neon Postgres+pgvector add-on (FastAPI doesn't fit the Vercel/Next.js serverless model ai_hub uses); see `finance_rag_agent/README.md` for usage.

## Extras

Everything below is scaffolding for the three projects above, not a project of its own — grouped under **[`extras/`](extras/)** (plus two root dotfolders) so the repo root reads as "3 projects + the stuff that supports them," not a flat pile of folders:

- **[`extras/infra/`](extras/infra/)** — the CloudFormation templates and shell scripts behind `ai_hub`'s AWS deploy workflow: ECR, ECS Fargate, and teardown. Written and documented, but not the live deployment (see `ai_hub/README.md`'s Cost Estimate section for why `ai_hub` runs on Vercel instead).
- **[`extras/samples/`](extras/samples/)** — a handful of test-fixture images (a dog photo, a plant, etc.) that `ai_hub`'s vision eval harness feeds to each provider to check image understanding. Only the specific files the harness references are committed, not a media library.
- **[`extras/docs/`](extras/docs/)** — my own planning notes (roadmap, interview prep, weekly logs) for working on this portfolio. Only `extras/docs/LOGBOOK.md` is git-tracked as a running history of milestones; the rest is local scratch excluded via `.gitignore` — not meant to be polished reading for a visitor.
- **[`.github/`](.github/)** — automation for this repo: CI that lints/tests on every `ai_hub` change, manual-only workflows to deploy/eval/tear down `ai_hub` on AWS, and the Claude Code GitHub App for `@claude` mentions on issues/PRs. Kept at the root, not under `extras/`, because GitHub only reads Actions workflows from `.github/workflows/`.
- **`.vscode/`** — shared editor settings (format-on-save with Prettier) so formatting stays consistent across the three different stacks above. Kept at the root because VS Code only reads workspace settings from a root-level `.vscode/`.
