# study-universe-project

Diego Portillo's AI backend engineering portfolio — two deployed, evaluated AI projects demonstrating production RAG, agentic tool use, multi-provider LLM integration, and deployment/cost discipline.

## Projects

- **[`ai_hub/`](ai_hub/)** — Next.js 16 + React 19 chat/image/audio UI unifying OpenAI, Anthropic, Google, and ElevenLabs behind one interface: streaming, an LLM-judged eval harness, CI/CD, and Docker/AWS deployment.
- **[`finance_rag_agent/`](finance_rag_agent/)** — a RAG + agent system over SEC filings (10-K/10-Q): retrieval with Cohere reranking, a Ragas eval harness, and a LangGraph agent layer that diffs risk factors across filing periods.

Each subproject is independently deployable with its own dependencies, Docker image, and README — see `CLAUDE.md` for conventions.

## Deployment

`ai_hub` and `finance_rag_agent` are each deployed standalone on their own free-tier host — no shared domain or reverse proxy. `www.diegoportillo.dev` is reserved for a separate personal/portfolio site project, not served from this repo. Subprojects are independently deployable — see `CLAUDE.md` for the dependency and deployment conventions.

**Live demo — ai_hub:** [ai-2z4c4itsf-diegoportillos-projects.vercel.app](https://ai-2z4c4itsf-diegoportillos-projects.vercel.app/) — running on Vercel's free tier to avoid paying for always-on infra during active development; see `ai_hub/README.md`'s Cost Estimate section for the full rationale.

**Live demo — finance_rag_agent:** [finance-rag-agent-i0ca.onrender.com](https://finance-rag-agent-i0ca.onrender.com) — running on Render's free tier with a free Neon Postgres+pgvector add-on (FastAPI doesn't fit the Vercel/Next.js serverless model ai_hub uses); see `finance_rag_agent/README.md` for usage.
