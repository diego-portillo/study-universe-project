import os
import requests
import psycopg2
from dotenv import load_dotenv

from ingest.edgar_client import  get_filings, build_document_url, SEC_EDGAR_USER_AGENT
from ingest.extract import html_to_text, split_into_items, select_relevant_sections
from ingest.chunk import chunk_text, merge_short_chunks
from ingest.embed_store import store_chunks

load_dotenv()

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
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM filings WHERE accession_number = %s", (accession_number,))
            row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def create_filing(ticker: str, company: str, cik: str, filing: dict, source_url: str) -> int:
    period = derive_period(filing["reportDate"], filing["form"])
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO filings (company, ticker, cik, form_type, period, period_end_date, filing_date, accession_number, source_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (company, ticker, cik, filing["form"], period, filing["reportDate"], filing["filingDate"], filing["accessionNumber"], source_url),
            )
            filing_id = cur.fetchone()[0]
        conn.commit()
        return filing_id
    finally:
        conn.close()


def has_chunks(filing_id: int) -> bool:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT EXISTS(SELECT 1 FROM filing_chunks WHERE filing_id = %s)", (filing_id,))
            return cur.fetchone()[0]
    finally:
        conn.close()

def ingest_filing(ticker: str, form_type: str) -> None:
    info = COMPANIES[ticker]
    filings = get_filings(info["cik"], [form_type])
    latest = filings[0] 

    url = build_document_url(info["cik"], latest["accessionNumber"], latest["primaryDocument"])

    filing_id = find_filing_id(latest["accessionNumber"])
    if filing_id is None:
        filing_id = create_filing(ticker, info["company"], info["cik"], latest, url)
    elif has_chunks(filing_id):
        print(f"Filing {latest["accessionNumber"]} already ingested (filing_id={filing_id}), skipping")
        return

    response = requests.get(url, headers={"User-Agent": SEC_EDGAR_USER_AGENT})
    response.raise_for_status()

    text = html_to_text(response.text)
    sections = select_relevant_sections(split_into_items(text))

    for heading, body in sections.items():
        chunks = merge_short_chunks(chunk_text(body))
        store_chunks(filing_id, heading, chunks)
        print(f"Stored {len(chunks)} chunks for {heading!r}")

if __name__ == "__main__":
    for ticker in COMPANIES:
        ingest_filing(ticker, "10-Q")
        ingest_filing(ticker, "10-K")