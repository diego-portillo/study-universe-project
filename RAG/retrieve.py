import re
from pathlib import Path

from load_data import load_python_files, DATA_PATH

BASE_DIR = Path(__file__).resolve().parent
STOPWORDS_PATH = BASE_DIR / "stopwords.txt"


def _load_stopwords() -> set[str]:
    if not STOPWORDS_PATH.exists():
        return set()

    return {
        line.strip().lower()
        for line in STOPWORDS_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    }


def _to_token_set(text: str) -> set[str]:
    stopwords = _load_stopwords()
    tokens = set(re.findall(r"[a-zA-Z_]+", text.lower()))
    return {token for token in tokens if token not in stopwords}

def retrieve(query: str, k: int = 3) -> list[dict]:
    docs = load_python_files(DATA_PATH)
    query_tokens = _to_token_set(query)
    scored = []
    for doc in docs:
        doc_tokens = _to_token_set(doc["text"])
        score = len(query_tokens & doc_tokens)
        scored.append({
            "text": doc["text"],
            "score": score,
            "source": doc["source"]
        })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]

if __name__ == "__main__":
    query = "board initialization battleship"
    results = retrieve(query, k=3)

    for i, r in enumerate(results, start=1):
        print(f"{i}. score={r['score']} source={r['source']}")