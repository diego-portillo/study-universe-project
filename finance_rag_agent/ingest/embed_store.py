import os 
from openai import OpenAI
import psycopg2
from pgvector.psycopg2 import register_vector

EMBEDDING_MODEL = "text-embedding-3-small" # to match our chunk sizes

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def embed_chunks(chunks: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=chunks)
    return [item.embedding for item in response.data]

def store_chunks(filing_id: int, section: str, chunks: list[str]) -> None:
    embeddings = embed_chunks(chunks)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    # register_vector is used to translate between python float list and vector column in the db
    register_vector(conn)
    try:
        with conn.cursor() as cur:
            for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                cur.execute(
                    """
                    INSERT INTO filing_chunks (filing_id, chunk_index, section, chunk_text, embedding)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (filing_id, index, section, chunk, embedding)
                )
        conn.commit()
    finally:
        conn.close()