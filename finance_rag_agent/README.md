# Finance RAG Agent

A RAG + agent system that answers natural-language questions about public companies' SEC filings (10-K/10-Q), with citations back to the source text and an agent layer that can compare filings across periods. Built as a portfolio project demonstrating a production RAG pipeline: retrieval, reranking, grounded generation, an eval harness, and agentic tool use — not just a prompt wrapper around an LLM.

**Problem:** reading a 10-K/10-Q to answer a specific question (a number, a risk factor, a change between periods) means manually searching a 50+ page filing. **Who it's for:** anyone who wants to query a company's filings directly instead of reading them. **Input:** a natural-language question + ticker (AMZN, NVDA, or KO — the pilot companies). **Output:** a grounded answer with citations to the exact filing excerpts used, or an explicit refusal when the filings don't contain the answer.

---

## Architecture

```
SEC EDGAR → ingest (extract Item 1A/MD&A sections → chunk → embed) → Postgres + pgvector
                                                                            │
question + ticker → embed → pgvector cosine search (over-fetch) → Cohere rerank → top-k chunks
                                                                            │
                                                              prompt + chunks → OpenAI chat → answer + citations
```

The agent layer (`app/agent.py`, LangGraph) wraps the same filings in two tools — `list_filings` and `fetch_filing` — so it can pull two periods' risk-factor text and diff them, for questions a single RAG query can't answer (e.g. "how did Amazon's risk factors change between Q1 and Q2 2026?").

---

## Retrieval Quality

Both changes below were measured the same way: run the full pipeline against `eval/golden_dataset.json` (29 questions across AMZN/NVDA/KO, including 3 designed to trigger a refusal), score retrieval and answer quality with [Ragas](https://docs.ragas.io/) (`context_precision`, `context_recall`, `faithfulness`, `answer_relevancy`), and diff against the prior baseline with everything else held constant.

### Reranking

Plain vector search (cosine similarity over `text-embedding-3-small` embeddings) finds chunks that are *topically* similar to a question, not necessarily chunks that *answer* it. Added a two-stage retrieval step: over-fetch a candidate pool from pgvector (3× the final `top_k`), then rerank that pool with Cohere's `rerank-v3.5` before truncating to the real `top_k=7` (`app/retrieval.py`).

| Metric | Before (vector search only) | After (+ Cohere rerank) | Δ |
|---|---|---|---|
| context_precision | 0.642 | 0.772 | **+0.130** |
| context_recall | 0.768 | 0.899 | **+0.130** |
| faithfulness | 0.851 | 0.920 | +0.069 |
| answer_relevancy | 0.575 | 0.632 | +0.057 |

Refusal checks: 3/3 passed. Agent eval cases: 4/4 passed.

**Verdict: clear win, kept in production.** A two-stage retrieve-then-rerank pipeline measurably finds better-targeted chunks than vector search alone, at a cost of one Cohere API call per question. Chose Cohere's hosted rerank over a locally-hosted cross-encoder specifically because this app runs on a pay-per-use budget — a local model would need a permanently larger (and therefore permanently billed) container, while Cohere only costs money on an actual request.

### Chunking strategy comparison

The production pipeline splits each filing into its SEC "Item" sections (Risk Factors, MD&A) via regex, then chunks each section with `RecursiveCharacterTextSplitter` (1000 chars, 150 overlap). As a comparison, built a second pipeline (`eval/chunking_experiment.py`) that re-fetches the same filings from EDGAR and chunks them with LangChain's `SemanticChunker` instead — which splits at embedding-detected meaning boundaries rather than a fixed character count — then runs the identical retrieve → rerank → generate → score pipeline against it.

| Metric | Current (RecursiveCharacterTextSplitter) | Semantic (`SemanticChunker`) | Δ |
|---|---|---|---|
| context_precision | 0.772 | 0.803 | +0.031 |
| context_recall | 0.899 | 0.887 | −0.012 |
| faithfulness | 0.920 | 0.938 | +0.018 |
| answer_relevancy | 0.632 | 0.638 | +0.006 |

**Verdict: a wash, kept the simpler strategy.** Semantic chunking edges ahead on three metrics and slightly behind on one — small enough deltas to plausibly be noise, especially next to reranking's unambiguous +0.13 jump on both precision and recall. `SemanticChunker` also costs extra OpenAI embedding calls (once per sentence-group, to find its breakpoints, on top of the usual per-chunk embedding) for no measurable retrieval benefit here. Kept `RecursiveCharacterTextSplitter` in production — simpler, cheaper, and just as good on this filing set.

---

## Running the Eval Harness

```bash
python -m eval.run_eval              # full suite: refusal checks, agent eval, RAG scoring (current chunking + reranking)
python -m eval.chunking_experiment   # semantic-chunking comparison only (re-fetches filings from EDGAR, no DB writes)
```

Both write a timestamped results folder under `eval/results/` with the raw Ragas scores. The eval harness is also what caught the two real bugs behind the numbers above: a retrieval bug that was undercounting relevant chunks at `top_k=5` (fixed by bumping to `top_k=7`, pre-dating reranking), and a Cohere Trial-key rate limit (10 calls/minute) that crashed the scoring loop the first time it ran post-reranking — fixed by pacing the loop with `time.sleep(7)` between requests.

---

## Status

- [x] Baseline RAG endpoint with citations and refusal behavior
- [x] LangSmith tracing across the RAG and agent pipelines
- [x] Ragas eval harness (retrieval@k, faithfulness, answer relevance)
- [x] Agent layer (cross-period filing comparison, 2+ tools, tool-call logging)
- [x] Reranking + chunking-strategy comparison (this section)
- [ ] Full eval results table covering refusal + agent behavior in one place (currently split across `eval/results/*/refusal_checks.json` and `agent_checks.json`)
- [ ] Walkthrough of one full agent tool-call trace
