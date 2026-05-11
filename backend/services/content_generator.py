import json
import re
import random
from typing import List
import httpx

from models.schemas import ResumeContentSnippets
from utils.text_utils import extract_tech_skills, extract_keywords, detect_sections

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"
TIMEOUT_SECONDS = 90


# ── Public entry point ────────────────────────────────────────────────────────

async def generate_resume_content(
    resume_text: str,
    jd_text: str,
    matched_keywords: List[str],
    missing_keywords: List[str],
    ats_score: float,
) -> ResumeContentSnippets:
    """
    Try Ollama first for AI-powered content generation.
    Falls back to rule-based generation if Ollama is not running.
    """
    try:
        result = await _call_ollama(resume_text, jd_text, missing_keywords, ats_score)
        if result:
            return result
    except Exception as e:
        print(f"Ollama generation failed, using fallback: {e}")

    return _rule_based_content(resume_text, jd_text, matched_keywords, missing_keywords)


# ── Ollama path ───────────────────────────────────────────────────────────────

async def _call_ollama(
    resume_text: str,
    jd_text: str,
    missing_keywords: List[str],
    ats_score: float,
) -> ResumeContentSnippets | None:
    """Call Ollama to generate structured resume content snippets."""
    missing_str = ", ".join(missing_keywords[:12]) if missing_keywords else "none"

    prompt = f"""You are an expert resume writer. Generate tailored resume content that a job applicant can copy-paste directly into their resume.

JOB DESCRIPTION (first 1000 chars):
{jd_text[:1000]}

CANDIDATE'S CURRENT RESUME (first 800 chars):
{resume_text[:800]}

MISSING KEYWORDS TO INCORPORATE: {missing_str}

Generate a JSON object with EXACTLY these four fields:

{{
  "tailored_summary": "A 2-3 sentence professional summary tailored to this specific job. Must naturally include the most important keywords from the JD. Write in first-person omitting 'I'. Should be ready to paste at the top of their resume.",
  "experience_bullets": [
    "Action verb + task + measurable result that uses keywords from this JD (start with strong verb like Led, Built, Engineered, Reduced, Increased, Deployed)",
    "Another bullet point incorporating missing keywords into a plausible achievement",
    "A third bullet that shows relevant impact",
    "A fourth bullet emphasising a different skill area from the JD",
    "A fifth bullet"
  ],
  "skills_to_add": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "cover_letter_intro": "A compelling 2-3 sentence cover letter opening paragraph. Mention the specific role, a key strength from the resume, and enthusiasm for this company/role."
}}

Rules:
- experience_bullets must be 5 items, each starting with a past-tense action verb
- skills_to_add must be 6-10 individual skill strings (no sentences)
- All content must feel authentic and directly usable
- Return ONLY the JSON object, no other text
- BE CREATIVE and VARY the sentence structure.
- DO NOT use the same templates or phrasing twice.
- Ensure each bullet point is unique and high-impact.
- Adapt the tone to match the job description's level (e.g., more formal for enterprise, more dynamic for startups)."""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.8, "num_predict": 1200},
    }

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        response.raise_for_status()
        raw = response.json().get("response", "")

    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not json_match:
        return None

    data = json.loads(json_match.group())

    return ResumeContentSnippets(
        tailored_summary=data.get("tailored_summary", ""),
        experience_bullets=data.get("experience_bullets", [])[:5],
        skills_to_add=data.get("skills_to_add", [])[:10],
        cover_letter_intro=data.get("cover_letter_intro", ""),
    )


# ── Rule-based fallback ───────────────────────────────────────────────────────

