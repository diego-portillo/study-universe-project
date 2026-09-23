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
from langchain_openai import OpenAIEmbeddings

EMBEDDING_MODEL = "text-embedding-3-small"
REFUSAL_SIMILARITY_THRESHOLD = 0.75
GOLDEN_DATASET_PATH = Path(__file__).parent / "golden_dataset.json"

embedding_client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
embeddings = embedding_factory("openai", model=EMBEDDING_MODEL, client=embedding_client, interface="modern")
semantic_similarity = SemanticSimilarity(embeddings=embeddings)
evaluation_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model=EMBEDDING_MODEL))

def load_golden_rows() -> list[dict]:
    return json.loads(GOLDEN_DATASET_PATH.read_text())

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

    dataset = build_evaluation_dataset(scored_rows)
    evaluation_result = evaluate(
        dataset=dataset,
        metrics=[answer_relevancy, context_precision, context_recall, faithfulness],
        embeddings=evaluation_embeddings
    )
    evaluation_result.to_pandas().to_csv(results_dir / "scored_dataset.csv", index=False)
    print(evaluation_result)
    print(f"Saved run to {results_dir}")