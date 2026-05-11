"""
ATS Scoring Engine.

Scoring breakdown:
  - Keyword Match:         50% weight
  - Skills Match:          20% weight
  - Experience Relevance:  15% weight
  - Projects Relevance:    10% weight
  - Formatting:             5% weight
"""
from typing import List, Tuple
from utils.text_utils import (
    extract_keywords,
    detect_sections,
    detect_formatting_quality,
    extract_tech_skills,
    clean_text,
)
from models.schemas import (
    ScoreBreakdown,
    KeywordAnalysis,
    WeakSection,
    ResumeStrength,
)


def compute_keyword_match(resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
    """
    Compare resume and JD keywords.
    Returns: (match_score 0-100, matched_keywords, missing_keywords)
    """
    jd_keywords = set(extract_keywords(jd_text, top_n=40))
    resume_keywords = set(extract_keywords(resume_text, top_n=60))

    matched = jd_keywords & resume_keywords
    missing = jd_keywords - resume_keywords

    if not jd_keywords:
        return 0.0, [], []

    match_ratio = len(matched) / len(jd_keywords)
    score = round(match_ratio * 100, 1)

    return score, sorted(matched), sorted(missing)


def compute_skills_match(resume_text: str, jd_text: str) -> float:
    """
    Compare tech skills using the predefined ontology.
    Returns score 0-100.
    """
    jd_skills = set(extract_tech_skills(jd_text))
    resume_skills = set(extract_tech_skills(resume_text))

    if not jd_skills:
        # If JD doesn't mention specific tech skills, give a neutral score
        return 60.0

    matched = jd_skills & resume_skills
    ratio = len(matched) / len(jd_skills)
    return round(ratio * 100, 1)


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """
    Compute cosine similarity between two texts using sentence-transformers.
    Returns score 0-100.
    Falls back to keyword overlap if model unavailable.
    """
    try:
        from sentence_transformers import SentenceTransformer, util
        import torch

        model = SentenceTransformer('all-MiniLM-L6-v2')
        # Truncate to avoid memory issues with large texts
        a_truncated = text_a[:2000]
        b_truncated = text_b[:2000]

        emb_a = model.encode(a_truncated, convert_to_tensor=True)
        emb_b = model.encode(b_truncated, convert_to_tensor=True)

        similarity = util.cos_sim(emb_a, emb_b).item()
        # Normalize from [-1,1] to [0,100], then scale up since resumes rarely score >0.5
        score = (similarity + 1) / 2 * 100
        # Apply soft scaling for more human-readable scores
        score = 40 + (score - 50) * 1.2 if score > 50 else score
        return round(max(0, min(score, 100)), 1)

    except ImportError:
        # Fallback: keyword overlap
        kw_a = set(extract_keywords(text_a, top_n=30))
        kw_b = set(extract_keywords(text_b, top_n=30))
        if not kw_b:
            return 50.0
        overlap = len(kw_a & kw_b) / len(kw_b)
        return round(overlap * 100, 1)


def compute_experience_relevance(resume_text: str, jd_text: str) -> float:
    """Semantic similarity focused on the experience section."""
    sections = detect_sections(resume_text)
    experience_text = sections.get("experience") or resume_text[:1500]
    return compute_semantic_similarity(experience_text, jd_text[:1500])


def compute_projects_relevance(resume_text: str, jd_text: str) -> float:
    """Semantic similarity focused on the projects section."""
    sections = detect_sections(resume_text)
    projects_text = sections.get("projects") or ""
    if not projects_text:
        return 50.0  # Neutral if no projects section
    return compute_semantic_similarity(projects_text, jd_text[:1000])


def compute_formatting_score(resume_text: str) -> float:
    """Formatting quality heuristic 0-100."""
    return detect_formatting_quality(resume_text) * 100


def identify_weak_sections(resume_text: str, jd_text: str) -> List[WeakSection]:
    """Identify sections that are weak relative to the JD."""
    weak_sections = []
    sections = detect_sections(resume_text)
    jd_skills = set(extract_tech_skills(jd_text))
    resume_skills = set(extract_tech_skills(resume_text))
    missing_skills = jd_skills - resume_skills

    # Check: Missing summary
    if not sections.get("summary"):
        weak_sections.append(WeakSection(
            section="Professional Summary",
            reason="No summary section found in your resume",
            suggestion="Add a 2-3 sentence professional summary highlighting your key skills and career goals"
        ))

    # Check: Missing or thin skills section
    if not sections.get("skills") and missing_skills:
        weak_sections.append(WeakSection(
            section="Skills",
            reason=f"Skills section is missing or thin. Missing: {', '.join(list(missing_skills)[:5])}",
            suggestion="Add a dedicated skills section with relevant technical skills from the job description"
        ))
    elif missing_skills:
        weak_sections.append(WeakSection(
            section="Skills",
            reason=f"Missing key skills required by the job: {', '.join(list(missing_skills)[:5])}",
            suggestion=f"Add the following skills if you have them: {', '.join(list(missing_skills)[:8])}"
        ))

    # Check: No quantified achievements
    import re
    if not re.search(r'\d+%|\$\d+|\d+x|\d+\+', resume_text):
        weak_sections.append(WeakSection(
            section="Experience Bullet Points",
            reason="No measurable achievements found (percentages, dollar amounts, multipliers)",
            suggestion="Quantify your impact: e.g. 'Reduced load time by 40%' or 'Led team of 5 engineers'"
        ))

    # Check: Projects section missing when JD asks for them
    jd_lower = jd_text.lower()
    if not sections.get("projects") and ("portfolio" in jd_lower or "project" in jd_lower):
        weak_sections.append(WeakSection(
            section="Projects",
            reason="No projects section found, but the JD values project experience",
            suggestion="Add 2-3 relevant projects with tech stack, your role, and measurable outcomes"
        ))

    return weak_sections


def identify_strengths(resume_text: str, jd_text: str) -> List[ResumeStrength]:
    """Identify strong areas in the resume relative to the JD."""
    strengths = []
    sections = detect_sections(resume_text)
    jd_skills = set(extract_tech_skills(jd_text))
    resume_skills = set(extract_tech_skills(resume_text))
    matched_skills = jd_skills & resume_skills

    import re

    if matched_skills:
        strengths.append(ResumeStrength(
            area="Technical Skills Match",
            description=f"Strong overlap with required skills: {', '.join(list(matched_skills)[:6])}"
        ))

    if sections.get("experience") and len(sections["experience"].split()) > 100:
        strengths.append(ResumeStrength(
            area="Experience Detail",
            description="Your experience section is well-developed with detailed descriptions"
        ))

    if re.search(r'\d+%|\$\d+|\d+x|\d+\+', resume_text):
        strengths.append(ResumeStrength(
            area="Quantified Achievements",
            description="You have measurable achievements that stand out to ATS and recruiters"
        ))

    if sections.get("education"):
        strengths.append(ResumeStrength(
            area="Education",
            description="Education section is present and structured"
        ))

    if sections.get("certifications"):
        strengths.append(ResumeStrength(
            area="Certifications",
            description="Professional certifications add credibility to your profile"
        ))

    return strengths[:5]  # Return top 5 strengths


def determine_hiring_probability(ats_score: float) -> str:
    """Map ATS score to a hiring probability tier."""
    if ats_score >= 80:
        return "High"
    elif ats_score >= 60:
        return "Medium"
    else:
        return "Low"


def compute_ats_score(resume_text: str, jd_text: str):
    """
    Main scoring function. Computes full ATS analysis.
    Returns (ScoreBreakdown, KeywordAnalysis, weak_sections, strengths, match_percentage)
    """
    # Compute individual component scores
    keyword_score, matched_kws, missing_kws = compute_keyword_match(resume_text, jd_text)
    skills_score = compute_skills_match(resume_text, jd_text)
    experience_score = compute_experience_relevance(resume_text, jd_text)
    projects_score = compute_projects_relevance(resume_text, jd_text)
    formatting_score = compute_formatting_score(resume_text)

    # Weighted total (weights sum to 1.0)
    total = (
        keyword_score * 0.50 +
        skills_score * 0.20 +
        experience_score * 0.15 +
        projects_score * 0.10 +
        formatting_score * 0.05
    )
    total = round(min(total, 100), 1)

    score_breakdown = ScoreBreakdown(
        keyword_match=keyword_score,
        skills_match=skills_score,
        experience_relevance=experience_score,
        projects_relevance=projects_score,
        formatting_score=formatting_score,
        total=total,
    )

    # Match percentage — based on keyword + skills
    match_pct = round((keyword_score * 0.6 + skills_score * 0.4), 1)

    keyword_analysis = KeywordAnalysis(
        matched_keywords=matched_kws[:20],
        missing_keywords=missing_kws[:20],
        match_percentage=match_pct,
    )

    weak_sections = identify_weak_sections(resume_text, jd_text)
    strengths = identify_strengths(resume_text, jd_text)

    return score_breakdown, keyword_analysis, weak_sections, strengths, match_pct
