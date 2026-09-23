# Plan: Backend Dev → AI Software Engineer, May 2026 → Jan 2027

Source: synthesized from `alexeygrigorev/ai-engineering-field-guide` (interview, portfolio, learning-paths/from-backend-engineer, role md files). Targets the gap between Diego's current state (strong Python/AI breadth via Platzi, weak on shipped/deployed AI projects, Docker) and what US-remote AI Engineer postings actually demand.

**Updated Jul 3, 2026** against the guide's Jun 2026 revision: role data now covers 4,894 job descriptions across six monthly scrapes (Feb–Jun 2026, up from 895 in Jan), and the portfolio section was reworked around a domain-first methodology. Two structural changes landed: Block C is now a **domain-first RAG + agent** project (the guide: *"RAG + Agents = 70%+ of use cases"*), and Phase 3 gained timed take-home practice (take-homes are now a documented, dominant interview stage).

**Phases**
1. **Build** — May 25 → Dec 6, 2026 (28 weeks)
2. **Showcase** — Dec 7 → Dec 20, 2026 (2 weeks)
3. **Interview prep** — Dec 21, 2026 → Jan 17, 2027 (4 weeks)
4. **Apply** — Jan 18, 2027 → offer accepted

Hour budget assumption: Diego is employed, so plan against **~12 focused hrs/week** during build (evenings + weekends), ramping to **~25 hrs/week** during prep. If real budget differs, shift block lengths, not deliverables.

**Weekly cap (decided Aug 27, 2026, Build phase only):** max **1 LeetCode/NeetCode problem/week** and **1 reading topic/week**. The project (currently finishing Block B before Block C) is the priority for all remaining hours. This replaces the higher per-week NeetCode rates below from Aug 27, 2026 onward, effective immediately (mid-Block B) rather than waiting for Block C; earlier completed reps stand as-is.

---

## Phase 1 — Build (May 25 → Dec 6, 2026)

The field guide's #1 portfolio red flag is "tutorial copies." Counter-signal: **evaluation harness, tests, CI/CD, deployment, cost/observability docs.** Field guide quotes: *"a RAG system without an eval harness is incomplete"* and *"cost awareness is a superpower."* These shape every block.

### Block A — Containerize + CI/CD foundation (May 25 → Jun 21, 4 weeks)

Why now: Docker is in 31.4% of postings (field guide top skills); CI/CD in 27.7%. Both are filters before the AI work is even looked at — the guide: *"93% need skills beyond just GenAI - it's a full-stack role."*

- [x] `ai_hub/Dockerfile` + `docker-compose.yml` running the full stack locally — **done May 26**
- [x] Tests (unit + component) running inside Docker build — **done May 26**
- [x] README rewritten: architecture diagram (Mermaid), provider matrix, cost estimate, AWS + CI/CD plan — **done May 26**
- [x] GitHub Actions CI: lint + vitest on every push; Docker smoke check on PRs to main — **done May 27**
- [x] `.env.example` documenting every required key — **done May 27**
- [x] Structured cost/token logging in `onFinish` callback: `{model, provider, tokens_in, tokens_out, latency_ms, estimated_cost_usd}` — **done Jun 7**
- [ ] NeetCode: 12 problems (3/week, arrays + hashing + two pointers)

Exit criterion: `docker compose up` boots the app on a clean machine; CI is green on `main`; cost shows in logs per request.

### Block B — Evaluation harness + tests + observability (Jun 22 → Aug 2, 6 weeks)

Why: field guide says evaluation is *"the most important new skill"* for backend → AI transition, and *"unsuccessful LLM products almost always share a common root cause: a failure to create robust evaluation systems."*