def _rule_based_content(
    resume_text: str,
    jd_text: str,
    matched_keywords: List[str],
    missing_keywords: List[str],
) -> ResumeContentSnippets:
    """
    Generate high-quality resume content without an LLM.
    Uses keyword extraction, tech skill ontology, and smart templates.
    """
    jd_skills = extract_tech_skills(jd_text)
    resume_skills = extract_tech_skills(resume_text)
    all_missing_skills = list(set(jd_skills) - set(resume_skills))

    # ── Tailored professional summary ────────────────────────────────────────
    top_matched = matched_keywords[:4]
    top_missing = missing_keywords[:3]
    all_kws = list(set(top_matched + top_missing))
    random.shuffle(all_kws)
    kw_phrase = ", ".join(all_kws[:5]) if all_kws else "software development"

    role = _extract_role(jd_text)
    yoe = _detect_years(resume_text)

    summary_templates = [
        f"Results-driven {role} with {yoe} of hands-on experience delivering high-impact solutions using {kw_phrase}. Proven track record of collaborating cross-functionally to ship scalable systems.",
        f"Dynamic {role} with over {yoe} of expertise in {kw_phrase}. Highly skilled in building production-ready applications and solving complex technical challenges in fast-paced environments.",
        f"Experienced {role} specialised in {kw_phrase}. Dedicated to engineering efficient, scalable solutions and leveraging {yoe} of experience to drive business growth and technical excellence.",
    ]
    tailored_summary = random.choice(summary_templates)

    # ── Experience bullet points ─────────────────────────────────────────────
    bullets = _generate_bullets(jd_text, jd_skills, missing_keywords)

    # ── Skills to add ────────────────────────────────────────────────────────
    skills_to_add = all_missing_skills[:8]
    for kw in missing_keywords:
        if kw not in skills_to_add and len(skills_to_add) < 10:
            skills_to_add.append(kw)

    # ── Cover letter intro ───────────────────────────────────────────────────
    matched_str = ", ".join(matched_keywords[:3]) if matched_keywords else "software engineering"
    cover_letter_intro = (
        f"I am excited to apply for the {role} position. "
        f"With a strong background in {matched_str} and a passion for building "
        f"impactful products, I am confident I can bring immediate value to your team. "
        f"The opportunity to contribute to a role that emphasises {kw_phrase} "
        f"aligns perfectly with my experience and career goals."
    )

    return ResumeContentSnippets(
        tailored_summary=tailored_summary,
        experience_bullets=bullets,
        skills_to_add=skills_to_add[:10],
        cover_letter_intro=cover_letter_intro,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_role(jd_text: str) -> str:
    patterns = [
        r'(?:looking for|hiring|seeking)\s+(?:a|an)\s+([\w\s]{3,40}?)\s+(?:to|who|with)',
        r'(?:position|role|title)[:\s]+([A-Z][\w\s]{2,35})',
        r'^([A-Z][A-Za-z\s]{3,40})\n',
    ]
    for pattern in patterns:
        match = re.search(pattern, jd_text, re.IGNORECASE | re.MULTILINE)
        if match:
            role = match.group(1).strip().title()
            if len(role) < 60:
                return role
    return "Software Engineer"


def _detect_years(resume_text: str) -> str:
    years = re.findall(r'20(\d{2})', resume_text)
    if len(years) >= 2:
        span = int(max(years)) - int(min(years))
        if span > 0:
            return f"{span}+ years"
    return "several years"


def _generate_bullets(jd_text: str, jd_skills: List[str], missing_keywords: List[str]) -> List[str]:
    jd_lower = jd_text.lower()
    bullets = []

    TEMPLATES = [
        ("kubernetes", "Orchestrated containerised microservices using Kubernetes and Docker, achieving 99.9% uptime and reducing deployment time by 60%"),
        ("docker", "Built and maintained Docker-based CI/CD pipelines, cutting release cycles from weekly to daily deployments"),
        ("aws", "Architected and deployed scalable infrastructure on AWS (EC2, S3, Lambda, RDS), reducing cloud costs by 25%"),
        ("gcp", "Migrated legacy monolith to GCP-based microservices, improving system reliability and reducing operational overhead"),
        ("azure", "Deployed enterprise-grade applications on Azure with automated scaling policies and infrastructure-as-code using Terraform"),
        ("machine learning", "Designed and deployed machine learning models in production, improving prediction accuracy by 18% and reducing manual review workload"),
        ("react", "Engineered performant React frontends serving 200K+ monthly active users, achieving sub-2s load times via code splitting and lazy loading"),
        ("typescript", "Migrated JavaScript codebase to TypeScript, eliminating 90% of runtime type errors and improving developer productivity"),
        ("node", "Built RESTful and GraphQL APIs in Node.js handling 10K+ requests/second with <100ms p99 latency"),
        ("python", "Developed Python-based data pipelines processing 5M+ records daily with Apache Airflow orchestration"),
        ("data", "Designed data warehouse schemas and built analytical dashboards reducing ad-hoc query time by 70%"),
        ("agile", "Led agile sprint ceremonies as tech lead for a 6-person cross-functional team, consistently delivering features on schedule"),
        ("ci/cd", "Implemented end-to-end CI/CD pipelines using GitHub Actions, reducing manual QA effort by 40% and deployment failures by 80%"),
        ("postgresql", "Optimised PostgreSQL database performance through indexing and query refactoring, reducing average query time from 2s to 180ms"),
        ("graphql", "Designed GraphQL API layer replacing 12 REST endpoints, reducing client data over-fetching by 45%"),
        ("terraform", "Automated cloud infrastructure provisioning with Terraform IaC, enabling reproducible environments across dev/staging/prod"),
        ("security", "Implemented OAuth 2.0 / JWT authentication and role-based access control, achieving SOC 2 compliance requirements"),
        ("performance", "Profiled and optimised application performance, reducing memory footprint by 35% and improving throughput by 2.5×"),
        ("testing", "Authored 200+ unit and integration tests using Jest and Cypress, increasing code coverage to 92% and reducing production bugs"),
        ("java", "Engineered scalable backend services in Java/Spring Boot, improving system throughput by 40% through multithreading"),
        ("golang", "Developed high-performance microservices in Go, reducing CPU usage by 30% compared to legacy implementation"),
        ("monitoring", "Implemented real-time monitoring and alerting with Prometheus and Grafana, reducing Mean Time to Detection (MTTD) by 50%"),
    ]

    # Shuffle templates for variety
    random.shuffle(TEMPLATES)

    for signal, bullet in TEMPLATES:
        if signal in jd_lower and len(bullets) < 5:
            bullets.append(bullet)

    # Dynamic generic bullet builder
    verbs = ["Led", "Developed", "Architected", "Engineered", "Optimised", "Streamlined", "Spearheaded", "Implemented"]
    tasks = [
        "cross-functional engineering initiatives to improve system reliability",
        "scalable backend services handling high-traffic production workloads",
        "modern frontend architectures with a focus on performance and accessibility",
        "automated testing suites and CI/CD pipelines to ensure code quality",
        "complex technical solutions for critical business requirements",
        "system design and code reviews for large-scale applications",
        "technical documentation and developer-facing APIs",
        "performance tuning and optimization across the full stack"
    ]
    metrics = [
        "resulting in a 30% increase in developer productivity",
        "achieving a 25% reduction in production incidents",
        "improving system throughput by 40% under peak load",
        "cutting operational costs by 15% through infrastructure optimization",
        "enhancing user engagement by 20% via performance improvements",
        "reducing deployment time from hours to minutes",
        "increasing test coverage by 45% for legacy codebases",
        "improving API response times by 200ms on average"
    ]

    while len(bullets) < 5:
        verb = random.choice(verbs)
        task = random.choice(tasks)
        metric = random.choice(metrics)
        new_bullet = f"{verb} {task}, {metric}."
        if new_bullet not in bullets:
            bullets.append(new_bullet)

    return bullets[:5]
