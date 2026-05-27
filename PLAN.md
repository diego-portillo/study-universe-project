# Plan: Backend Dev → AI Software Engineer, May 2026 → Jan 2027

Source: synthesized from `alexeygrigorev/ai-engineering-field-guide` (interview, portfolio, learning-paths/from-backend-engineer, role md files). Targets the gap between Diego's current state (strong Python/AI breadth via Platzi, weak on shipped/deployed AI projects, Docker) and what US-remote AI Engineer postings actually demand.

**Phases**
1. **Build** — May 25 → Dec 6, 2026 (28 weeks)
2. **Showcase** — Dec 7 → Dec 20, 2026 (2 weeks)
3. **Interview prep** — Dec 21, 2026 → Jan 17, 2027 (4 weeks)
4. **Apply** — Jan 18, 2027 → offer accepted

Hour budget assumption: Diego is employed, so plan against **~12 focused hrs/week** during build (evenings + weekends), ramping to **~25 hrs/week** during prep. If real budget differs, shift block lengths, not deliverables.

---

## Phase 1 — Build (May 25 → Dec 6, 2026)

The field guide's #1 portfolio red flag is "tutorial copies." Counter-signal: **evaluation harness, tests, CI/CD, deployment, cost/observability docs.** Field guide quotes: *"a RAG system without an eval harness is incomplete"* and *"cost awareness is a superpower."* These shape every block.

### Block A — Containerize + CI/CD foundation (May 25 → Jun 21, 4 weeks)

Why now: Docker is in 31% of postings (field guide top skills); CI/CD in 29%. Both are filters before the AI work is even looked at.

- [x] `ai_hub/Dockerfile` + `docker-compose.yml` running the full stack locally — **done May 26**
- [x] Tests (unit + component) running inside Docker build — **done May 26**
- [x] README rewritten: architecture diagram (Mermaid), provider matrix, cost estimate, AWS + CI/CD plan — **done May 26**
- [ ] GitHub Actions workflow: run Vitest + lint on every push, green badge in README — **due Jun 14**
- [ ] `.env.example` documenting every required key — **due Jun 14**
- [ ] Structured cost/token logging in `onFinish` callback: `{model, provider, tokens_in, tokens_out, latency_ms, estimated_cost_usd}` — **due Jun 21**
- [ ] NeetCode: 12 problems (3/week, arrays + hashing + two pointers)

Exit criterion: `docker compose up` boots the app on a clean machine; CI is green on `main`; cost shows in logs per request.

### Block B — Evaluation harness + tests + observability (Jun 22 → Aug 2, 6 weeks)

Why: field guide says evaluation is *"the most important new skill"* for backend → AI transition, and *"unsuccessful LLM products almost always share a common root cause: a failure to create robust evaluation systems."*

- [ ] Eval harness for chat route: golden dataset (~30 prompts), LLM-as-judge scoring, regression report on PR — **due Jul 12**
- [ ] Per-provider error boundary with fallback UI (not a string error state) — **due Jul 19**
- [ ] Model comparison view: same prompt → 2 models side-by-side — **due Jul 26**
- [ ] Observability: request tracing, TTFT + tokens/sec + per-user cost surfaced in a `/metrics` route — **due Aug 2**
- [ ] NeetCode: 18 more problems (sliding window, binary search, stack)

Exit criterion: opening a PR runs eval and posts pass/fail; you can answer "what's the cost per chat session?" with a number.

### Block C — Second project: RAG system with eval (Aug 3 → Sep 27, 8 weeks)

Why two projects: field guide says *"Build 2–3 end-to-end projects"* and RAG appears in 36% of job postings (top-3 skill). You already have `RAG/` + `data/algorithms/` started — extend it into a polished standalone project.

