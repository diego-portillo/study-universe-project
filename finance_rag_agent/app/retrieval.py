import os
from dataclasses import dataclass
from sqlalchemy import select
from db.models import Filing, FilingChunk
from db.session import SessionLocal
from langchain_openai import OpenAIEmbeddings
from langsmith import traceable
import cohere

cohere_client = cohere.Client(os.environ["COHERE_API_KEY"])
# for a final top_k=7, fetch 7 * 3 = 21 candidates from the vector search first, then let Cohere's reranker narrow those 21 down to the real top 7.
CANDIDATE_POOL_MULTIPLIER = 3

embeddings = OpenAIEmbeddings(model=os.environ["EMBEDDING_MODEL"], api_key=os.environ["OPENAI_API_KEY"])

@dataclass
class RetrievedChunk:
    company: str
    ticker: str
    form_type: str
    period: str
    section: str
    source_url: str
    chunk_text: str

@traceable(name="retrieve_chunks")
def retrieve_chunks(question: str, ticker: str, top_k: int=7) -> list[RetrievedChunk]:
    candidates = _retrieve_candidates(question, ticker, pool_size=top_k * CANDIDATE_POOL_MULTIPLIER)
    if not candidates:
        return candidates

    return _rerank_chunks(question, candidates, top_k)

@traceable(name="retrieve_candidates")
def _retrieve_candidates(question: str, ticker: str, pool_size: int) -> list[RetrievedChunk]:
    query_embedding = embeddings.embed_query(question)

    statement = (
        select(
            Filing.company, Filing.ticker, Filing.form_type, Filing.period,
            FilingChunk.section, Filing.source_url, FilingChunk.chunk_text,    
        )
        .join(Filing, Filing.id == FilingChunk.filing_id)
        .where(Filing.ticker == ticker)
        .order_by(FilingChunk.embedding.cosine_distance(query_embedding))
        .limit(pool_size)
    )

    with SessionLocal() as session:
        rows = session.execute(statement).all()

    return [RetrievedChunk(*row) for row in rows]

@traceable(name="rerank_chunks")
def _rerank_chunks(question: str, chunks: list[RetrievedChunk], top_k: int) -> list[RetrievedChunk]:
    if not chunks:
        return chunks

    response = cohere_client.rerank(
        model=os.environ["RERANK_MODEL"],
        query=question,
        documents=[chunk.chunk_text for chunk in chunks],
        top_n=top_k
    )
    return [chunks[result.index] for result in response.results]