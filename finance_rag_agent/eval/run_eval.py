import os
import json
import asyncio
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()
# we use noqa comment because:
# it suppresses the linter rule "module level import not at top of file" (E402 in flake8/ruff). 
# It's needed here because load_dotenv() has to run before from app.rag_chain import ...
#  — that import pulls in ChatOpenAI, which reads OPENAI_API_KEY from the environment at import time.
#  Without the env vars loaded first, the import would fail. Ruff would normally flag those imports 
# for not being at the very top of the file, so the comment tells it that's intentional
from ragas import EvaluationDataset, SingleTurnSample, evaluate # noqa: E402
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.metrics import answer_relevancy, context_precision, context_recall, faithfulness
from ragas.embeddings.base import embedding_factory  # noqa: E402
from ragas.metrics.collections import SemanticSimilarity  # noqa: E402
from app.rag_chain import answer_question # noqa: E402
from app.agent import agent as risk_diff_agent
from langchain_openai import OpenAIEmbeddings
from langchain_core.messages import ToolMessage

REFUSAL_SIMILARITY_THRESHOLD = 0.70
GOLDEN_DATASET_PATH = Path(__file__).parent / "golden_dataset.json"
AGENT_DATASET_PATH = Path(__file__).parent / "agent_dataset.json"
AGENT_SIMILARITY_THRESHOLD = 0.6 # looser than refusal's 0.75 - these are open-ended multi-sentence diffs, not close paraphrases


embedding_client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
embeddings = embedding_factory("openai", model=os.environ["EMBEDDING_MODEL"], client=embedding_client, interface="modern")
semantic_similarity = SemanticSimilarity(embeddings=embeddings)
evaluation_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model=os.environ["EMBEDDING_MODEL"]))

def load_golden_rows() -> list[dict]:
    return json.loads(GOLDEN_DATASET_PATH.read_text())

def load_agent_cases() -> list[dict]:
    return json.loads(AGENT_DATASET_PATH.read_text())

def count_tool_calls(messages: list) -> dict[str, int]:
    counts: dict[str, int] = {}
    for message in messages:
        if isinstance(message, ToolMessage):
            counts[message.name] = counts.get(message.name, 0) + 1
    return counts

def build_evaluation_dataset(scored_rows: list[dict]) -> EvaluationDataset:
    samples = []
    for row in scored_rows:
        print(f"[scoring] {row['ticker']}: {row['question']}")
        result = answer_question(row["question"], row["ticker"])
        samples.append(
            SingleTurnSample(
                user_input=row["question"],
                response=result.answer,
                retrieved_contexts=[chunk.chunk_text for chunk in result.citations],
                reference=row["ground_truth"],
            )
        )
    return EvaluationDataset(samples=samples)

async def check_refusals(refusal_rows: list[dict]) -> list[dict]:
    results = []
    for row in refusal_rows:
        print(f"[refusal check] {row['ticker']}: {row['question']}")
        result = answer_question(row["question"], row["ticker"])
        score = await semantic_similarity.ascore(reference=row["ground_truth"], response=result.answer)
        results.append(
            {
                "question": row["question"],
                "ticker": row["ticker"],
                "passed": score.value >= REFUSAL_SIMILARITY_THRESHOLD,
                "similarity": score.value,
                "actual_answer": result.answer,
            }
        )
    return results

async def evaluate_agent_cases(cases: list[dict]) -> list[dict]:
    results = []
    for index, case in enumerate(cases):
        print(f"[agent eval] {case['ticker']}: {case['question']}")
        try:
            result = risk_diff_agent.invoke(
                {"messages": [{"role": "user", "content": f"Ticker: {case['ticker']}\n{case['question']}"}]}
            )
        except Exception as exc:
            print(f"[agent eval] ERROR: {exc}")
            results.append({
                "question": case["question"],
                "ticker": case["ticker"],
                "passed": False,
                "error": str(exc),
            })
            continue

        answer = result["structured_response"]
        tool_calls = count_tool_calls(result["messages"])

        called_list_filings = tool_calls.get("list_filings", 0) >= 1
        called_fetch_filing_enough = (
            tool_calls.get("fetch_filing", 0) >= 2 if not case.get("expect_refusal") else True
        )

        score = await semantic_similarity.ascore(reference=case["ground_truth"], response=answer.answer)
        passed = score.value >= AGENT_SIMILARITY_THRESHOLD and called_list_filings and called_fetch_filing_enough

        results.append({
            "question": case["question"],
            "ticker": case["ticker"],
            "passed": passed,
            "similarity": score.value,
            "tool_calls": tool_calls,
            "actual_answer": answer.answer
        })
        if index < len(cases) - 1:
            await asyncio.sleep(10)
    return results

# this if block is used to run when we execute this file isolated instead of as an import
if __name__ == "__main__":
    rows = load_golden_rows()
    refusal_rows = [row for row in rows if row.get("expect_refusal")]
    scored_rows = [row for row in rows if not row.get("expect_refusal")]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_dir = Path(__file__).parent / "results" / timestamp
    results_dir.mkdir(parents=True, exist_ok=True)

    refusal_results = asyncio.run(check_refusals(refusal_rows))
    for r in refusal_results:
        status = "PASS" if r["passed"] else "FAIL"
        print(f"[{status}] refusal check: ({r['similarity']:.3f}): {r['question']}")
        if not r["passed"]:
            print(f"Actual answer: {r['actual_answer']}")
    (results_dir / "refusal_checks.json").write_text(json.dumps(refusal_results, indent=2))

    agent_cases = load_agent_cases()
    agent_results = asyncio.run(evaluate_agent_cases(agent_cases))
    for r in agent_results:
        status = "PASS" if r["passed"] else "FAIL"
        if "error" in r:
            print(f"[{status}] agent eval ERROR: {r['question']}")
            print(f"Error: {r['error']}")
            continue
        print(f"[{status}] agent eval ({r['similarity']:.3f}, tools={r['tool_calls']}): {r['question']}")
        if not r["passed"]:
            print(f"Actual answer: {r['actual_answer']}")
    (results_dir / "agent_checks.json").write_text(json.dumps(agent_results, indent=2))

    dataset = build_evaluation_dataset(scored_rows)
    evaluation_result = evaluate(
        dataset=dataset,
        metrics=[answer_relevancy, context_precision, context_recall, faithfulness],
        embeddings=evaluation_embeddings
    )
    evaluation_result.to_pandas().to_csv(results_dir / "scored_dataset.csv", index=False)
    print(evaluation_result)
    print(f"Saved run to {results_dir}")