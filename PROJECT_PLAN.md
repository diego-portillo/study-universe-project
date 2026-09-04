# Block C — Project Plan (Finance domain)

Domain decided 2026-08-28 (flipped from the Jul 3 commerce/e-commerce pick — see `PLAN.md` open decisions and the `project-block-c-scope-decision` memory for the demand/risk/comp comparison against e-commerce and healthcare). Built following the guide's `portfolio/02-how-to-pick-a-project.md` workflow.

## Domain: Finance

Picked over e-commerce (the original Jul 3 choice) and healthcare (the runner-up) on three axes:
- **Demand:** highest of any domain in the guide's use-case data — 2,321 mentions (9.5% of use cases), vs. 1,783 for healthcare and 226 for retail/e-commerce.
- **Data-access risk:** lowest of the three once scoped correctly — SEC EDGAR filings are public record with a free, keyless API (verified live, see Data source below), vs. e-commerce's proprietary per-retailer catalogs or healthcare's HIPAA/PHI exposure on anything clinical.
- **Comp:** fintech/banking pays an above-market premium for engineering talent generally, though that premium compresses for the US-remote/LATAM-contractor channel this job search actually targets (Turing/Toptal/BairesDev, per Phase 4) rather than US-onshore FTEs.

## Technology

Reuses decisions already made in `PLAN.md`'s Block C stack table (domain-agnostic, so the Finance flip didn't change any of these):

| Layer | Choice |
|---|---|
| Application | FastAPI |
| AI orchestration | LangChain + LangGraph |
| LLM API | One primary provider (kept boring — `ai_hub` already demonstrates multi-provider) |
| Vector DB | Postgres + pgvector |
| Eval approach | `ai_hub/evals/`'s exact pattern — golden dataset + LLM-as-judge + baseline-diff report, redeployed rather than reinvented (see "Repos studied" below for why this specifically matters here) |
| Infrastructure | Docker + AWS ECS |

## Data source: SEC EDGAR

`data.sec.gov` — public, free, no API key or signup. Only requirement is a descriptive `User-Agent` header per SEC's fair-use policy. Verified live on 2026-08-28 against Apple's real filing history (CIK 0000320193): returned actual accession numbers, filing dates, and document filenames for real 10-K/10-Q filings, no auth beyond the header. No daily quota to run into — unlike the Gemini "exceeded your current quota" wall hit during `ai_hub`'s own eval run the same day.

## Companies (5 job descriptions, 3 blog/case-study sources)