- [x] Eval harness for chat route: golden dataset (~30 prompts), LLM-as-judge scoring (judge criteria include groundedness/hallucination checks, not just quality), regression report on PR — **due Jul 12, done Aug 26** (OpenAI-scoped, 16/16 passing); CI wiring **done Aug 28** (`workflow_dispatch`-only, PR-comment path untested live); all 3 providers triaged **done Aug 31** (28/30 passing — Google still blocked by account-level quota, not a code bug)
- [x] Per-provider error boundary with fallback UI (not a string error state) — **due Jul 19, done Aug 28** (see `this_week.txt` for details, incl. a real mid-stream-error rendering bug it surfaced and fixed)
- [x] Observability: request tracing, TTFT + tokens/sec + per-user cost surfaced in a `/metrics` route — **due Aug 2, done Sep 1** (in-memory per-session store, `GET /api/metrics` + a `/metrics` dashboard page; DB persistence deferred to Block C, see open decisions)
- [x] Extend the shipped cost logging with `request_id` + `prompt_version` fields — field guide's Jun 2026 logging spec is *"request ID, model name, prompt version, tool calls, latency, token use, cost"*; tool-call logging lands with the Block C agent project since ai_hub has no tools — **due Aug 2, done Sep 1** (`crypto.randomUUID()` per request; `PROMPT_VERSION` constant next to `makeSystemMessage` in `constants.ts`, the only fixed prompt template ai_hub ships)
- [x] Platzi: *Curso de Observabilidad de Agentes AI con LangSmith* — concepts prep (tracing, datasets, LLM-as-judge, cost/retention dashboards) for the `/metrics` milestone; LangSmith itself is LangChain-native so it won't be wired directly into `ai_hub` — see Block C — **done Aug 31**
- [x] NeetCode: Two Sum II - Input Array Is Sorted (167) — **done Jun 30** (two-pointers, same session as 15 and 121 below)
- [x] NeetCode: 3Sum (15) — **done Jun 30**
- [x] NeetCode: Best Time to Buy and Sell Stock (121) — **done Jun 30** (original 18-problem/6-week target below superseded by the Aug 27, 2026 1-problem/week cap; sliding window mini-series of 3, first of the series)
- [x] NeetCode: Longest Substring Without Repeating Characters (3) — **done Aug 27**
- [x] NeetCode: Longest Repeating Character Replacement (424) — **done Aug 31**, closes the sliding-window series (121 → 3 → 424)

Exit criterion: opening a PR runs eval and posts pass/fail; you can answer "what's the cost per chat session?" with a number. **MET — Block B fully closed Sep 2, 2026.** Block C is now the active block.

### Block C — Second project: domain-first RAG + agent with eval (Aug 3 → Sep 27, 8 weeks)

Why two projects: field guide says *"Build 2–3 end-to-end projects"*, RAG appears in 35.9% of postings (top-3 skill), and *"RAG + Agents = 70%+ of use cases"* — a portfolio with RAG but no agent misses half the demand. The Jun 2026 portfolio rework also flipped the picking method: *"Start from a real domain and real companies, not from a technology you want to use."* Tech-first ideas and generic chatbots are its top listed mistakes — which rules out the earlier "Algorithm Tutor RAG" framing.

**Project (decided Aug 28, 2026, flipping the Jul 3 commerce/e-commerce pick): finance domain assistant — a filing risk-change assistant.** Flip rationale: finance has the highest demand of any domain in the guide's data (2,321 mentions, 9.5% of use cases, vs. 226/0.9% for retail/e-commerce) and a lower-risk data story than either alternative — SEC filings are public record via a free, keyless API (`data.sec.gov`, live-verified), unlike e-commerce's proprietary catalogs or healthcare's PHI exposure on anything clinical. RAG core over SEC 10-K/10-Q filings (Item 1A risk factors) **plus an agentic layer**: 2 tools (`list_filings` to find current + prior period, `fetch_filing` to pull the risk-factors section) chained into a "find both periods → diff risk language → cite" workflow. Scope "Version 1" per the guide: small dataset (2–3 companies, last 4 filed periods), one useful output, one normal case (grounded cited diff) and one failure case (refuse when unanswerable) handled. Full evidence trail (job descriptions, blog/case-study sources, reference-repo study) in `PROJECT_PLAN.md`.

