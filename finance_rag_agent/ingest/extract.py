import re
from bs4 import BeautifulSoup

ITEM_HEADING_PATTERN = re.compile(r"^(Item\s+\d+[A-Z]?\.\s*[^\n]+)", re.MULTILINE)
MIN_SECTION_LENGTH = 500

def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(separator="\n")

def split_into_items(text: str) -> dict[str, str]:
    matches = list(ITEM_HEADING_PATTERN.finditer(text))
    sections = {}

    for i, match in enumerate(matches):
        heading = match.group(1).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()

        if len(body) >= MIN_SECTION_LENGTH:
            sections[heading] = body
    return sections

RELEVANT_SECTION_KEYWORDS = ["risk factors", "management's discussion", "discussion and analysis"]

def select_relevant_sections(sections: dict[str, str]) -> dict[str, str]:
    return {
        heading: body
        for heading, body in sections.items()
        if any(keyword in heading.lower() for keyword in RELEVANT_SECTION_KEYWORDS)
    }