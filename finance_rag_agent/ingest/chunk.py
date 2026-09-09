from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )
    return splitter.split_text(text)

MIN_CHUNK_LENGTH = 200

def merge_short_chunks(chunks: list[str]) -> list[str]:
    merged = []
    pending = ""
    for chunk in chunks:
        current =f"{pending} {chunk}".strip() if pending else chunk
        if len(current) < MIN_CHUNK_LENGTH:
            pending = current
        else:
            merged.append(current)
            pending = ""
    if pending:
        merged.append(pending)
    return merged