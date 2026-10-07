from dotenv import load_dotenv

load_dotenv()

import requests
from sqlalchemy import exists, select

from db.models import Filing, FilingChunk
from db.session import SessionLocal
from ingest.chunk import chunk_text, merge_short_chunks
from ingest.edgar_client import (
    SEC_EDGAR_USER_AGENT,
    build_document_url,
    get_filings,
)
from ingest.embed_store import store_chunks
from ingest.extract import (
    html_to_text,
    select_relevant_sections,
    split_into_items,
)

COMPANIES = {
    "AMZN": {"cik": "0001018724", "company": "Amazon"},
    "NVDA": {"cik": "0001045810", "company": "NVIDIA"},
    "KO": {"cik": "0000021344", "company": "Coca-Cola"},
}


def derive_period(report_date: str, form_type: str) -> str:
    year, month, _ = report_date.split("-")
    if form_type == "10-K":
        return f"FY{year}"
    quarter = (int(month) - 1) // 3 + 1
    return f"Q{quarter} {year}"


def find_filing_id(accession_number: str) -> int | None:
    with SessionLocal() as session:
        return session.scalar(
            select(Filing.id).where(Filing.accession_number == accession_number)
        )


def create_filing(
    ticker: str, company: str, cik: str, filing: dict, source_url: str
) -> int:
    period = derive_period(filing["reportDate"], filing["form"])
    with SessionLocal() as session:
        new_filing = Filing(
            company=company,
            ticker=ticker,
            cik=cik,
            form_type=filing["form"],
            period=period,
            period_end_date=filing["reportDate"],
            filing_date=filing["filingDate"],
            accession_number=filing["accessionNumber"],
            source_url=source_url,
        )
        session.add(new_filing)
        session.commit()
        return new_filing.id


def has_chunks(filing_id: int) -> bool:
    with SessionLocal() as session:
        return session.scalar(
            select(exists().where(FilingChunk.filing_id == filing_id))
        )


def ingest_filing(ticker: str, form_type: str, periods: int = 2) -> None:
    info = COMPANIES[ticker]
    filings = get_filings(info["cik"], [form_type])

    for filing in filings[:periods]:
        filing_id = find_filing_id(filing["accessionNumber"])
        if filing_id is not None and has_chunks(filing_id):
            print(
                f"Filing {filing['accessionNumber']} already ingested (filing_id={filing_id}), skipping"
            )
            continue

        url, sections = fetch_filing_sections(
            info["cik"], filing["accessionNumber"], filing["primaryDocument"]
        )
        if filing_id is None:
            filing_id = create_filing(ticker, info["company"], info["cik"], filing, url)

        for heading, body in sections.items():
            chunks = merge_short_chunks(chunk_text(body))
            store_chunks(filing_id, heading, chunks)
            print(f"Stored {len(chunks)} chunks for {heading!r}")


def fetch_filing_sections(
    cik: str, accession_number: str, primary_document: str
) -> tuple[str, dict[str, str]]:
    url = build_document_url(cik, accession_number, primary_document)
    response = requests.get(url, headers={"User-Agent": SEC_EDGAR_USER_AGENT})
    response.raise_for_status()

    text = html_to_text(response.text)
    sections = select_relevant_sections(split_into_items(text))
    return url, sections


if __name__ == "__main__":
    for ticker in COMPANIES:
        ingest_filing(ticker, "10-Q", periods=2)
        ingest_filing(ticker, "10-K", periods=2)
