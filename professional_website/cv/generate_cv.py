"""Regenerates Diego_Portillo_CV_EN_ES.pdf with the requested content additions.
Recreated from scratch with reportlab Platypus (no source script existed in the repo);
fonts/sizes/colors below were reverse-engineered from the previous PDF via pdfplumber
to stay visually consistent with it.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    PageBreak,
)

OUT_PATH = "../public/Diego_Portillo_CV_EN_ES.pdf"

NAVY = colors.HexColor("#1F4E79")
GRAY = colors.HexColor("#545454")
LINK = colors.HexColor("#0563C1")
BLACK = colors.black

MARGIN = 56.4
CONTENT_WIDTH = letter[0] - 2 * MARGIN
# SimpleDocTemplate's default Frame adds 6pt of padding on each side on top of
# the margins, which every Paragraph respects. A Table sized to CONTENT_WIDTH is
# wider than that padded area, so reportlab falls back to drawing it flush with
# the raw margin instead — 6pt left of everything else. Row tables (job_row,
# edu_row) must use this narrower width to stay aligned with surrounding text.
FRAME_PADDING = 6
ROW_TABLE_WIDTH = CONTENT_WIDTH - 2 * FRAME_PADDING


def link(text, url):
    return f'<a href="{url}"><font color="#0563C1"><u>{text}</u></font></a>'


styles = {
    "name": ParagraphStyle(
        "name", fontName="Helvetica-Bold", fontSize=20, leading=22,
        textColor=NAVY, spaceAfter=2,
    ),
    "subtitle": ParagraphStyle(
        "subtitle", fontName="Helvetica", fontSize=11.5, leading=14,
        textColor=GRAY, spaceAfter=4,
    ),
    "infoBold": ParagraphStyle(
        "infoBold", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
        textColor=GRAY, spaceAfter=2,
    ),
    "infoLine": ParagraphStyle(
        "infoLine", fontName="Helvetica", fontSize=8.5, leading=11,
        textColor=BLACK, spaceAfter=10,
    ),
    "header": ParagraphStyle(
        "header", fontName="Helvetica-Bold", fontSize=9.5, leading=11.5,
        textColor=NAVY, spaceBefore=5, spaceAfter=1,
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=9, leading=12,
        textColor=BLACK, spaceAfter=6,
    ),
    "skill": ParagraphStyle(
        "skill", fontName="Helvetica", fontSize=9, leading=12.2,
        textColor=BLACK, spaceAfter=0,
    ),
    "jobTitle": ParagraphStyle(
        "jobTitle", fontName="Helvetica-Bold", fontSize=9.5, leading=11.5,
        textColor=BLACK,
    ),
    "date": ParagraphStyle(
        "date", fontName="Helvetica-Oblique", fontSize=8.5, leading=11.5,
        textColor=GRAY, alignment=TA_RIGHT,
    ),
    "bullet": ParagraphStyle(
        "bullet", fontName="Helvetica", fontSize=9, leading=12,
        textColor=BLACK, leftIndent=12, bulletIndent=0, spaceAfter=2,
        bulletFontName="Helvetica", bulletFontSize=9,
    ),
    "eduLeft": ParagraphStyle(
        "eduLeft", fontName="Helvetica-Bold", fontSize=9, leading=11.5,
        textColor=BLACK,
    ),
    "eduLang": ParagraphStyle(
        "eduLang", fontName="Helvetica", fontSize=9, leading=12,
        textColor=BLACK, spaceBefore=3,
    ),
    "ref": ParagraphStyle(
        "ref", fontName="Helvetica", fontSize=9, leading=12,
        textColor=BLACK, spaceBefore=3,
    ),
}


def P(key, text):
    return Paragraph(text, styles[key])


def bullet(text):
    return Paragraph(text, styles["bullet"], bulletText="•")


def section_header(text):
    return [
        P("header", text),
        HRFlowable(
            width="100%", thickness=0.7, color=NAVY,
            spaceBefore=2, spaceAfter=6, lineCap="butt",
        ),
    ]


def job_row(title_markup, date_text):
    t = Table(
        [[P("jobTitle", title_markup), P("date", date_text)]],
        colWidths=[ROW_TABLE_WIDTH - 110, 110],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def edu_row(left_markup, date_text):
    t = Table(
        [[P("eduLeft", left_markup), P("date", date_text)]],
        colWidths=[ROW_TABLE_WIDTH - 110, 110],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return t


def build_page(lang):
    story = []

    if lang == "en":
        story.append(P("name", "DIEGO JOSE PORTILLO MARTINEZ"))
        story.append(P("subtitle", "Software Developer"))
        story.append(P(
            "infoBold",
            "Based in Asuncion, Paraguay | Working remotely | "
            "Dual nationality: Spanish and Paraguayan",
        ))
        story.append(P(
            "infoLine",
            "+595 971 626 596 | "
            + link("dportillodeveloper@gmail.com", "mailto:dportillodeveloper@gmail.com")
            + " | " + link("diegoportillo.dev", "https://diegoportillo.dev")
            + " | " + link(
                "linkedin.com/in/diego-jose-portillo-martinez",
                "https://www.linkedin.com/in/diego-jose-portillo-martinez-a0a1b01a3/",
            )
            + " | " + link("github.com/diego-portillo", "https://github.com/diego-portillo"),
        ))

        story += section_header("PROFESSIONAL SUMMARY")
        story.append(P(
            "body",
            "Software developer with 5 years of experience building backend and fullstack "
            "systems for fintech and SaaS products, including nearly 3 years working remotely "
            "for a US company serving clients in the US, Canada and Australia. Strong in "
            "Node.js, Python, Java, AWS and SQL databases, with hands-on DevOps experience. Now "
            "focused on AI software engineering: built a multi-provider LLM API and an evaluated "
            "RAG agent with LangChain, FastAPI and pgvector.",
        ))

        story += section_header("TECHNICAL SKILLS")
        story.append(P("skill", "<b>Languages:</b> Python, TypeScript, JavaScript, Java, SQL"))
        story.append(P(
            "skill",
            "<b>Backend &amp; Frontend:</b> Node.js, FastAPI, Django, Spring Boot, REST APIs, "
            "React, Next.js",
        ))
        story.append(P(
            "skill",
            "<b>AI &amp; LLM:</b> LangChain, LangGraph, LangSmith, RAG, AI agents, RAGAS evals, "
            "observability, pgvector, OpenAI, Anthropic, Google Gemini, Cohere, ElevenLabs APIs, "
            "Claude Code",
        ))
        story.append(P(
            "skill",
            "<b>Data &amp; Cloud:</b> PostgreSQL, MySQL, DynamoDB, AWS, Docker, Linux, CI/CD",
        ))
        story.append(Paragraph(
            "<b>Tools:</b> Git, GitHub, GitHub Actions, Bitbucket, Bitbucket Pipelines, Jira",
            ParagraphStyle("toolsLine", parent=styles["skill"], spaceAfter=6),
        ))

        story += section_header("PROFESSIONAL EXPERIENCE")
        story.append(job_row(
            "Contract Software Developer | "
            + link("Approach Software LLC", "https://www.approach.app/")
            + " via "
            + link("Experience AMP LLC", "https://www.linkedin.com/company/amp-llcks/")
            + " | USA, Remote",
            "Feb 2024 – Oct 2026",
        ))
        story.append(Spacer(1, 3))
        story.append(bullet(
            "Developed multi-location features for memberships, check-ins, promo codes, payments, "
            "calendars and tickets in a scalable, stateless climbing-gym CRM used by 150+ gyms and "
            "an estimated 10M+ customers across the US, Canada and Australia."
        ))
        story.append(bullet("Refactored a legacy Node.js shopping-cart backend, improving system efficiency by 40%."))
        story.append(bullet("Resolved over 100 bug tickets, including production issues in payment and transaction flows."))
        story.append(bullet("Fullstack delivery with Node.js, React, MySQL and AWS in a remote US team."))

        story.append(Spacer(1, 6))
        story.append(job_row(
            "Fullstack &amp; DevOps Developer | " + link("Taxit!", "https://www.taxit.com.py/") + ", Paraguay",
            "2022 – 2024",
        ))
        story.append(Spacer(1, 3))
        story.append(bullet(
            "Integrated external APIs for electronic invoicing for enterprise clients such as Burger King, "
            "Ultima Hora and PedidosYa, issuing 7M+ electronic documents per month."
        ))
        story.append(bullet(
            "Built fullstack features for a tax fintech platform serving 27k+ clients, processing 580k+ "
            "receipts per month and 120k+ tax returns filed per year, with Java Spring Boot, Python Django "
            "and PostgreSQL."
        ))
        story.append(bullet("Managed manual deployments and server maintenance on Linux."))
        story.append(bullet("Led small teams of junior developers in the absence of senior leads."))

        story += section_header("AI PROJECTS")
        story.append(bullet(
            '<b>' + link("Finance RAG Agent", "https://github.com/diego-portillo/study-universe-project/tree/main/finance_rag_agent") + '</b>'
            " — Finance-domain RAG agent built with LangChain, Cohere and FastAPI, using "
            "pgvector for retrieval, LangSmith for tracing and observability and RAGAS for "
            "answer-quality evaluation. Demo: " + link("youtu.be/WUIBx6V2yR8", "https://youtu.be/WUIBx6V2yR8")
        ))
        story.append(bullet(
            '<b>' + link("AI Hub", "https://github.com/diego-portillo/study-universe-project/tree/main/ai_hub") + '</b>'
            " — Multi-provider LLM chat API that unifies models from different providers such "
            "as OpenAI, Anthropic and Google behind a single backend. Demo: "
            + link("youtu.be/RKUtU4oiTFc", "https://youtu.be/RKUtU4oiTFc")
        ))

        story += section_header("EDUCATION &amp; CERTIFICATIONS")
        story.append(edu_row(
            "Software Development — " + link("Platzi", "https://platzi.com/") + ", online",
            "2024 – Present",
        ))
        story.append(edu_row("Technical Degree in Audio Engineering — IPAC, Paraguay", "2016"))
        story.append(P(
            "eduLang",
            "<b>Languages:</b> Spanish, native | English, C2 " + link("EF SET certified", "https://cert.efset.org/sjEEmU"),
        ))

        story += section_header("REFERENCES")
        story.append(P(
            "ref",
            link("Ryan Hill", "https://www.linkedin.com/in/ryan-hill-46b214327/")
            + " — Manager, Approach Software | "
            + link("Talia Rios", "https://www.linkedin.com/in/talia-rios-76a06514a/")
            + " — Human Resources, Experience AMP | "
            + link("Jon Radcliff", "https://www.linkedin.com/in/jonradcliff/")
            + " — President, Party Center Software &amp; Approach",
        ))

    else:
        story.append(P("name", "DIEGO JOSÉ PORTILLO MARTÍNEZ"))
        story.append(P("subtitle", "Desarrollador de Software"))
        story.append(P(
            "infoBold",
            "Residente en Asunción, Paraguay | Trabajo remoto | "
            "Doble nacionalidad: española y paraguaya",
        ))
        story.append(P(
            "infoLine",
            "+595 971 626 596 | "
            + link("dportillodeveloper@gmail.com", "mailto:dportillodeveloper@gmail.com")
            + " | " + link("diegoportillo.dev", "https://diegoportillo.dev")
            + " | " + link(
                "linkedin.com/in/diego-jose-portillo-martinez",
                "https://www.linkedin.com/in/diego-jose-portillo-martinez-a0a1b01a3/",
            )
            + " | " + link("github.com/diego-portillo", "https://github.com/diego-portillo"),
        ))

        story += section_header("PERFIL PROFESIONAL")
        story.append(P(
            "body",
            "Desarrollador de software con 5 años de experiencia construyendo sistemas "
            "backend y fullstack para productos fintech y SaaS, incluidos casi 3 años "
            "trabajando de forma remota para una empresa de EE. UU. con clientes en EE. UU., "
            "Canadá y Australia. Sólido en Node.js, Python, Java, AWS y bases de datos "
            "SQL, con experiencia práctica en DevOps. Actualmente enfocado en ingeniería "
            "de software con IA: desarrollé una API de LLM multiproveedor y un agente RAG "
            "evaluado con LangChain, FastAPI y pgvector.",
        ))

        story += section_header("COMPETENCIAS TÉCNICAS")
        story.append(P("skill", "<b>Lenguajes:</b> Python, TypeScript, JavaScript, Java, SQL"))
        story.append(P(
            "skill",
            "<b>Backend y Frontend:</b> Node.js, FastAPI, Django, Spring Boot, APIs REST, React, Next.js",
        ))
        story.append(P(
            "skill",
            "<b>IA y LLM:</b> LangChain, LangGraph, LangSmith, RAG, agentes de IA, evaluaciones "
            "RAGAS, observabilidad, pgvector, OpenAI, Anthropic, Google Gemini, Cohere, "
            "ElevenLabs APIs, Claude Code",
        ))
        story.append(P(
            "skill",
            "<b>Datos y Nube:</b> PostgreSQL, MySQL, DynamoDB, AWS, Docker, Linux, CI/CD",
        ))
        story.append(Paragraph(
            "<b>Herramientas:</b> Git, GitHub, GitHub Actions, Bitbucket, Bitbucket Pipelines, Jira",
            ParagraphStyle("toolsLineEs", parent=styles["skill"], spaceAfter=6),
        ))

        story += section_header("EXPERIENCIA PROFESIONAL")
        story.append(job_row(
            "Desarrollador de Software Contratista | "
            + link("Approach Software LLC", "https://www.approach.app/")
            + " vía "
            + link("Experience AMP LLC", "https://www.linkedin.com/company/amp-llcks/")
            + " | EE. UU., Remoto",
            "Feb 2024 – Oct 2026",
        ))
        story.append(Spacer(1, 3))
        story.append(bullet(
            "Desarrollé funcionalidades multi-locación de membresías, check-ins, "
            "códigos promocionales, pagos, calendarios y tickets para un CRM de gimnasios de "
            "escalada escalable y stateless, usado por más de 150 gimnasios y un estimado de "
            "más de 10 millones de clientes en EE. UU., Canadá y Australia."
        ))
        story.append(bullet("Refactoricé el backend legacy de carritos de compra en Node.js, aumentando la eficiencia del sistema en un 40%."))
        story.append(bullet("Resolví más de 100 tickets de bugs, incluyendo errores en producción en flujos de pagos y transacciones."))
        story.append(bullet("Desarrollo fullstack con Node.js, React, MySQL y AWS en un equipo remoto de EE. UU."))

        story.append(Spacer(1, 6))
        story.append(job_row(
            "Desarrollador Fullstack y DevOps | " + link("Taxit!", "https://www.taxit.com.py/") + ", Paraguay",
            "2022 – 2024",
        ))
        story.append(Spacer(1, 3))
        story.append(bullet(
            "Integré APIs externas de facturación electrónica para clientes como Burger King, Última Hora y "
            "PedidosYa, emitiendo más de 7 millones de documentos electrónicos al mes."
        ))
        story.append(bullet(
            "Desarrollé funcionalidades fullstack para una plataforma fintech tributaria que atiende a más "
            "de 27 mil clientes, procesando más de 580 mil comprobantes al mes y más de 120 mil "
            "declaraciones presentadas al año, con Java Spring Boot, Python Django y PostgreSQL."
        ))
        story.append(bullet("Gestioné despliegues manuales y mantenimiento de servidores Linux."))
        story.append(bullet("Lideré pequeños equipos de desarrolladores junior en ausencia de los líderes senior."))

        story += section_header("PROYECTOS DE IA")
        story.append(bullet(
            '<b>' + link("Finance RAG Agent", "https://github.com/diego-portillo/study-universe-project/tree/main/finance_rag_agent") + '</b>'
            " — Agente RAG del dominio financiero con LangChain, Cohere y FastAPI, usando "
            "pgvector para recuperación, LangSmith para trazabilidad y observabilidad y RAGAS "
            "para evaluar la calidad de las respuestas. Demo: "
            + link("youtu.be/WUIBx6V2yR8", "https://youtu.be/WUIBx6V2yR8")
        ))
        story.append(bullet(
            '<b>' + link("AI Hub", "https://github.com/diego-portillo/study-universe-project/tree/main/ai_hub") + '</b>'
            " — API de chat LLM multiproveedor que unifica modelos de distintos proveedores "
            "como OpenAI, Anthropic y Google en un solo backend. Demo: "
            + link("youtu.be/RKUtU4oiTFc", "https://youtu.be/RKUtU4oiTFc")
        ))

        story += section_header("FORMACIÓN Y CERTIFICACIONES")
        story.append(edu_row(
            "Desarrollo de Software — " + link("Platzi", "https://platzi.com/") + ", online",
            "2024 – Actualidad",
        ))
        story.append(edu_row("Técnico Superior en Ingeniería de Audio — IPAC, Paraguay", "2016"))
        story.append(P(
            "eduLang",
            "<b>Idiomas:</b> Español, nativo | Inglés, C2 " + link("certificado EF SET", "https://cert.efset.org/sjEEmU"),
        ))

        story += section_header("REFERENCIAS")
        story.append(P(
            "ref",
            link("Ryan Hill", "https://www.linkedin.com/in/ryan-hill-46b214327/")
            + " — Jefe, Approach Software | "
            + link("Talia Rios", "https://www.linkedin.com/in/talia-rios-76a06514a/")
            + " — Recursos Humanos, Experience AMP | "
            + link("Jon Radcliff", "https://www.linkedin.com/in/jonradcliff/")
            + " — Presidente, Party Center Software &amp; Approach",
        ))

    return story


def main():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=30,
        bottomMargin=30,
        title="Diego José Portillo Martínez - CV",
        author="Diego José Portillo Martínez",
    )
    story = build_page("en") + [PageBreak()] + build_page("es")
    doc.build(story)


if __name__ == "__main__":
    main()
