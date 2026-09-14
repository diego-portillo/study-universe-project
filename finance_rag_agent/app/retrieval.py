import os
from dataclasses import dataclass
from sqlalchemy import select
from db.models import Filing, FilingChunk
from db.session import SessionLocal
from langchain_openai import OpenAIEmbeddings
from langsmith import traceable
from ingest.embed_store import EMBEDDING_MODEL

embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=os.environ["OPENAI_API_KEY"])

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
def retrieve_chunks(question: str, ticker: str, top_k: int=5) -> list[RetrievedChunk]:
    query_embedding = embeddings.embed_query(question)

    stmt = (
        select(
              Filing.company, Filing.ticker, Filing.form_type, Filing.period,
            FilingChunk.section, Filing.source_url, FilingChunk.chunk_text,
        )
        .join(Filing, Filing.id == FilingChunk.filing_id)
        .where(Filing.ticker == ticker)
        .order_by(FilingChunk.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )

    with SessionLocal() as session:
        rows = session.execute(stmt).all()
        
    return [RetrievedChunk(*row) for row in rows]