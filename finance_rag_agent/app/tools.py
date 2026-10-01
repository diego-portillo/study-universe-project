from dataclasses import dataclass, asdict
from datetime import date

from langchain_core.tools import tool
from sqlalchemy import select
from langsmith import traceable

from db.models import Filing, FilingChunk
from db.session import SessionLocal

@dataclass
class FilingPeriod:
    company: str
    ticker: str
    form_type: str
    period: str
    period_end_date: date
    filing_date: date
    source_url: str

@tool
def list_filings(ticker: str, form_type: str) -> list[dict]:
    """List the current and prior filing periods for a ticker and form type
    ('10-K' or '10-Q'), most recent first."""
    statement = (
        select(
            Filing.company, Filing.ticker, Filing.form_type, Filing.period, Filing.period_end_date,
            Filing.filing_date, Filing.source_url,
        )
        .where(Filing.ticker == ticker, Filing.form_type == form_type)
        .order_by(Filing.period_end_date.desc())
        .limit(2)
    )
    with SessionLocal() as session:
        rows = session.execute(statement).all()
    
    return [asdict(FilingPeriod(*row)) for row in rows]

@tool
def fetch_filing(ticker: str, form_type: str, period: str) -> str:
    """Fetch the full risk factors section text for one specific filing
    (ticker, form type, period)."""
    statement = (
        select(FilingChunk.chunk_text)
        .join(Filing, Filing.id == FilingChunk.filing_id)
        .where(
            Filing.ticker == ticker,
            Filing.form_type == form_type,
            Filing.period == period,
            FilingChunk.section.ilike("%risk factors%"),
        )
        .order_by(FilingChunk.chunk_index)
    )
    with SessionLocal() as session:
        rows = session.execute(statement).all()

    if not rows:
        return f"No risk factors section found for {ticker} {form_type} {period}."

    return "\n\n".join(row[0] for row in rows)