Pick **one** (don't try two):
- **Option A (recommended): "Algorithm Tutor RAG"** — Q&A over your `data/algorithms/` corpus + LeetCode patterns. Uses pgvector or Pinecone, reranking, eval harness, citations.
- **Option B:** PDF/docs RAG with chunking-strategy comparison (field guide explicitly praises this format — *"received two offers within 72 hours"*).

Milestones:
- [ ] Vector store + ingest pipeline running — **due Aug 16**
- [ ] Baseline RAG endpoint with citations — **due Aug 30**
- [ ] Eval harness: retrieval@k, faithfulness, answer relevance (Ragas or hand-rolled) — **due Sep 13**
- [ ] Reranking + chunking-strategy comparison documented in README — **due Sep 27**
- [ ] NeetCode: 24 more problems (trees, graphs, BFS/DFS — you've done the Platzi course, this is reps)

Exit criterion: README has eval results table; you can explain why you picked your chunking strategy with numbers.

### Block D — AWS deployment + monitoring (Sep 28 → Nov 8, 6 weeks)

Why: AWS is in 40% of postings (field guide #3 skill); a live URL is on the field guide's portfolio must-list. `tasks.txt` already names ECS/EKS + GitHub Actions deploy.

- [ ] Both projects on Vercel (free) as first live URLs — **due Oct 5** (fast win; do this even if AWS is in progress)
- [ ] ai_hub deployed to AWS (ECS Fargate is simpler than EKS; pick one) — **due Oct 26**
- [ ] CI/CD pipeline pushes image to ECR + deploys on merge to main — **due Nov 2**
- [ ] CloudWatch alarms on error rate + cost ceiling — **due Nov 8**
- [ ] NeetCode: 18 more (DP intro, greedy, intervals)

Exit criterion: two public URLs; a hiring manager can click and use them.

### Block E — Polish: READMEs, architecture, video script (Nov 9 → Dec 6, 4 weeks)

Field guide is explicit about what hiring managers spend 5-10 minutes scanning: problem statement, architecture diagram, eval results, cost, how to run.

- [ ] Both READMEs rewritten to field-guide spec: problem + architecture diagram (Mermaid) + models/providers matrix + cost estimate + run instructions + eval results — **due Nov 22**
- [ ] Loom video script drafted (90 seconds per project) — **due Nov 29**
- [ ] Resume drafted: lead with impact metrics, not tool names; Typst format (not multi-column LaTeX, fails ATS) — **due Dec 6**
- [ ] NeetCode: 18 more — **running total ~90 problems by end of build**
- [ ] **Decision point:** repo visibility strategy (see `memory/project_repo_visibility.md`) — **due Nov 15** so showcase phase can start with repo public

Exit criterion: a stranger can read either README in 5 min and understand what it does, what it cost, how it was evaluated.

---

## Phase 2 — Showcase (Dec 7 → Dec 20, 2026)

Two weeks. Distribution only, no new features.

- [ ] Record Loom videos (one per project, 60–90 sec) — **due Dec 11**
- [ ] Landing/personal site: links to both projects, both Looms, resume, contact — **due Dec 13**
- [ ] LinkedIn launch post with video + screenshots — **Dec 14**
- [ ] LinkedIn follow-up posts: one technical deep-dive per project — **Dec 17 & Dec 20**
- [ ] Direct outreach: 10 messages to founders/hiring managers at LATAM-friendly US companies (commerce/real-estate verticals first per `a.txt`) — **due Dec 20**
- [ ] (Optional, high-leverage) Weekend AI hackathon if any are running — field guide: *"hackathons more effective than courses"*

Exit criterion: both projects are public, demoable in one link, and at least 10 humans have seen them.

---

## Phase 3 — Interview prep (Dec 21, 2026 → Jan 17, 2027)

Four weeks, ~25 hrs/week. The field guide's reference plan is 8–12 weeks at 6 hrs/day; you have ~100 hrs total, so prioritize ruthlessly.

### Week 1 (Dec 21–27): Coding fundamentals + AI Engineering theory

- [ ] NeetCode: bring total to 150 (you should be at ~90 from build phase → ~60 more this week)
- [ ] Read Chip Huyen *AI Engineering* (2025), ch. 1–5
- [ ] One LLM implementation-from-scratch exercise on Deep-ML (multi-head attention)

### Week 2 (Dec 28 – Jan 3): System design for AI

- [ ] Alex Xu *System Design Interview* vol. 1, chs. 1–6
- [ ] Design exercises (aloud, recorded): "design a RAG-based customer support bot", "design an agent platform with tool use", "design a model-routing layer with cost caps"
- [ ] Chip Huyen *AI Engineering* ch. 6–10
- [ ] NeetCode: 20 more problems, focus on patterns you missed

### Week 3 (Jan 4–10): Mocks + behavioral

- [ ] 3 mock interviews on Pramp or interviewing.io (1 coding, 1 system design, 1 behavioral)
- [ ] Draft 8 SAIL-format stories (Situation/Action/Impact/Learning) covering: technical leadership, conflict, ambiguity, failure, cross-team work
- [ ] Record a 60-second pitch for each portfolio project — re-record until smooth
- [ ] NeetCode review: re-do the "Took time" and "Didn't get it" buckets

### Week 4 (Jan 11–17): Company-specific + final polish

- [ ] Pick 15 target companies; for each: read engineering blog, identify product, draft a "why this company" line
- [ ] Refine self-introduction blurb (field guide: ~10 iterations recommended)
- [ ] Last 3 mock interviews
- [ ] Resume final pass; LinkedIn headline + about section final
- [ ] Reference list: line up 2–3 recent manager/colleague references (field guide flags this is increasingly required)

Exit criterion: you can give a 60-sec project pitch and a 25-min AI system design without notes; 8 SAIL stories rehearsed; 3 references confirmed.

---

## Phase 4 — Apply (Jan 18, 2027 → offer)

Cadence: **5–10 quality applications/week** + **5 direct outreach messages/week**. Field guide: *"referrals beat cold applications"* and *"top candidates accept offers within 2–3 weeks"* once interviews start — so cluster onsites.

- [ ] Platforms (per `a.txt`): LinkedIn, Turing, Arc, Talently, Toptal, BairesDev
- [ ] Target segments: product AI cos (Cursor-tier), infra (Modal/Pinecone-tier), commerce/real-estate verticals
- [ ] Weekly review: applications sent, responses, mock-interview gaps emerging from real interviews
- [ ] Negotiate on equity + total comp, not base (field guide: bands are narrow per level)
- [ ] Don't accept the first offer in isolation — cluster to create competing-offer leverage

---

## Ongoing tracking (all phases)

Maintain a Notion or markdown log with the field guide's 4 buckets per topic: **"Aced it"**, **"Took time"**, **"Didn't get it"**, **"Just saw it"**. Review weekly. Demote "Took time" to "Aced it" via reps; promote "Just saw it" via active recall.

## Field guide topics intentionally skipped

These appear in the guide but are deprioritized for Diego's profile and timeline:
- **Kubernetes** (29% of postings): ECS Fargate + Docker covers the deployment signal cheaper; revisit only if a target role explicitly requires it.
- **Fine-tuning / LoRA / Transformer-from-scratch in NumPy**: high effort, low yield for backend-transition roles. Skim for theory; don't build. Field guide itself: *"default to prompt engineering with RAG; fine-tune only for extreme specialization."*
- **Frontend deepening (React beyond what ai_hub already uses)**: not the bottleneck.
- **TensorFlow**: PyTorch dominates; skip.

---

## Open decisions

1. **Repo visibility strategy** — due Nov 15. See `memory/project_repo_visibility.md`.
2. **Second project choice** (Block C) — Algorithm Tutor RAG vs. PDF RAG. Decide by **Aug 3**.
3. **AWS service for Block D** — ECS Fargate (recommended) vs. EKS. Decide by **Sep 28**.