**Stack (decided Jul 3, one winner per layer — losers become interview talking points):**

| Layer | Pick | Over | Why |
|---|---|---|---|
| Application | FastAPI | Flask, Django | AI-serving standard; async + Pydantic. (ai_hub already covers the React/Next.js half of this layer.) |
| AI orchestration | LangChain + LangGraph | LlamaIndex, CrewAI | LangChain = 34.3% of listings; LangGraph is its agent layer (#2 in agentic listings, named in real take-homes) — they stack, not compete. |
| LLM APIs | One primary provider | — | ai_hub already demonstrates multi-provider (OpenAI/Anthropic/Google); Block C keeps one primary to stay boring. Optional differentiator: an Ollama local-model fallback (appears in real take-homes). |
| Vector DB | Postgres + pgvector | Pinecone, Weaviate | One DB for relational + vectors; agent tools need SQL joins anyway; cheapest below ~10M vectors; graduate to Pinecone only with a documented bottleneck. |
| Infrastructure | Docker + AWS (ECS) | K8s, GCP, Azure | Already decided; K8s skip is documented below. |

Plus eval/observability (cross-cutting): LangSmith tracing + Ragas metrics.

Milestones:
- [x] `PROJECT_PLAN.md` with saved evidence: 3–5 real job descriptions + 2–3 engineering-blog posts from target-vertical companies; problem statement, user, input/output defined — **due Aug 9, done Aug 28** (late — domain itself flipped to Finance same day, see open decisions)
- [ ] Vector store + ingest pipeline running — **due Aug 16**
- [x] LangSmith tracing wired into the RAG pipeline (LangChain-native, built in from the start rather than retrofit — unlike `ai_hub`) — **done Sep 15** (root-caused a 403 to an AWS-hosted LangSmith endpoint mismatch, not key validity)
- [x] Baseline RAG endpoint with citations — **due Aug 30, done Sep 15**
- [x] Eval harness: retrieval@k, faithfulness, answer relevance — **use Ragas** (decided Jul 3: RAG-specific standard, and it publishes into LangSmith traces so the two compose; ai_hub's hand-rolled harness already shows you can build one from scratch) — **due Sep 13, done Sep 22** (harness itself caught a real bug: a risk-factor fact ranked outside `top_k=5` retrieval; fixed by bumping to `top_k=7`, verified net-positive via before/after comparison — `context_recall` +0.17 with no cost to `context_precision`)
- [ ] Agent layer: ≥2 tools, tool-call logging (per the guide's logging spec), agent eval cases added to the harness — **due Sep 27**
- [ ] Reranking + a brief chunking-strategy comparison in the README (lighter than originally planned, to make room for the agent layer) — **due Sep 27**
- [x] NeetCode: Invert Binary Tree (226) — **done Sep 2**, first of the trees/graphs/BFS/DFS pattern
- [x] NeetCode: Maximum Depth of Binary Tree (104) — **done Sep 17**, 2nd of the trees pattern
- [x] NeetCode: Diameter of Binary Tree (543) — **done Sep 23**, 3rd of the trees pattern
- [ ] NeetCode: 1 problem/week (trees, graphs, BFS/DFS — you've done the Platzi course, this is reps) — reduced from 3/week, see Weekly cap above

Exit criterion: README has eval results table covering both RAG and agent behavior; you can explain why you picked your chunking strategy with numbers and walk through one full agent tool-call trace.

### Block D — AWS deployment + monitoring (Sep 28 → Nov 8, 6 weeks)

Why: AWS is in 40% of postings (field guide #3 skill); a live URL is on the field guide's portfolio must-list. `tasks.txt` already names ECS/EKS + GitHub Actions deploy.

- [ ] Both projects on Vercel (free) as first live URLs — **due Oct 5** (fast win; do this even if AWS is in progress)
- [ ] ai_hub deployed to ECS Express Mode (service + health check verified live) — **due Oct 26**
- [x] CI/CD pipeline: ECR push + ECS Express Mode deploy on merge to main (OIDC, no long-lived keys) — **done May 27** *(workflows migrated May 28)*
- [x] ECR repository provisioned, IAM role + OIDC provider configured — **done May 27**
- [ ] Provision ECS Express Mode IAM roles: execution-role + infrastructure-role; grant `iam:PassRole` on both to the OIDC role; add `ECS_EXECUTION_ROLE_ARN` + `ECS_INFRA_ROLE_ARN` GitHub secrets — **due Oct 26**
- [ ] CloudWatch alarms on error rate + cost ceiling — **due Nov 8**
- [ ] Drift monitoring: scheduled weekly eval run (GitHub Actions cron) against the live endpoint, scores logged over time, alert on score drop — catches provider-side model changes between deploys, not just code regressions — **due Nov 8**
- [ ] Merge `ai_hub` branch into `main`/prod once the ai_hub project is finished, then retest everything wired up while on the branch — in particular `ai_hub-eval.yml` (`workflow_dispatch` only registers for a workflow once its file is on the default branch, so it's never actually been run — see `project_eval-harness-triage` memory) — **due Nov 8**
- [ ] NeetCode: 1 problem/week (DP intro, greedy, intervals)

Exit criterion: two public URLs; a hiring manager can click and use them.

### Block E — Polish: READMEs, architecture, video script (Nov 9 → Dec 6, 4 weeks)

Field guide is explicit about what hiring managers spend 5-10 minutes scanning. Its Jun 2026 README spec: problem statement, **user**, **input/output**, **demo**, architecture, tests, eval results, **trade-offs**.

- [ ] Both READMEs rewritten to field-guide spec: problem + user + input/output + demo (live URL or recording) + architecture diagram (Mermaid) + models/providers matrix + cost estimate + run instructions + eval results + trade-offs — **due Nov 22**
- [ ] Loom video script drafted (90 seconds per project) using the guide's 5-part pitch: problem → user → solution → evidence → ownership; frame decisions as *"I chose X over Y because of constraint Z"* — **due Nov 29**
- [ ] Resume drafted: lead with impact metrics, not tool names; Typst format (not multi-column LaTeX, fails ATS) — **due Dec 6**
- [ ] NeetCode: 1 problem/week — running total lower than the original ~90 estimate given the reduced pace; not a target to chase
- [ ] **Decision point:** repo visibility strategy (see `project-repo-visibility` in Claude project memory) — **due Nov 15** so showcase phase can start with repo public

Exit criterion: a stranger can read either README in 5 min and understand what it does, what it cost, how it was evaluated — and both projects pass the field guide's 9-question "Quick Check" (`06-common-mistakes.md`) with all yeses.

---

## Phase 2 — Showcase (Dec 7 → Dec 20, 2026)

Two weeks. Distribution only, no new features.

- [ ] Record Loom videos (one per project, 60–90 sec) — **due Dec 11**
- [ ] Landing/personal site: links to both projects, both Looms, resume, contact — **due Dec 13**
- [ ] LinkedIn launch post with video + screenshots — **Dec 14**
- [ ] LinkedIn follow-up posts: one technical deep-dive per project — **Dec 17 & Dec 20**
- [ ] Direct outreach: 10 messages to founders/hiring managers at LATAM-friendly US companies (commerce/real-estate verticals first) — **due Dec 20**
- [ ] (Optional, high-leverage) Weekend AI hackathon if any are running — field guide: *"hackathons more effective than courses"*

Exit criterion: both projects are public, demoable in one link, and at least 10 humans have seen them.

---

## Phase 3 — Interview prep (Dec 21, 2026 → Jan 17, 2027)

Four weeks, ~25 hrs/week. The field guide's reference plan is 8–12 weeks at 6 hrs/day; you have ~100 hrs total, so prioritize ruthlessly.

### Week 1 (Dec 21–27): Coding fundamentals + AI Engineering theory

- [ ] NeetCode: bring total to 150 (you should be at ~90 from build phase → ~60 more this week)
- [ ] Coding-round drill from the guide's `interview/questions/02-coding.md` — its questions are framed as live-coding/pairing exercises, distinct from NeetCode's LeetCode-style problems
- [ ] Read Chip Huyen *AI Engineering* (2025), ch. 1–5
- [ ] Active-recall pass over the guide's `interview/questions/01-theory.md` (LLM fundamentals, transformers, RAG/embeddings basics) — answer aloud from memory, check against the reading above
- [ ] One LLM implementation-from-scratch exercise on Deep-ML (multi-head attention)

### Week 2 (Dec 28 – Jan 3): System design for AI

- [ ] Alex Xu *System Design Interview* vol. 1, chs. 1–6
- [ ] Kleppmann *Designing Data-Intensive Applications*, chs. 1–11 (skim) — field guide's own interview-prep resource list (`interview/03-get-hired.md`, via Yuan Meng's actual prep), paired with the Alex Xu read above; not a Block C/pgvector background read, added Aug 31, 2026
- [ ] Design exercises (aloud, recorded): "design a RAG-based customer support bot", "design an agent platform with tool use", "design a model-routing layer with cost caps" — prompts drawn from the guide's `interview/questions/04-ai-system-design.md`
- [ ] Chip Huyen *AI Engineering* ch. 6–10
- [ ] Timed practice take-home #1 (RAG/document Q&A) — pick a real assignment from the guide's `interview/questions/06-home-assignments.md` June 2026 list, do it under its stated time constraint
- [ ] Eval-tooling positioning (interview prep, ~2h): be able to name and compare LangSmith (LangChain-native tracing — used it), Ragas (RAG metrics — used it), Langfuse (open-source/self-hosted alternative), DeepEval (pytest-style CI eval gates), Arize Phoenix (OTel-native) — postings test eval *design* plus the ability to position tools, not one logo
- [ ] NeetCode: 20 more problems, focus on patterns you missed

### Week 3 (Jan 4–10): Mocks + behavioral

- [ ] 3 mock interviews on Pramp or interviewing.io (1 coding, 1 system design, 1 behavioral)
- [ ] Draft 8 SAIL-format stories (Situation/Action/Impact/Learning) covering: technical leadership, conflict, ambiguity, failure, cross-team work — question bank: `interview/questions/05-behavioral.md`
- [ ] Record a 60-second pitch for each portfolio project (problem → user → solution → evidence → ownership) — re-record until smooth
- [ ] Project deep-dive drill using `interview/questions/03-project-deep-dive.md` (the "walk me through a decision you'd make differently" style questions) — run it against both ai_hub and finance_rag_agent
- [ ] Timed practice take-home #2 (agentic system) — from the same June 2026 list; note prompt-injection resistance is a recurring take-home requirement
- [ ] NeetCode review: re-do the "Took time" and "Didn't get it" buckets

### Week 4 (Jan 11–17): Company-specific + final polish

- [ ] Pick 15 target companies; for each: read engineering blog, identify product, draft a "why this company" line
- [ ] Refine self-introduction blurb (field guide: ~10 iterations recommended)
- [ ] Last 3 mock interviews
- [ ] Resume final pass; LinkedIn headline + about section final
- [ ] Reference list: line up 2–3 recent manager/colleague references (field guide flags this is increasingly required)
- [ ] Final gap-check against the guide's consolidated `interview/questions/questions.md` (100+ sourced real interview questions, all categories) — skim for anything not already drilled via 01–06 above

### Aftermath

- [ ] Review fullsteam in glassdoor

Exit criterion: you can give a 60-sec project pitch and a 25-min AI system design without notes; 8 SAIL stories rehearsed; 3 references confirmed.

---

## Phase 4 — Apply (Jan 18, 2027 → offer)

Cadence: **5–10 quality applications/week** + **5 direct outreach messages/week**. Field guide: *"referrals beat cold applications"* and *"top candidates accept offers within 2–3 weeks"* once interviews start — so cluster onsites.

- [ ] Platforms: LinkedIn, Turing, Arc, Talently, Toptal, BairesDev
- [ ] [80,000 Hours job board](https://jobs.80000hours.org/?jb_source=ai__guide__when-will-agi-arrive&query=ai%20software%20engineer&numericMenu%5Bsalary_limit%5D=54000%3A&refinementList%5Btags_role_type%5D%5B0%5D=Full-time&refinementList%5Btags_exp_required%5D%5B0%5D=Multiple%20experience%20levels&refinementList%5Btags_exp_required%5D%5B1%5D=Junior%20%281-4%20years%20experience%29&refinementList%5Btags_degree_required%5D%5B0%5D=Undergraduate%20degree%20or%20less&refinementList%5Btags_skill%5D%5B0%5D=Software%20engineering&refinementList%5Btags_location_80k%5D%5B0%5D=Remote%2C%20Global) — filtered: AI software engineer, full-time, junior/multiple exp levels, remote global, $54K+ salary floor
- [ ] Target segments: product AI cos (Cursor-tier), infra (Modal/Pinecone-tier), commerce/real-estate verticals
- [ ] Weekly review: applications sent, responses, mock-interview gaps emerging from real interviews
- [ ] Negotiate on equity + total comp, not base (field guide: bands are narrow per level)
- [ ] Don't accept the first offer in isolation — cluster to create competing-offer leverage

---

## Ongoing tracking (all phases)

Maintain a Notion or markdown log with the field guide's 4 buckets per topic: **"Aced it"**, **"Took time"**, **"Didn't get it"**, **"Just saw it"**. Review weekly. Demote "Took time" to "Aced it" via reps; promote "Just saw it" via active recall.

## Field guide topics intentionally skipped

These appear in the guide but are deprioritized for Diego's profile and timeline:
- **Kubernetes** (26.6% of postings): ECS Fargate + Docker covers the deployment signal cheaper; revisit only if a target role explicitly requires it.
- **Fine-tuning / LoRA / Transformer-from-scratch in NumPy**: high effort, low yield for backend-transition roles. Skim for theory; don't build. Field guide itself: *"default to prompt engineering with RAG; fine-tune only for extreme specialization."* Re-validated by Jun 2026 data: fine-tuning is mentioned in 30.8% of roles but is a primary responsibility in only 4%.
- **Frontend deepening (React beyond what ai_hub already uses)**: not the bottleneck.
- **TensorFlow**: PyTorch dominates; skip.
- **PyTorch builds**: 26.6% of postings, but for backend-transition roles it's interview vocabulary, not a build requirement. Theory-level coverage (existing Platzi course + Chip Huyen chapters + the Deep-ML attention exercise in Phase 3) is enough; a PyTorch project would burn 4+ weeks for the weakest portfolio signal.

---

## Open decisions

1. **Repo visibility strategy** — due Nov 15. See `project-repo-visibility` in Claude project memory.
2. ~~**Second project choice** (Block C) — Algorithm Tutor RAG vs. PDF RAG. Decide by **Aug 3**.~~ ~~**Decided Jul 3, 2026: domain-first commerce/e-commerce RAG + agent**~~ **Flipped to Finance, Aug 28, 2026**: highest demand of any domain in the guide's data (2,321 mentions/9.5%, vs. 226/0.9% for retail/e-commerce) with a lower-risk data story (SEC filings/earnings calls are public record, unlike catalog/inventory data which is proprietary per-retailer) and a stronger comp story for the engineering seat. See `this_week.txt` for the full comparison against healthcare (also higher-demand than e-commerce, but ruled out here on data-access risk — clinical/PHI data isn't usable without deliberate scoping the way public filings are).
3. ~~**AWS service for Block D** — ECS Fargate (recommended) vs. EKS. Decide by **Sep 28**.~~ ~~**Decided May 27: App Runner**~~ **Decided May 2026: ECS Express Mode** (App Runner no longer accepts new customers as of Apr 30 2026; ECS Express Mode is AWS's official replacement — auto-provisions ALB, Fargate, auto-scaling, CloudWatch).
