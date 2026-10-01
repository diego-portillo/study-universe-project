from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI  # noqa: E402
from app.rag_chain import answer_question  # noqa: E402
from app.schemas import AskRequest, AskResponse, Citation  # noqa: E402
from app.agent import AgentAnswer, run_agent

app = FastAPI(title="Finance RAG Agent")

@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    result = answer_question(request.question, request.ticker, request.top_k)
    citations = [
        Citation(
            company=chunk.company,
            ticker=chunk.ticker,
            form_type=chunk.form_type,
            period=chunk.period,
            section=chunk.section,
            source_url=chunk.source_url,
            excerpt=chunk.chunk_text[:300],
        )
        for chunk in result.citations
    ]
    return AskResponse(answer=result.answer, citations=citations)

@app.post("/ask_agent", response_model=AgentAnswer)
def ask_agent(request: AskRequest) -> AgentAnswer:
    return run_agent(request.question, request.ticker)

