# Logbook

Tracked progress log: code/project milestones, readings, and LeetCode/NeetCode
reps. Companion to `PLAN.md` (the forward-looking plan) and `PROJECT_PLAN.md`
(Block C domain evidence) — this file is the backward-looking record.

**Why this file exists:** `this_week.txt` is git-ignored (local scratch,
rewritten every week) and an earlier logbook kept the same way was lost when
deleted locally — git history has no trace of it (checked `git log --all`
across all 7 branches, `git fsck --dangling` for orphaned blobs: nothing).
This file is tracked in git going forward specifically so that doesn't happen
again. At the end of each week, archive that week's `this_week.txt` into the
"Weekly checkpoints" section below and commit.

Reconstructed 2026-09-09 from `PLAN.md`/`PROJECT_PLAN.md`'s own dated
annotations, full git history across all branches, and Diego's LeetCode
submission history. Reading history before 2026-09-02 could not be recovered
beyond what's listed below — `this_week.txt`'s weekly Reading section was
never committed anywhere before this file existed, so any topics logged there
in earlier weeks are gone for good.

---

## LeetCode / NeetCode log

Dates are LeetCode's own accepted-submission dates (ground truth — see the
PLAN.md correction note below).

| Date | # | Problem | Difficulty | Pattern / Block |
|---|---|---|---|---|
| unknown (oldest in submission history) | 1 | Two Sum | Easy | Arrays/Hashing — Block A |
| 2026-05-27 | 217 | Contains Duplicate | Easy | Arrays/Hashing — Block A |
| 2026-05-29 | 242 | Valid Anagram | Easy | Arrays/Hashing — Block A |
| 2026-05-29 | 125 | Valid Palindrome | Easy | Two Pointers — Block A |
| 2026-06-30 | 167 | Two Sum II — Input Array Is Sorted | Med. | Two Pointers — Block A/B (untracked in PLAN.md until now) |
| 2026-06-30 | 15 | 3Sum | Med. | Two Pointers — Block A/B (untracked in PLAN.md until now) |
| 2026-06-30 | 121 | Best Time to Buy and Sell Stock | Easy | Sliding window — Block B (1 of 3) |
| 2026-08-27 | 3 | Longest Substring Without Repeating Characters | Med. | Sliding window — Block B (2 of 3) |
| 2026-08-31 | 424 | Longest Repeating Character Replacement | Med. | Sliding window — Block B (3 of 3, closes series 121→3→424) |
| 2026-09-02 | 226 | Invert Binary Tree | Easy | Trees/graphs/BFS/DFS — Block C (1st, new pattern per PLAN.md) |

**PLAN.md correction (2026-09-09):** the Block B bullets for 121/3/424 had
"done" dates each off by one entry (121 said Aug 27 — actually Jun 30; 3 said
Aug 31 — actually Aug 27; 424 said Sep 2 — actually Aug 31), and 15/167 were
never logged at all despite being solved the same day as 121. Corrected in
`PLAN.md` and backfilled here.

Block A's original NeetCode target ("12 problems, 3/week, arrays + hashing +
two pointers") stayed unchecked — only 4 problems (1, 217, 242, 125) actually
landed inside Block A's May 25–Jun 21 window. That's fine; the weekly cap
decided Aug 27, 2026 (see `PLAN.md`) formally superseded the higher target.

---

## Reading log

Sparse by necessity — see the provenance note at the top of this file for why
anything before Sep 2 beyond what's below is unrecoverable.

| Done | Topic | Source | Fed into |
|---|---|---|---|
| through 2026-08-28 (ongoing background) | `ai-engineering-field-guide` — interview/portfolio/learning-paths/role-data sections | github.com/alexeygrigorev/ai-engineering-field-guide | `PLAN.md`'s May 26 + Aug 20 rewrites; `PROJECT_PLAN.md` (built following the guide's `portfolio/02-how-to-pick-a-project.md` workflow, Block C domain-flip evidence) |
| 2026-08-31 | Platzi: *Curso de Observabilidad de Agentes AI con LangSmith* (tracing, datasets, LLM-as-judge, cost/retention dashboards) | Platzi | `/metrics` observability milestone (Block B, done Sep 1) |
| week of Sep 2–8, 2026 | LangChain + pgvector: ingestion/chunking docs | python.langchain.com (`recursive_text_splitter`, text-splitters overview, pgvector integration) | Vector store + ingest pipeline milestone (Block C, done Sep 8) |

