import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import os
from dotenv import load_dotenv
load_dotenv()
from mcp.server.mcpserver import MCPServer # noqa: E402
from app.rag_chain import answer_question #noqa: E402
from app.schemas import AskResponse, Citation # noqa: E402
from starlette.middleware.base import BaseHTTPMiddleware # noqa:E402
from starlette.requests import Request # noqa:E402
from starlette.responses import PlainTextResponse # noqa:E402

mcp = MCPServer("finance-rag-agent")

@mcp.tool()
def ask_finance_question(ticker: str, question: str, top_k: int=7) -> dict:
    """Ask a question about a company's SEC filings."""
    result = answer_question(question, ticker, top_k)
    citations = [
        Citation(
            company=chunk.company,
            ticker=chunk.ticker,
            form_type=chunk.form_type,
            period=chunk.period,
            section=chunk.section,
            source_url=chunk.source_url,
            excerpt=chunk.chunk_text[:300]
        )
        for chunk in result.citations
    ]
    return AskResponse(answer=result.answer, citations=citations)

class BearerTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        expected = f"Bearer {os.environ["MCP_AUTH_TOKEN"]}"
        if request.headers.get("Authorization") != expected:
            return PlainTextResponse("Unauthorized", status_code=401)
        return await call_next(request)

if __name__ == "__main__":
    mcp.run()