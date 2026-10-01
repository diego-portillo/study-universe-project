import os 
from openai import OpenAI
from db.models import FilingChunk
from db.session import SessionLocal

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def embed_chunks(chunks: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=os.environ["EMBEDDING_MODEL"], input=chunks)
    return [item.embedding for item in response.data]

def store_chunks(filing_id: int, section: str, chunks: list[str]) -> None:
    embeddings = embed_chunks(chunks)

    with SessionLocal() as session:
        session.add_all(
            FilingChunk(
                filing_id=filing_id,
                chunk_index=index,
                section=section,
                chunk_text=chunk,
                embedding=embedding,
            )
            for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        )
        session.commit()