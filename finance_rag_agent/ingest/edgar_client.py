import os
import requests
from dotenv import load_dotenv

# to pull the credentials from .env
load_dotenv()

SEC_EDGAR_USER_AGENT = os.environ["SEC_EDGAR_USER_AGENT"]
SUBMISSIONS_URL_TEMPLATE = "https://data.sec.gov/submissions/CIK{cik}.json"
ARCHIVES_URL_TEMPLATE =  "https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/{primary_document}"

def get_filings(cik: str, form_types: list[str]) -> list[dict]:
    padded_cik = cik.zfill(10)
    url = SUBMISSIONS_URL_TEMPLATE.format(cik=padded_cik)

    response = requests.get(url, headers={"User-Agent": SEC_EDGAR_USER_AGENT})
    response.raise_for_status()

    recent = response.json()["filings"]["recent"]
    matching_indices = [i for i, form in enumerate(recent["form"]) if form in form_types]

    return [{key: recent[key][i] for key in recent} for i in matching_indices]

def build_document_url(cik: str, accession_number: str, primary_document: str) -> str:
    stripped_cik = cik.lstrip("0")
    accession_no_dashes = accession_number.replace("-", "")

    return ARCHIVES_URL_TEMPLATE.format(
        cik=stripped_cik,
        accession_no_dashes=accession_no_dashes,
        primary_document=primary_document
    )