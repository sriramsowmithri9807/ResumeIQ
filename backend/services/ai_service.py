"""
Ollama integration for AI-generated resume improvement suggestions.
Uses llama3.2 running locally via Ollama.
Falls back to rule-based suggestions if Ollama is unavailable.
"""
import json
import re
from typing import List
import httpx

from models.schemas import AISuggestion

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"
TIMEOUT_SECONDS = 60


async def get_ai_suggestions(
    resume_text: str,
    jd_text: str,
    missing_keywords: List[str],
    ats_score: float,
) -> List[AISuggestion]:
    """
    Call Ollama to generate AI-powered resume improvement suggestions.
    Returns a list of AISuggestion objects.
    Falls back to rule-based suggestions if Ollama is not running.
    """
    try:
        suggestions = await call_ollama(resume_text, jd_text, missing_keywords, ats_score)
        if suggestions:
            return suggestions
    except Exception:
        pass

    # Fallback to rule-based suggestions
    return generate_rule_based_suggestions(resume_text, jd_text, missing_keywords, ats_score)


async def call_ollama(
    resume_text: str,
    jd_text: str,
    missing_keywords: List[str],
    ats_score: float,
) -> List[AISuggestion]:
    """
    Send a structured prompt to Ollama and parse the JSON response.
    """
    missing_str = ", ".join(missing_keywords[:10]) if missing_keywords else "none identified"

    prompt = f"""You are an expert ATS resume optimization specialist. Analyze the resume against the job description and provide exactly 6 specific, actionable improvement suggestions.

JOB DESCRIPTION (first 800 chars):
{jd_text[:800]}

RESUME (first 800 chars):
{resume_text[:800]}

ATS SCORE: {ats_score}/100
MISSING KEYWORDS: {missing_str}

Respond with a JSON array of exactly 6 objects. Each object must have:
- "category": one of ["Keywords", "Bullet Points", "Skills", "Experience", "Projects", "Formatting"]
- "suggestion": a specific, actionable improvement (1-2 sentences)
- "priority": one of ["High", "Medium", "Low"]

Return ONLY the JSON array, no other text. Example format:
[
  {{"category": "Keywords", "suggestion": "Add 'Docker' and 'Kubernetes' to your skills section as they appear 3 times in the job description.", "priority": "High"}}
]"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 800,
        }
    }

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        raw_response = data.get("response", "")

        # Extract JSON array from response
        json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if not json_match:
            return []

        suggestions_data = json.loads(json_match.group())
        suggestions = []
        for item in suggestions_data[:6]:
            suggestions.append(AISuggestion(
                category=item.get("category", "General"),
                suggestion=item.get("suggestion", ""),
                priority=item.get("priority", "Medium"),
            ))
        return suggestions


def generate_rule_based_suggestions(
    resume_text: str,
    jd_text: str,
    missing_keywords: List[str],
    ats_score: float,
) -> List[AISuggestion]:
    """
    Fallback rule-based suggestions when Ollama is not available.
    Still provides high-quality, context-aware suggestions.
    """
    suggestions = []
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # Keyword suggestion
    if missing_keywords:
        top_missing = ", ".join(missing_keywords[:5])
        suggestions.append(AISuggestion(
            category="Keywords",
            suggestion=f"Integrate these missing high-impact keywords naturally into your resume: {top_missing}. Add them in your skills section and weave them into bullet points.",
            priority="High"
        ))

    # Quantification suggestion
    if not re.search(r'\d+%|\$\d+|\d+x|\d+\+', resume_text):
        suggestions.append(AISuggestion(
            category="Bullet Points",
            suggestion="Quantify your achievements with metrics: replace vague phrases like 'improved performance' with 'improved API response time by 45%, reducing p99 latency from 2s to 1.1s'.",
            priority="High"
        ))
    else:
        suggestions.append(AISuggestion(
            category="Bullet Points",
            suggestion="Good use of metrics! Ensure every bullet point in your experience section starts with a strong action verb (Engineered, Orchestrated, Spearheaded, Reduced, Increased).",
            priority="Medium"
        ))

    # Skills section suggestion
    if "docker" in jd_lower and "docker" not in resume_lower:
        suggestions.append(AISuggestion(
            category="Skills",
            suggestion="The job description mentions Docker/containerization. Add Docker to your skills section and mention container usage in your project or experience descriptions.",
            priority="High"
        ))
    elif "cloud" in jd_lower or "aws" in jd_lower or "gcp" in jd_lower:
        suggestions.append(AISuggestion(
            category="Skills",
            suggestion="This role values cloud experience. List specific cloud services you've used (e.g., AWS EC2, S3, Lambda or GCP Cloud Run, BigQuery) to stand out.",
            priority="Medium"
        ))

    # Summary suggestion
    if "summary" not in resume_lower and "objective" not in resume_lower:
        suggestions.append(AISuggestion(
            category="Experience",
            suggestion="Add a professional summary (2-3 sentences) at the top of your resume. Tailor it to this specific role by mentioning the exact job title and 2-3 matching skills.",
            priority="High"
        ))
    else:
        suggestions.append(AISuggestion(
            category="Experience",
            suggestion="Tailor your professional summary to mirror the exact language in this job description. Use their words — ATS systems do exact string matching.",
            priority="Medium"
        ))

    # Project suggestion
    if "project" in jd_lower and "project" not in resume_lower:
        suggestions.append(AISuggestion(
            category="Projects",
            suggestion="Add a Projects section with 2-3 relevant projects. For each project, include: what it does, the tech stack you used, your specific role, and measurable outcomes.",
            priority="Medium"
        ))
    else:
        suggestions.append(AISuggestion(
            category="Projects",
            suggestion="For each project, add a GitHub link or live demo URL. Recruiters and ATS systems value verifiable work. Ensure project descriptions use keywords from this job description.",
            priority="Low"
        ))

    # Formatting suggestion
    if ats_score < 70:
        suggestions.append(AISuggestion(
            category="Formatting",
            suggestion="Use a clean, single-column ATS-friendly format. Avoid tables, text boxes, headers/footers, and graphics — most ATS parsers cannot read them. Use clear section headers in all caps.",
            priority="Medium"
        ))
    else:
        suggestions.append(AISuggestion(
            category="Formatting",
            suggestion="Ensure consistent formatting: use the same font, bullet style, and date format throughout. Keep your resume to 1 page if under 5 years of experience, 2 pages maximum.",
            priority="Low"
        ))

    return suggestions[:6]
