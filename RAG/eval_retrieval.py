import json
import os

from retrieve import retrieve

BASE_DIR = os.path.dirname(__file__)
EVAL_DATASET_PATH = os.path.join(BASE_DIR, "eval_dataset.json")


def main() -> None:
    with open(EVAL_DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    k = 5
    hits = 0
    failures = []

    for item in dataset:
        question = item["question"]
        expected = item["expected_source"]

        results = retrieve(question, k=k)
        sources = [r["source"] for r in results]

        if any(source.endswith(expected) for source in sources):
            hits += 1
        else:
            failures.append(
                {
                    "question": question,
                    "expected_source": expected,
                    "returned_sources": sources,
                }
            )

    total = len(dataset)
    print(f"Hit@{k}: {hits}/{total} = {hits/total:.2%}")

    if failures:
        print("\nFailed questions:")
        for idx, failure in enumerate(failures, start=1):
            print(f"\n{idx}. Question: {failure['question']}")
            print(f"   Expected: {failure['expected_source']}")
            if failure["returned_sources"]:
                print("   Returned:")
                for source in failure["returned_sources"]:
                    print(f"   - {source}")
            else:
                print("   Returned: []")


if __name__ == "__main__":
    main()