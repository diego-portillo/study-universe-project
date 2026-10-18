# study-universe-project

Diego Portillo's AI fullstack engineering portfolio — two deployed, evaluated AI projects demonstrating production RAG, agentic tool use, multi-provider LLM integration, and deployment/cost discipline — plus the personal site they're presented on.

## Projects

- **[`professional_website/`](professional_website/)** — a Vite + React 19 + TypeScript personal site: CV, work history, and write-ups of the two AI projects below, each with a demo video and links to its live deployment and source.
- **[`ai_hub/`](ai_hub/)** — Next.js 16 + React 19 chat/image/audio UI unifying OpenAI, Anthropic, Google, and ElevenLabs behind one interface: streaming, an LLM-judged eval harness, CI/CD, and Docker/AWS deployment.
- **[`finance_rag_agent/`](finance_rag_agent/)** — a RAG + agent system over SEC filings (10-K/10-Q): retrieval with Cohere reranking, a Ragas eval harness, and a LangGraph agent layer that diffs risk factors across filing periods.

Each subproject is independently deployable with its own dependencies, Docker image (where applicable), and README — see `CLAUDE.md` for conventions.

## Deployment

`professional_website`, `ai_hub`, and `finance_rag_agent` are each deployed standalone on their own free-tier host, under subdomains of `diegoportillo.dev` — no shared backend or reverse proxy between them.

**Live — professional_website:** [diegoportillo.dev](https://diegoportillo.dev) — Vercel free tier.

**Live — ai_hub:** [ai-hub.diegoportillo.dev](https://ai-hub.diegoportillo.dev) — Vercel free tier, to avoid paying for always-on infra during active development; see `ai_hub/README.md`'s Cost Estimate section for the full rationale.

**Live — finance_rag_agent:** [rag.diegoportillo.dev](https://rag.diegoportillo.dev) — Render free tier with a free Neon Postgres+pgvector add-on (FastAPI doesn't fit the Vercel/Next.js serverless model ai_hub uses); see `finance_rag_agent/README.md` for usage.

## Other directories

Not independent projects — supporting files for the three above and for working in this repo:

- **[`.github/`](.github/)** — GitHub Actions workflows: CI (lint/test) and manual-only deploy/eval/teardown for `ai_hub`, plus the Claude Code GitHub App (`@claude` mentions on issues/PRs and an (unwired) automated review workflow).
- **`.vscode/`** — shared editor settings (format-on-save with Prettier) for consistency across subprojects.
- **`docs/`** — planning docs; only `docs/LOGBOOK.md` is git-tracked, the rest is local scratch (see `.gitignore`).
- **`infra/`** — CloudFormation + deploy/teardown scripts for `ai_hub`'s documented-but-dormant AWS ECS path (see `ai_hub/README.md`'s AWS Deployment section).
- **`samples/`** — test-fixture images used by `ai_hub`'s vision/eval tests; only the specific files the eval harness references are tracked, not the whole directory.
