import os

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "../data/algorithms")

def load_python_files(path):
    documents = []

    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                documents.append({
                    "text": content,
                    "source": full_path
                })

    return documents


if __name__ == "__main__":
    docs = load_python_files(DATA_PATH)
    print(f"Loaded {len(docs)} files")
    print(docs[0]["source"])