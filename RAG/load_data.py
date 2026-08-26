from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / ".." / "data" / "algorithms"


@dataclass
class Document:
    text: str
    source: str


def load_python_files(path: Path) -> list[Document]:
    return [
        Document(text=file_path.read_text(encoding="utf-8"), source=str(file_path))
        for file_path in path.rglob("*.py")
    ]


if __name__ == "__main__":
    docs = load_python_files(DATA_PATH)
    print(f"Loaded {len(docs)} files")
    print(docs[0].source)
