import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from langchain_community.utils.math import cosine_similarity
from langchain_experimental.text_splitter import SemanticChunker
from ragas import EvaluationDataset, SingleTurnSample, evaluate
from ragas.metrics import (
    answer_relevancy,
    context_precision,
    context_recall,
    faithfulness,
)

from app.rag_chain import _format_context, chain
from app.retrieval import (
    CANDIDATE_POOL_MULTIPLIER,
    RetrievedChunk,
    _rerank_chunks,
    embeddings,
)
from eval.run_eval import evaluation_embeddings, load_golden_rows
from ingest.edgar_client import get_filings
from ingest.embed_store import embed_chunks
from ingest.run_ingest import (
    COMPANIES,
    derive_period,
    fetch_filing_sections,
)

semantic_chunker = SemanticChunker(embeddings)


@dataclass
class EmbeddedChunk:
    company: str
    ticker: str
    form_type: str
    period: str
    section: str
    source_url: str
    chunk_text: str
    embedding: list[float]


def collect_filing_sections() -> list[dict]:
    filing_sections = []
    for ticker, info in COMPANIES.items():
        for form_type in ("10-Q", "10-K"):
            filings = get_filings(info["cik"], [form_type])
            for filing in filings[:2]:
                url, sections = fetch_filing_sections(
                    info["cik"], filing["accessionNumber"], filing["primaryDocument"]
                )
                filing_sections.append(
                    {
                        "ticker": ticker,
                        "company": info["company"],
                        "form_type": form_type,
                        "period": derive_period(filing["reportDate"], filing["form"]),
                        "source_url": url,
                        "sections": sections,
                    }
                )
    return filing_sections


def build_semantic_pool(filing_sections: list[dict]) -> list[EmbeddedChunk]:
    pool = []
    for filing in filing_sections:
        for heading, body in filing["sections"].items():
            chunks = semantic_chunker.split_text(body)
            chunk_embeddings = embed_chunks(chunks)
            for chunk_text, embedding in zip(chunks, chunk_embeddings):
                pool.append(
                    EmbeddedChunk(
                        company=filing["company"],
                        ticker=filing["ticker"],
                        form_type=filing["form_type"],
                        period=filing["period"],
                        section=heading,
                        source_url=filing["source_url"],
                        chunk_text=chunk_text,
                        embedding=embedding,
                    )
                )
    return pool


def retrieve_semantic_candidates(
    question: str, ticker: str, pool: list[EmbeddedChunk], pool_size: int
) -> list[EmbeddedChunk]:
    ticker_chunks = [chunk for chunk in pool if chunk.ticker == ticker]
    if not ticker_chunks:
        return []

    query_embedding = embeddings.embed_query(question)
    chunk_embeddings = [chunk.embedding for chunk in ticker_chunks]
    similarities = cosine_similarity([query_embedding], chunk_embeddings)[0]

    ranked = [
        chunk
        for _, chunk in sorted(
            zip(similarities, ticker_chunks), key=lambda pair: pair[0], reverse=True
        )
    ]
    return ranked[:pool_size]


def answer_with_semantic_chunks(
    question: str, ticker: str, pool: list[EmbeddedChunk], top_k: int = 7
) -> tuple[str, list[RetrievedChunk]]:
    candidates = retrieve_semantic_candidates(
        question, ticker, pool, pool_size=top_k * CANDIDATE_POOL_MULTIPLIER
    )
    if not candidates:
        return "No relevant chunks found.", []

    retrieved = [
        RetrievedChunk(
            chunk.company,
            chunk.ticker,
            chunk.form_type,
            chunk.period,
            chunk.section,
            chunk.source_url,
            chunk.chunk_text,
        )
        for chunk in candidates
    ]
    reranked = _rerank_chunks(question, retrieved, top_k)
    answer = chain.invoke({"context": _format_context(reranked), "question": question})
    return answer, reranked


def build_semantic_evaluation_dataset(
    scored_rows: list[dict], pool: list[EmbeddedChunk]
) -> EvaluationDataset:
    samples = []
    for index, row in enumerate(scored_rows):
        print(f"[semantic scoring] {row['ticker']}: {row['question']}")
        answer, citations = answer_with_semantic_chunks(
            row["question"], row["ticker"], pool
        )
        samples.append(
            SingleTurnSample(
                user_input=row["question"],
                response=answer,
                retrieved_contexts=[chunk.chunk_text for chunk in citations],
                reference=row["ground_truth"],
            )
        )
        if index < len(scored_rows) - 1:
            time.sleep(7)
    return EvaluationDataset(samples=samples)


if __name__ == "__main__":
    rows = load_golden_rows()
    scored_rows = [row for row in rows if not row.get("expect_refusal")]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_dir = Path(__file__).parent / "results" / f"{timestamp}_semantic_chunking"
    results_dir.mkdir(parents=True, exist_ok=True)

    print("Building semantic-chunked pool from EDGAR filings...")
    filing_sections = collect_filing_sections()
    pool = build_semantic_pool(filing_sections)
    print(f"Pool built: {len(pool)} chunks")

    dataset = build_semantic_evaluation_dataset(scored_rows, pool)
    evaluation_result = evaluate(
        dataset=dataset,
        metrics=[answer_relevancy, context_precision, context_recall, faithfulness],
        embeddings=evaluation_embeddings,
    )
    evaluation_result.to_pandas().to_csv(
        results_dir / "scored_dataset.csv", index=False
    )
    print(evaluation_result)
    print(f"Saved run to {results_dir}")