Background, not individually dated: 100+ prior Platzi courses (RAG/Azure,
LangChain, Agents, MCP, Prompt Engineering, NLP, PyTorch, AWS, Node.js, React,
algorithms/DS) — completed before this repo/plan existed, per `CLAUDE.md`'s
bio section. No per-course dates are recoverable from anything in this repo.

---

## Project milestone timeline

Condensed from `PLAN.md`'s own dated bullets + git history across all
branches. `PLAN.md` remains the authoritative detail source; this is the
durable cross-check copy.

### Pre-plan (2026-01-31 – 2026-05-24)

Self-directed algorithm/pattern practice and early prototyping, before the
field-guide-driven `PLAN.md` existed (created 2026-05-26).

- **2026-01-31 → 2026-04-15** — DFS/BFS/backtracking practice: n-ary tree DFS,
  islands (recursive + iterative DFS, then BFS), minesweeper, snake/stairs,
  IP restoration, phone-letter combinations, word search, N-Queens,
  permutations, combination sum — see `algorithms/*.py` for the full set.
  Commit messages read like a running journal (e.g. "failed miserably, need
  to keep trying" Feb 6 → "cool, used known concepts to solve" Mar 19 →
  "the previous knowledge serves me to apply in new problems and solve them
  faster" Apr 15) — visible progression from struggling with a pattern cold
  to recognizing and reapplying it.
- **2026-04-16 – 2026-04-22** — first Docker experiments (`backend_flask`,
  `backend_node`, `static_website`).
- **2026-04-21 – 2026-04-27** — first GitHub Actions workflows.
- **2026-05-05** — GitHub Actions course finished; first RAG prototype
  (`RAG/` — no models yet).
- **2026-05-06 – 2026-05-19** — `LLM_API` (ai_hub's predecessor) built:
  OpenAI integration → image gen/interpretation → Node chat terminal →
  Anthropic → Gemini → AI SDK + ElevenLabs.
- **2026-05-21 – 2026-05-22** — first tests; Claude Code Review + PR Assistant
  GitHub Actions workflows added.

### Block A — Containerize + CI/CD foundation (May 25 – Jun 21, 2026)

- **2026-05-26** — `ai_hub/Dockerfile` + `docker-compose.yml` running full
  stack locally; tests running inside Docker build; README rewritten
  (architecture diagram, provider matrix, cost estimate, AWS + CI/CD plan);
  `PLAN.md` itself created this day.
- **2026-05-27** — GitHub Actions CI (lint + vitest on push, Docker smoke
  check on PRs); `.env.example` documenting every required key.
- **2026-05-27 – 2026-05-29** — AWS infra: ECR + OIDC IAM role, ECS deploy
  pipeline, security/infra fixes.
- **Jun 7 / Jun 16 (PLAN.md says done Jun 7; the actual commit —
  "Add per-request cost/latency logging and remove deprecated models" —
  landed Jun 16)** — structured cost/token logging in the chat route's
  `onFinish` callback.
- NeetCode 12-problem target: **not fully met** (see LeetCode log above) —
  superseded by the Aug 27 weekly cap.

**Exit criterion met:** `docker compose up` boots clean; CI green on main;
cost visible per request.

### Block B — Evaluation harness + tests + observability (Jun 22 – Aug 2, 2026)

- **2026-08-25 – 2026-08-26** — eval harness built: golden dataset (~30
  prompts), LLM-as-judge scoring, live web-search tool per provider, judge
  model switched to a separate model from the app's own (avoid self-judging
  bias), multiple false-negative/hang bug fixes. OpenAI-scoped triage:
  16/16 passing.
- **2026-08-28** — per-provider error boundary with fallback UI (surfaced and
  fixed a real mid-stream-error rendering bug); manual-only eval CI workflow
  added (`workflow_dispatch`, untested live — `main` was behind `ai_hub`, so
  the workflow never registered for dispatch); Block C domain flipped from
  e-commerce to finance same day.
- **2026-08-31** — full 3-provider eval run: 28/30 passing (Google blocked by
  account-level quota, not a code bug); Platzi LangSmith course done.
- **2026-09-01 / 2026-09-02 (committed)** — `/metrics` observability route
  (TTFT, tokens/sec, per-user cost); `request_id` + `prompt_version` added to
  chat-route logging.

**Exit criterion met — Block B fully closed 2026-09-02, 2026.**

### Block C — Domain-first RAG + agent: finance filing risk-change assistant (Aug 3 – Sep 27, 2026)

- **2026-08-28** — domain flipped to finance (highest-demand domain in the
  field guide's data, lowest data-access risk via free/keyless SEC EDGAR);
  `PROJECT_PLAN.md` created with saved evidence (5 job descriptions, 3
  blog/case-study sources, 2 reference repos studied).
- **2026-09-03** — pilot companies picked: AMZN, NVDA, KO.
- **2026-09-08** — vector store + ingest pipeline landed (`finance_rag_agent/`
  — Postgres+pgvector schema, EDGAR client, chunking, extraction, embed/store,
  ingest runner). Per `project_finance-rag-agent-ingest-progress` memory: full
  pipeline verified; AMZN/NVDA loaded in full, KO 10-Q only (KO 10-K
  excluded).

**Still open:** LangSmith tracing wired into the pipeline; baseline RAG
endpoint with citations (due Aug 30, currently overdue); Ragas eval harness
(due Sep 13); agent layer, ≥2 tools (due Sep 27); reranking + chunking
write-up (due Sep 27).

---

## Task checklist (current status snapshot)

Mirrors `PLAN.md` Phase 1 — treat `PLAN.md` as the source of truth if these
ever diverge; update both together.

- [x] Block A — Containerize + CI/CD foundation
- [x] Block B — Evaluation harness + tests + observability
- [ ] Block C — Domain-first RAG + agent (finance filing risk-change assistant) — **active**
  - [x] `PROJECT_PLAN.md` with saved evidence
  - [x] Vector store + ingest pipeline
  - [ ] LangSmith tracing wired into the RAG pipeline
  - [ ] Baseline RAG endpoint with citations
  - [ ] Eval harness (Ragas: retrieval@k, faithfulness, answer relevance)
  - [ ] Agent layer (≥2 tools, tool-call logging, agent eval cases)
  - [ ] Reranking + chunking-strategy comparison write-up
- [ ] Block D — AWS deployment + monitoring
- [ ] Block E — Polish: READMEs, architecture, video script
- [ ] Phase 2 — Showcase
- [ ] Phase 3 — Interview prep
- [ ] Phase 4 — Apply

---

## Weekly checkpoints

Archive of each week's `this_week.txt` at week's end, verbatim.

### Week: Sep 2 – Sep 8, 2026

```
Week: Sep 2 - Sep 8, 2026
(Phase 1, Block B closed Sep 2 — exit criterion met, cost-per-session answerable
via /metrics. Block C (finance domain: filing risk-change assistant) is now the
active block. First Block C milestone below was originally due Aug 16 and is
carried over, not reprioritized away.)

Block C — first milestone (from PLAN.md / PROJECT_PLAN.md)
- [x] Vector store + ingest pipeline running (Postgres + pgvector, decided Jul 3;
        SEC EDGAR 10-K/10-Q filings, Item 1A risk factors, per PROJECT_PLAN.md's
        2-3 company / last-4-period scope) — originally due Aug 16

Reading (1 topic/week cap, decided Aug 27, 2026)
- [x] LangChain + pgvector: ingestion/chunking docs — directly feeds this week's
        vector-store milestone (first Block C reading pick; prior weeks' reading
        was scoped to Block B's own gaps, this is the first one scoped to Block C)
        - https://python.langchain.com/docs/how_to/recursive_text_splitter/
        - https://python.langchain.com/docs/how_to/#text-splitters
        - https://python.langchain.com/docs/integrations/vectorstores/pgvector/

LeetCode (1 problem/week cap, decided Aug 27, 2026 — new pattern: trees/graphs/
BFS/DFS per PLAN.md's Block C NeetCode line, sliding-window series closed last
week with 424)
- [x] Invert Binary Tree (226) — first problem of the trees pattern

Done when
- Vector store + ingest pipeline runs end-to-end against at least one filing,
  LangChain/pgvector ingestion reading done, LC 226 solved and explainable out
  loud.
```
