import os
from dataclasses import dataclass
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langsmith import traceable

from app.retrieval import RetrievedChunk, retrieve_chunks

CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL")
REFUSAL_ANSWER = "I don't have enough information in the filings I have for this ticker to answer that."

PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a financial analyst assistant. Answer only using the "
            "context below, excerpted from SEC filings. Only state figures "
            "or facts that are explicitly written in the context — never "
            "silently calculate, estimate, or derive a number that is not "
            "directly stated. If the context does not contain the exact "
            "figure needed, say so explicitly. If that figure could "
            "nonetheless be computed from other figures present in the "
            "context (e.g. a prior year's value from a stated growth rate), "
            "say the context doesn't directly contain it and ask the user "
            "whether they'd like you to compute an estimate instead of "
            "doing so unprompted.\n\nContext:\n{context}",
        ),
        ("human", "{question}"),
    ]
)

llm = ChatOpenAI(model=CHAT_MODEL, temperature=0, timeout=60, max_retries=2)
chain = PROMPT | llm | StrOutputParser()

@dataclass
class AnsweredQuestion:
    answer: str
    citations: list[RetrievedChunk]

def _format_context(chunks: list[RetrievedChunk]) -> str:
    return "\n\n".join(
        f"[{chunk.form_type} {chunk.period}, {chunk.section}]\n{chunk.chunk_text}"
        for chunk in chunks
    )

@traceable(name="answer_question")
def answer_question(question: str, ticker: str, top_k: int = 7) -> AnsweredQuestion:
    chunks = retrieve_chunks(question, ticker, top_k)
    if not chunks:
        return AnsweredQuestion(answer=REFUSAL_ANSWER, citations=[])

    answer = chain.invoke({"context": _format_context(chunks), "question": question})
    return AnsweredQuestion(answer=answer, citations=chunks)