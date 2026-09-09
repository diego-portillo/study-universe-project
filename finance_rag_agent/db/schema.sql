CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE filings (
    id SERIAL PRIMARY KEY,                                  -- e.g. 1, 2, 3...
    company TEXT NOT NULL,                                  -- e.g. 'Amazon'
    ticker TEXT NOT NULL,                                   -- e.g. 'AMZN'
    cik TEXT NOT NULL,                                       -- e.g. '0001018724'
    form_type TEXT NOT NULL,                                 -- e.g. '10-K' or '10-Q' where K is for anual and Q is for quarter, 10 is form number 10 specificaly for securities exchange law
    period TEXT NOT NULL,                                    -- e.g. 'FY2025' or 'Q2 2025' FY is fiscal year and Q is quarter
    period_end_date DATE NOT NULL,     -- e.g. '2024-12-31' (EDGAR's reportDate) — for sorting/comparison logic
    filing_date DATE NOT NULL,                                -- e.g. '2025-02-06'
    accession_number TEXT NOT NULL UNIQUE,                    -- e.g. '0001018724-25-000042'
    source_url TEXT NOT NULL,                                  -- e.g. 'https://www.sec.gov/cgi-bin/browse-edgar?...'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()               -- e.g. '2026-09-04 14:32:10+00'
);

CREATE TABLE filing_chunks (
    id SERIAL PRIMARY KEY,                                       -- e.g. 1, 2, 3...
    filing_id INTEGER NOT NULL REFERENCES filings(id) ON DELETE CASCADE,  -- e.g. 1 (points to a filings.id row)
    chunk_index INTEGER NOT NULL,                                 -- e.g. 0, 1, 2... (order within the filing)
    section TEXT NOT NULL,                                         -- e.g. 'Item 1A. Risk Factors'
    chunk_text TEXT NOT NULL,                                      -- e.g. 'We face significant competition in...'
    embedding vector(1536) NOT NULL,                                -- e.g. [0.0123, -0.0456, 0.0789, ...] (1536 floats)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()                     -- e.g. '2026-09-04 14:32:11+00'
);