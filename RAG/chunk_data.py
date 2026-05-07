import os
from load_data import DATA_PATH

def chunk_text_by_lines(text:str, chunk_size:int = 80, overlap:int = 20) -> list[str]:
    lines = text.splitlines()
    chunks = []
    step = max(1, chunk_size - overlap)

    for i in range(0, len(lines), step):
        chunk_lines = lines[i:i + chunk_size]
        if not chunk_lines:
            continue
        chunks.append("\n".join(chunk_lines))
        if i + chunk_size >= len(lines):
            break
    return chunks

def load_chunked_python_files(path: str = DATA_PATH, chunk_size: int = 80, overlap: int = 20) -> list[dict]:
    documents = []

    for root, _, files in os.walk(path):
        for file in files:
            if not file.endswith(".py"):
                continue

            full_path = os.path.join(root, file)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            chunks = chunk_text_by_lines(content, chunk_size=chunk_size, overlap=overlap)

            for idx, chunk in enumerate(chunks):
                documents.append(
                    {
                        "text": chunk,
                        "source": full_path,
                        "chunk_id": idx,
                    }
                )

    return documents

# Test for script
# if __name__ == "__main__":
#     docs = load_chunked_python_files()
#     print(f"Total chunks: {len(docs)}")
#     if docs:
#         print("First source:", docs[0]["source"])
#         print("First chunk_id:", docs[0]["chunk_id"])
#         print("First chunk preview:")
#         print(docs[0]["text"][:200])
#         print("Last source:", docs[-1]["source"])
#         print("Last chunk_id:", docs[-1]["chunk_id"])
#         print("Last chunk preview:")
#         print(docs[-1]["text"][:200])