| Company | Job description | What it signals |
|---|---|---|
| Capital One | [Senior Lead AI Engineer, GenAI Platform Services](https://builtin.com/job/senior-lead-ai-engineer-gen-ai-platform-services/9420327) | Platform-level GenAI engineering, not research — building the infra other teams build on. |
| Wells Fargo | [Lead Specialty AI Java Software Engineer, Electronic Trading](https://builtin.com/job/lead-specialty-ai-java-software-engineer-electronic-trading/9879596) | AI applied directly inside a trading workflow, not a bolt-on chatbot. |
| BlackRock | [Rust AI Engineer, Director](https://builtin.com/job/rust-ai-engineer-director/9629914) | Asset-manager-side AI engineering — performance-sensitive, not just prototyping. |
| Bloomberg | [Senior GenAI Platform Engineer](https://bloomberg.avature.net/careers/JobDetail/Senior-GenAI-Platform-Engineer-Artificial-Intelligence/18586) | "Build better search, discovery, and workflow solutions" — Bloomberg's core business *is* financial-document retrieval. Requires MCP/A2A/LangGraph/LlamaIndex/Pydantic AI — the same tool-use stack this project would use. |
| Morgan Stanley | [AI Engineer](https://morganstanley.eightfold.ai/careers/job/549797703474) | Building/deploying AI agents at scale; LangChain/LangGraph/CrewAI/AutoGen required. |

| Source | Link | Problem it reveals |
|---|---|---|
| Capital One Tech Blog | [capitalone.com/tech/blog](https://www.capitalone.com/tech/blog/) | General GenAI-platform engineering practices at a bank. |
| BlackRock Engineering Blog | [engineering.blackrock.com](https://engineering.blackrock.com/) | Engineering practices at an asset manager working with financial documents at scale. |
| Morgan Stanley × OpenAI case study | [openai.com/index/morgan-stanley](https://openai.com/index/morgan-stanley/) | **Most concrete source.** "AI @ Morgan Stanley Assistant" gives financial advisors RAG access to ~100,000 internal research reports; 98% of advisor teams actively use it. Evaluation-driven rollout (human graders scoring summarization accuracy/coherence before shipping). Companion tools: "Debrief" (meeting summarization) and "AskResearchGPT". |

## Problems extracted

```text
Analysts need to compare a company's SEC filings across periods and surface
what changed in the stated risk factors, without re-reading full documents
each time.

Advisors/analysts need fast, cited answers pulled from a large corpus of
financial documents instead of manually searching through hundreds of pages —
and the system must refuse rather than guess when the corpus doesn't contain
an answer.
```

Both problems are directly evidenced above: the first matches BlackRock/Capital One-style "financial document analysis" JDs and the guide's own Finance problem list ("extract risks from filings or earnings calls," "monitor policy or compliance changes"); the second is Morgan Stanley's actual production system, at a scale (100K documents, 98% adoption) that validates the problem is real and worth solving, not invented for a demo. (The first problem originally also named earnings-call transcripts — dropped from the wording here since the selected candidate below scopes to EDGAR filings only; see that section for why.)

## Selected project candidate

```text
Project: Filing risk-change assistant
User: equity/credit research analyst
Input: a company's SEC 10-K/10-Q filings across consecutive periods, plus a
       natural-language question
Output: a grounded, cited answer — either a summary of how the stated Item 1A
        risk factors changed period-over-period, or a direct answer to the
        analyst's question — with citations to the exact filing text. Refuses
        (doesn't guess) when the corpus doesn't support an answer.
Why it fits: RAG (grounding + citations + refusal behavior), agentic layer
             (≥2 tools: list_filings(ticker, form_type) to find the current +
             prior filing, fetch_filing(ticker, form_type, period) to pull the
             risk-factors section, chained into a "find both periods → fetch
             both → diff risk language → cite" workflow), evals (risk-factor
             extraction accuracy, diff correctness, citation groundedness,
             refusal correctness — same shape as ai_hub's existing eval
             harness), and a single, free, keyless public data source
             (SEC EDGAR's data.sec.gov API — no signup, no quota risk like the
             Gemini exhaustion hit during ai_hub's own eval runs).

Note: earlier draft of this problem also pulled earnings-call transcripts.
Dropped — transcripts have no free, keyless public API (they sit behind
Seeking Alpha / paid data providers), which would've meant mixing in a
second, less reliable data source for no real gain. EDGAR alone already
covers this problem (10-K/10-Q Item 1A risk factors across periods), and
8-K exhibits often carry earnings press releases if that angle is wanted later.
```

**Version 1 scope** (per the guide: small dataset, one useful output, one normal case, one failure case):
- Small dataset: 2–3 companies, last 4 filed periods (10-K/10-Q) each, pulled from SEC EDGAR (free, no auth beyond a compliant User-Agent header).
- One useful output: risk-factor change summary with citations, answering a specific analyst question.
- Normal case: question answerable from the corpus → cited, grounded answer.
- Failure case: question not answerable from the corpus (bad ticker, no prior filing of that type) → explicit refusal, not a hallucinated guess.

## Repos studied

Per the guide's study checklist — actually inspected each repo (READMEs, file tree, real test code), not just the guide's one-line summary.

**[SEC Insights](https://github.com/run-llama/sec-insights)** — problem: analysts need to ask questions of SEC 10-K/10-Q filings without reading every page. User: analyst. Input: filing PDFs + chat. Output: streamed, cited answer (PDF highlighted at citation); a market-data API tool handles quantitative questions. Deterministic: PDF ingest, pgvector storage, citation highlighting, streaming. LLM: answer synthesis, sub-question decomposition, tool-call decisions. **Proof it works is weak** — one test file total, no eval set; has ops monitoring (Sentry/Arize Phoenix/load testing) but that's uptime, not correctness, and the README admits "room for improvement in RAG performance."

**[Invoice Extract and Reconcile](https://github.com/run-llama/template-workflow-extract-reconcile-invoice)** — problem: finance/ops teams need to catch invoices that don't match contract terms. User: AP/finance reviewer. Input: invoice PDF + indexed contracts. Output: structured record (fields, matched contract, confidence, rationale, discrepancies) in a review UI. Deterministic: download, hash-dedup, schema validation, UI. LLM: extraction, matching, rationale. **Better tested** — 3 real pytest tests against a fake LlamaCloud server + a real sample PDF, two of them genuine regression tests with comments documenting actual bugs caught (raw PDF bytes indexed instead of parsed text; reconciliation fields silently dropped from the schema). Still, none test whether the *extraction or match is actually correct* — only that the plumbing/schema holds.

**What this means for this project:** both are real, actively-maintained reference implementations for this exact domain, and neither has an eval harness measuring output correctness — only plumbing tests (Invoice repo) or ops monitoring (SEC Insights). `ai_hub/evals/`'s pattern (golden dataset + LLM-as-judge + baseline-diff report) directly closes that gap and is the clearest differentiator against both references — reuse it here rather than reinventing an eval approach.

## Next steps (not yet done)

- Pick the 2–3 pilot companies and pull their actual filings from SEC EDGAR.
- Repo plan / first-version scope (guide's `03-start-a-project.md`) — vector store choice already decided in `PLAN.md` (Postgres + pgvector).
- This stays a Block C item — Block B's exit criterion is still the current priority per `PLAN.md`/`this_week.txt`; this file just closes the "domain-first evidence" milestone so Block C doesn't start from zero when it resumes.
