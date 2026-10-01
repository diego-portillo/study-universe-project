import os
import time
from typing import Callable

from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware, ContextEditingMiddleware, ToolCallLimitMiddleware
from langchain.messages import AIMessage, ToolMessage
from langchain.tools.tool_node import ToolCallRequest
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from pydantic import BaseModel

from app.schemas import Citation
from app.tools import fetch_filing, list_filings

CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL")

SYSTEM_PROMPT = (
    "You are a financial analyst assistant investigating how a company's " \
    "stated risk factors changed between two filing periods. First call " \
    "list_filings to find the current and prior period for the requested " \
    "ticker and form type, then call fetch_filing exactly once for each " \
    "period to get the risk factors text — never call fetch_filing again " \
    "for a period you have already fetched, re-read the text you already " \
    "have instead. Then compare them and answer with citations. " \
    "Carefully read both full texts section by section before concluding " \
    "anything — do not default to 'no change' without first checking for " \
    "new, removed, or reworded risk factors, changed figures, or new named " \
    "entities, deals, or events in either period. Base every claimed " \
    "difference strictly on text that appears in one period but not the " \
    "other — do not infer, elaborate, or invent differences not directly " \
    "supported by the two texts. Only state that the risk factors are " \
    "substantively unchanged after you have confirmed this by checking " \
    "both texts section by section, not merely because no difference was " \
    "obvious at a glance. " \
    "If list_filings returns no results, treat that as definitive — do " \
    "not retry it with different arguments. Immediately report that no " \
    "filings are available for that ticker and form type. " \
    "If a period is missing, say so explicitly instead of guessing. " \
    "Every citation must include all fields: company, ticker, form_type, " \
    "period, section, source_url, and excerpt. Use the exact company and " \
    "source_url values returned by list_filings for the matching period — " \
    "never omit or leave a citation field blank."
)

class AgentAnswer(BaseModel):
    answer: str
    citations: list[Citation]

class ToolCallLoggingMiddleware(AgentMiddleware):
    def wrap_tool_call(
            self,
            request: ToolCallRequest,
            handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        tool_name = request.tool_call["name"]
        tool_args =  request.tool_call["args"]
        started_at = time.perf_counter()

        result = handler(request)

        latency_ms = round((time.perf_counter() - started_at) * 1000, 1)
        print(
            f"[tool_call] tool={tool_name} args={tool_args} "
            f"latency_ms={latency_ms} result_chars={len(str(result))}"
        )
        return result

def _fetch_filing_key(args: dict) -> tuple:
    return (args.get("ticker"), args.get("form_type"), args.get("period"))

class DedupeFetchFilingMiddleware(AgentMiddleware):
    def wrap_tool_call(
            self,
            request: ToolCallRequest,
            handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        tool_call = request.tool_call
        if tool_call["name"] != "fetch_filing":
            return handler(request)

        current_key = _fetch_filing_key(tool_call["args"])
        already_fetched = any(
            isinstance(message, AIMessage)
            and any(
                call["name"] == "fetch_filing"
                and call["id"] != tool_call["id"]
                and _fetch_filing_key(call["args"]) == current_key
                for call in message.tool_calls
            )
            for message in request.state["messages"]
        )
        if already_fetched:
            return ToolMessage(
                content="You already fetched this filing period earlier in this "
                        "conversation. Reuse that text instead of fetching it again.",
                tool_call_id=tool_call["id"],
                name="fetch_filing",
            )
        return handler(request)

agent = create_agent(
    model=ChatOpenAI(model=CHAT_MODEL, temperature=0, timeout=60, max_retries=2, max_tokens=8000),
    tools=[list_filings, fetch_filing],
    system_prompt=SYSTEM_PROMPT,
    middleware=[
        ToolCallLoggingMiddleware(),
        DedupeFetchFilingMiddleware(),
        ToolCallLimitMiddleware(run_limit=4),
        ContextEditingMiddleware(),
    ],
    response_format=AgentAnswer,
)

def run_agent(question: str, ticker: str) -> AgentAnswer:
    result = agent.invoke(
        {"messages":[{"role":"user", "content": f"Ticker: {ticker}\n{question}"}]}
    )
    return result["structured_response"]