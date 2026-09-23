from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str
    ticker: str
    top_k: int = 7

class Citation(BaseModel):
    company: str
    ticker: str
    form_type: str
    period: str
    section: str
    source_url: str
    excerpt: str

class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]