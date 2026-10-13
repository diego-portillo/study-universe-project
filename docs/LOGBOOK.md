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
| 2026-09-17 | 104 | Maximum Depth of Binary Tree | Easy | Trees/graphs/BFS/DFS — Block C (2nd, after 226) |
| 2026-09-23 | 543 | Diameter of Binary Tree | Easy | Trees/graphs/BFS/DFS — Block C (3rd, after 104) |
| 2026-10-08 | 110 | Balanced Binary Tree | Easy | Trees/graphs/BFS/DFS — Block C (4th, closes series 226→104→543→110) |

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
| week of Sep 9–15, 2026 | LangSmith tracing docs | docs.langchain.com/langsmith (`observability-quickstart`, `observability-concepts`, `platform-setup`) | LangSmith tracing milestone (Block C, done Sep 15); `platform-setup` directly explained the AWS-hosted-endpoint 403 bug hit that week |
| week of Sep 16–22, 2026 | Ragas docs | docs.ragas.io (`getstarted/quickstart`, `concepts/metrics/overview`, `concepts/metrics/available_metrics`) | Eval harness milestone (Block C, done Sep 22) |
| week of Sep 23–29, 2026 | LangChain agents docs (`create_agent` + middleware) | docs.langchain.com/oss/python/langchain/agents; reference.langchain.com/python/langchain/agents/factory/create_agent; reference.langchain.com/python/langchain/middleware | Agent layer milestone (Block C, done Oct 1); noted `create_react_agent` (LangGraph's older prebuilt) is deprecated in favor of `create_agent` |
| week of Oct 8–13, 2026 | Next.js 16 `proxy.ts` (renamed from `middleware.ts`, now runs on the Node runtime instead of Edge) | nextjs.org/docs/app/api-reference/file-conventions/proxy | Public-demo cost safety milestone (Block D, done Oct 9) — per-IP rate limiter's `proxy.ts` rewrite; noted CVE-2025-29927 means proxy/middleware shouldn't be relied on alone for auth-style gating |

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
- **2026-09-15** — baseline RAG endpoint with citations (`app/main.py` FastAPI
  `POST /ask`, LangChain LCEL chain, pgvector retrieval, refusal path for
  empty retrieval) and LangSmith tracing (built in from the start, not
  retrofit) both landed and verified live — grounding manually cross-checked
  against retrieved chunk text, no hallucination found. Tracing's long-lived
  403 root-caused to an AWS-hosted LangSmith endpoint mismatch
  (`LANGSMITH_ENDPOINT`), not a bad key.
- **2026-09-14** — DB layer migrated `psycopg2` → SQLAlchemy after
  `<=>` operator resolution broke on a Python-list-to-`vector` cast;
  re-ran full ingest, chunk counts verified intact post-migration.
- **2026-09-22** — Ragas eval harness landed (`eval/golden_dataset.json`, 31
  questions across AMZN/NVDA/KO sourced from real filing text, plus 3
  refusal cases; `eval/run_eval.py` checks refusals via embedding cosine
  similarity rather than exact-string match, and runs `ragas.evaluate()`
  with the 4 core metrics). Two unplanned upstream dependency bugs found and
  fixed along the way (not app bugs): ragas 0.4.3 crashes on import against
  modern `langchain-community` (hardcoded, unconditional VertexAI import
  path that no longer exists — pinned `langchain-community<0.4.2`), and its
  legacy `answer_relevancy` metric needs embeddings explicitly wrapped in
  `LangchainEmbeddingsWrapper` or it throws `AttributeError` on `evaluate()`.
  Real payoff: the harness itself caught a genuine retrieval bug — "was
  repatriation-related X a risk factor for Amazon" scored wrong because the
  correct chunk ranked 20th/283 for that ticker, outside `top_k=5`;
  root-caused to a misleading date phrase in the question dominating the
  embedding match, compounded by `retrieve_chunks` having no metadata
  filter at all (confirmed `ticker` is the only structured filter it
  accepts — period/form_type are not, despite question text implying
  otherwise). Fixed via a rephrase (drops the date framing, moving the
  correct chunk from rank 20 to rank 6) plus bumping the app's default
  `top_k` 5 → 7,
  verified net-positive on a full before/after eval comparison
  (`context_recall` 0.71 → 0.89, `context_precision` unchanged — the extra
  chunks retrieved weren't noise). Two golden-dataset-only bugs also found
  and fixed (a "billion" vs "million" unit typo affecting 4 rows; the same
  misleading date-phrase pattern in 2 other questions). Metadata filtering
  (explicit `form_type`/`period` params), chunking granularity, hybrid
  search, and reranking were identified as real follow-up improvements but
  deliberately logged rather than built now, to keep this milestone scoped.

- **2026-10-01** — Agent layer landed: `app/agent.py`'s `create_agent` with 2
  tools (`list_filings`, `fetch_filing`), a custom `ToolCallLoggingMiddleware`
  (tool name/args/latency/result-size per call, per the guide's logging spec),
  `ToolCallLimitMiddleware`, `ContextEditingMiddleware`, and a custom
  `DedupeFetchFilingMiddleware` added this session (intercepts a period the
  model already fetched, returning a placeholder instead of a real ~66K-char
  re-fetch). `eval/agent_dataset.json` (4 cases — real AMZN and NVDA
  cross-period risk-factor diffs, a KO no-change case, a TSLA refusal case)
  wired into the harness via `evaluate_agent_cases` in `eval/run_eval.py`,
  checking both tool-call trajectory and answer similarity to ground truth.

  Mid-flight model swap: `OPENAI_CHAT_MODEL` changed from `gpt-4o-mini` to
  `gpt-5-mini` (checked current OpenAI pricing live — `gpt-4o-mini` is now a
  legacy tier; `gpt-5-mini` is the direct successor at $0.25/$2.00 vs.
  $0.15/$0.60 per 1M tokens, a small premium). Reason: `gpt-4o-mini` could not
  reliably diff two ~30K-token filing documents even after prompt tightening —
  it defaulted to false "no change" answers instead of doing the comparison.
  `gpt-5-mini`'s stronger reasoning fixed this, confirmed via the harness.

  The harness caught 8 real bugs across 3 rounds of fixes, each diagnosed from
  an actual eval run rather than guessed: the agent hallucinating plausible
  differences between two near-identical AMZN 10-Qs (the system prompt's
  grounding guard covered missing periods but not the diff step itself —
  fixed by requiring every claimed difference to be traceable to text present
  in one period but not the other); the agent burning its tool-call budget
  retrying `list_filings` after an empty result instead of treating that as
  definitive (fixed with an explicit "don't retry an empty result"
  instruction); a citation missing a required schema field (`company`)
  crashing the entire harness run rather than just one case (fixed with both
  a prompt instruction to fill all 7 `Citation` fields and try/except
  resilience in `evaluate_agent_cases` so one bad case can't take down the
  run); hitting OpenAI 429 rate limits mid-run, which looked like a hang
  since the SDK's retry sleep is silent — root-caused via the account's
  actual usage-tier page (Tier 1, 200K TPM) combined with the agent's
  multi-turn loop resending the full growing conversation on every call, and
  addressed via the dedup middleware plus `timeout`/`max_retries` on both
  `ChatOpenAI` instances and a pacing delay between agent eval cases; the
  grounding fix overcorrecting so NVDA — the case with by far the most real
  changes (a new Groq IP license, an OpenAI investment, a full
  export-controls rewrite) — started reporting "no change" (fixed with an
  explicit "check both texts section by section before concluding no change"
  instruction); NVDA's answer coming back truncated to a stub sentence after
  the model swap despite passing on similarity score, root-caused to
  `gpt-5-mini` (reasoning-tuned) burning its entire `max_tokens` budget on
  hidden reasoning before writing any visible answer — confirmed via the
  exact `reasoning_tokens` vs. `completion_tokens` figures in the error, and
  fixed by raising `max_tokens` (tried 4096 first, then 8000, deliberately
  avoiding touching `reasoning_effort` to not risk the quality the
  section-by-section fix had just bought back); the stronger model computing
  an unstated prior-year figure from a growth rate in context instead of
  refusing (`$574,785M / 1.12 ≈ $513,056M`) — decided not to forbid
  computation outright, instead `app/rag_chain.py`'s prompt now requires
  flagging when a figure is computable-but-not-stated and asking the user
  before computing it; and one refusal case (NVIDIA stock price) scoring just
  under the similarity threshold (0.737 vs. 0.75) on a correct answer purely
  from paraphrasing, recalibrated to 0.70 against the actual gap to a
  genuinely wrong answer (0.579).

  Methodology note on why individual eval-case review, not just the RAGAS
  aggregate: the plain-RAG RAGAS metrics dipped after the model swap
  (`answer_relevancy` 0.668→0.575, `faithfulness` 0.931→0.851), which looked
  like a quality regression. Pulling the per-row data (only ~24-27 scored
  rows, so `ragas`'s own `safe_nanmean` aggregation gives each row ~4%
  weight) showed most of the dip was scoring noise — one demonstrably correct
  answer scored `faithfulness=0.00`, another excellent answer scored `NaN`
  from a crashed scoring job (`ragas` silently degrading `answer_relevancy`'s
  usual 3-sample averaging to 1 sample since `gpt-5-mini` doesn't support the
  `n` parameter it expects). Two real misses turned up this way too (NVIDIA
  questions the model now over-cautiously refuses on) — exactly the signal
  the aggregate number alone hides with a sample this small. Flagged, not
  chased further; scope was the agent-eval milestone, not a full RAG prompt
  audit.

- **2026-10-07** — Reranking + chunking-strategy comparison landed, closing Block C's last open milestone. Cohere rerank added on top of retrieval: +0.13 on both `context_precision` and `context_recall` in a before/after eval comparison, kept. Semantic chunking tested against the existing `RecursiveCharacterTextSplitter` and found a wash — no meaningful metric movement either way — so kept the simpler recursive splitter rather than switching. README updated with both comparisons and numbers.

**Exit criterion met — Block C fully closed 2026-10-07/08, 2026** (README has an eval results table covering RAG + agent behavior; chunking strategy explainable with numbers; full agent tool-call trace walked and verified, see Oct 1 entry above).

### Block D — AWS deployment + monitoring (Oct 8, 2026 – active)

- **2026-10-08** — Vercel "fast-win live URL" step deferred, not done: a
  public ai_hub URL exposes real OpenAI/Anthropic/Google/ElevenLabs keys to
  anyone with the link, and the rate-limit/spend-cap safety work needed to
  de-risk that is needed regardless of host, so building it once as part of
  the real ECS deployment beats building it twice. See `PLAN.md` Open
  decisions #4. New prerequisite milestone added ahead of the Oct 26 ECS
  deployment: public-demo cost safety in ai_hub.
- **2026-10-09** — Public-demo cost safety landed: `ai_hub/middleware.ts`
  renamed to `proxy.ts` per Next.js 16's convention (now Node runtime, not
  Edge); `PUBLIC_DEMO_MODE`-gated global daily request cap added alongside
  the existing per-IP limiter; the output-token cap generalized to all chat
  providers; a flat daily token cap added as the cost backstop (scope
  trimmed from the original dollar-spend-cap plan — simpler, no dependency
  on `cost.ts` pricing staying accurate); a verified non-deprecated cheap
  model forced per provider when demo mode is on. Image/audio gating was
  dropped entirely from scope, same day.

---

## Task checklist (current status snapshot)

Mirrors `PLAN.md` Phase 1 — treat `PLAN.md` as the source of truth if these
ever diverge; update both together.

- [x] Block A — Containerize + CI/CD foundation
- [x] Block B — Evaluation harness + tests + observability
- [x] Block C — Domain-first RAG + agent (finance filing risk-change assistant)
  - [x] `PROJECT_PLAN.md` with saved evidence
  - [x] Vector store + ingest pipeline
  - [x] LangSmith tracing wired into the RAG pipeline
  - [x] Baseline RAG endpoint with citations
  - [x] Eval harness (Ragas: retrieval@k, faithfulness, answer relevance)
  - [x] Agent layer (≥2 tools, tool-call logging, agent eval cases)
  - [x] Reranking + chunking-strategy comparison write-up
- [ ] Block D — AWS deployment + monitoring — **active**
  - [x] Public-demo cost safety (rate limits, daily token cap, cheap-model default)
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

### Week: Sep 9 – Sep 15, 2026

```
Week: Sep 9 - Sep 15, 2026
(Block C active. Vector store + ingest pipeline closed Sep 8 (AMZN/NVDA full,
KO 10-Q only). Next up per PLAN.md: baseline RAG endpoint with citations
(due Aug 30, currently overdue) and LangSmith tracing, which PLAN.md says
should be "built in from the start rather than retrofit" — so wiring it in
alongside the endpoint, not after.)

Block C — next milestones (from PLAN.md / PROJECT_PLAN.md)
- [x] Baseline RAG endpoint with citations — originally due Aug 30
- [x] LangSmith tracing wired into the RAG pipeline (build in alongside the
        endpoint above, per PLAN.md's explicit "not retrofit" note)

Reading (1 topic/week cap, decided Aug 27, 2026)
- [x] LangSmith tracing docs — https://docs.langchain.com/langsmith — feeds
        directly into this week's tracing milestone (same pattern as last
        week's LangChain/pgvector pick)

LeetCode (1 problem/week cap, decided Aug 27, 2026 — trees/graphs/BFS/DFS
pattern, continuing after Invert Binary Tree (226) done Sep 2)
- [x] Maximum Depth of Binary Tree (104) — next in the standard tree-pattern
        progression after 226; swap if you'd rather pick a different one

Done when
- Baseline RAG endpoint answers a question with a citation end-to-end,
  LangSmith traces show up for a real request, tracing-docs reading done,
  LC 104 solved and explainable out loud.
```

### Week: Sep 16 – Sep 22, 2026

```
Week: Sep 16 - Sep 22, 2026
(Block C active. Baseline RAG endpoint + LangSmith tracing both closed Sep 15
— endpoint verified grounded live, tracing verified live after root-causing
a 403 to an AWS-hosted LangSmith endpoint mismatch. DB layer also migrated
psycopg2 -> SQLAlchemy Sep 14. Next up per PLAN.md: Ragas eval harness
(retrieval@k, faithfulness, answer relevance), due Sep 13 and already
overdue.)

Reading (1 topic/week cap, decided Aug 27, 2026)
- [x] Ragas docs — feeds directly into this week's eval harness milestone
        (same pattern as the LangSmith reading two weeks ago)
        - https://docs.ragas.io/en/stable/getstarted/quickstart/
        - https://docs.ragas.io/en/stable/concepts/metrics/overview/
        - https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/

Block C — next milestone (from PLAN.md / PROJECT_PLAN.md)
- [x] Eval harness: retrieval@k, faithfulness, answer relevance — Ragas
        (decided Jul 3: RAG-specific standard, publishes into LangSmith
        traces so the two compose) — originally due Sep 13, done Sep 22
        (harness caught a real retrieval bug, top_k bumped 5->7, verified
        net-positive — see LOGBOOK.md)


LeetCode (1 problem/week cap, decided Aug 27, 2026 — trees/graphs/BFS/DFS
pattern, continuing after Maximum Depth of Binary Tree (104) done Sep 17)
- [x] Diameter of Binary Tree (543) — next in the standard tree-pattern
        progression after 104; swap if you'd rather pick a different one

Done when
- Ragas eval harness runs against the RAG endpoint with real retrieval@k /
  faithfulness / answer-relevance scores, Ragas reading done, LC 543 solved
  and explainable out loud.
```

### Week: Sep 23 – Sep 29, 2026

```
Week: Sep 23 - Sep 29, 2026
(Block C active. Eval harness closed Sep 22 (harness caught a real retrieval
bug, top_k bumped 5->7, verified net-positive). Two milestones remain, both
due Sep 27 — Block C's own exit date: agent layer (>=2 tools, tool-call
logging, agent eval cases) and reranking + chunking-strategy write-up. Both
land in the same 5-day window this week covers.)

Block C — final milestones (from PLAN.md / PROJECT_PLAN.md), due Sep 27
- [x] Agent layer: >=2 tools, tool-call logging (per the guide's logging
        spec), agent eval cases added to the harness — done Oct 1 (see
        LOGBOOK.md for the full fix list and model-swap rationale)
- [x] Reranking + a brief chunking-strategy comparison in the README — done
        Oct 7 (Cohere rerank +0.13 context_precision/context_recall, kept;
        semantic chunking tested and found a wash, kept
        RecursiveCharacterTextSplitter instead)

Reading (1 topic/week cap, decided Aug 27, 2026)
- [x] LangChain agents docs (create_agent + middleware) — feeds directly
        into this week's agent-layer milestone; note create_react_agent
        (LangGraph's older prebuilt) is deprecated in favor of langchain's
        create_agent, so building against the current API, not training-data
        recall (per ai_hub/AGENTS.md's same warning, applied here too)
        - https://docs.langchain.com/oss/python/langchain/agents
        - https://reference.langchain.com/python/langchain/agents/factory/create_agent
        - https://reference.langchain.com/python/langchain/middleware

LeetCode (1 problem/week cap, decided Aug 27, 2026 — trees/graphs/BFS/DFS
pattern, continuing after Diameter of Binary Tree (543) done Sep 23)
- [x] Balanced Binary Tree (110) — next in the standard tree-pattern
        progression after 543; swap if you'd rather pick a different one

Done when
- Agent layer answers a question using >=2 tools with logged tool calls and
  passing eval cases, reranking + chunking-strategy write-up added to the
  README, LangChain agents reading done, LC 110 solved and explainable out
  loud.
```

This week ran long past its nominal Sep 29 end date — the agent layer (Oct 1)
and reranking/chunking (Oct 7) milestones both slipped past the Sep 27 Block C
exit date, and LC 110 wasn't solved until Oct 8. Per the "don't rotate early"
rule, this stayed the active `this_week.txt` until all three — Reading,
milestones, LeetCode — were done, rather than rotating on the calendar
boundary. **This close-out also marks Block C fully closed** (see the Oct 7
entry and task checklist above) — Block D (AWS deployment + monitoring) is
now active, with the Oct 8, 2026 decision to defer the Vercel fast-win step
(see `PLAN.md` Open decisions #4).

### Week: Oct 8 – Oct 14, 2026

```
Week: Oct 8 - Oct 14, 2026
(Block C fully closed Oct 7/8 — agent layer, reranking/chunking write-up,
LC 110, and this week's reading all done; see LOGBOOK.md's Oct 7 entry and
task checklist. Block D (AWS deployment + monitoring) is now active.

Decided Oct 8, 2026: the "Vercel fast-win live URL" step (PLAN.md, originally
due Oct 5) is deferred, not done. ai_hub's public URL exposes real
OpenAI/Anthropic/Google/ElevenLabs keys to anyone with the link — without a
rate limit/spend cap that's an open-ended cost risk, same class of problem as
the earlier AWS idle-cost incident. That safety work is needed regardless of
host (Vercel or AWS), so building it once, properly, as part of the real ECS
deployment beats building it twice — once hastily for a throwaway Vercel
link. See PLAN.md Open decisions #4 for the full rationale. Interim showcase
until a live URL exists: the Loom video (Phase 2) + screenshots.)

Block D — first milestone (from PLAN.md), new prerequisite ahead of the
Oct 26 ECS deployment
- [x] Public-demo cost safety in ai_hub: per-IP + global daily rate limit,
        daily token cap, and cheap-model default for any publicly-reachable
        deployment — built in before any live URL goes up, not bolted on
        after. (Scope trimmed from the original plan during implementation:
        dollar spend cap swapped for a flat daily token cap — simpler, no
        dependency on cost.ts pricing staying accurate — and image/audio
        gating dropped entirely, decided Oct 9, 2026.)

Reading (1 topic/week cap, decided Aug 27, 2026)
- [x] Next.js 16 proxy.ts (renamed from middleware.ts, now runs on the Node
        runtime instead of Edge) — directly relevant to implementing the
        per-IP rate limiter above; per ai_hub/AGENTS.md's warning, confirm
        against ai_hub/node_modules/next/dist/docs/ (local, version-matched)
        rather than relying on a public page or training-data recall of the
        old middleware.ts convention
        - https://nextjs.org/docs/app/api-reference/file-conventions/proxy
        - note: proxy.ts handles request/response manipulation, not auth —
          CVE-2025-29927 means middleware/proxy should not be relied on alone
          for auth-style gating

LeetCode (1 problem/week cap, decided Aug 27, 2026 — new pattern per PLAN.md's
Block D line: DP intro, greedy, intervals, after closing the trees/graphs/
BFS/DFS series with Balanced Binary Tree (110) on Oct 8)
- [ ] Climbing Stairs (70) — standard first DP-intro problem; swap if you'd
        rather pick a different one

Done when
- Rate limit + token cap + demo-mode safety work lands in ai_hub (even if not
  yet deployed), Next.js proxy.ts reading done, LC 70 solved and explainable
  out loud.
```

Closed out 2026-10-13 with LC 70 (Climbing Stairs) explicitly dropped, not
done — Diego's call, not a slip. Reading and the Block D milestone (public-
demo cost safety) were both done; LeetCode was the only open item. The
DP-intro series (Climbing Stairs → ...) restarts whenever LeetCode resumes.
