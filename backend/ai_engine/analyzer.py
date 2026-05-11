"""
Main AI analysis orchestrator.
Combines parsing, scoring, AI suggestions, and content generation into one pipeline.
"""
from typing import Tuple
from models.schemas import AnalysisResult
from parsers.pdf_parser import extract_text_from_pdf
from parsers.docx_parser import extract_text_from_docx
from services.scoring import compute_ats_score, determine_hiring_probability
from services.ai_service import get_ai_suggestions
from services.content_generator import generate_resume_content


def parse_resume(file_bytes: bytes, filename: str) -> str:
    """
    Parse resume file bytes into plain text.
    Supports PDF and DOCX.
    """
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type. Please upload a PDF or DOCX file. Got: {filename}")


async def analyze_resume(
    resume_bytes: bytes,
    filename: str,
    job_description: str,
) -> AnalysisResult:
    """
    Full analysis pipeline:
    1. Parse resume to text
    2. Compute ATS score breakdown
    3. Get AI improvement suggestions
    4. Generate copy-pasteable resume content tailored to the JD
    5. Return structured AnalysisResult
    """
    # Step 1: Extract text
    resume_text = parse_resume(resume_bytes, filename)

    if len(resume_text.strip()) < 50:
        raise ValueError("Could not extract sufficient text from your resume. Please ensure the file is not scanned/image-based.")

    # Step 2: ATS scoring
    score_breakdown, keyword_analysis, weak_sections, strengths, match_pct = compute_ats_score(
        resume_text, job_description
    )

    # Step 3: AI suggestions (async — calls Ollama or fallback)
    ai_suggestions = await get_ai_suggestions(
        resume_text=resume_text,
        jd_text=job_description,
        missing_keywords=keyword_analysis.missing_keywords,
        ats_score=score_breakdown.total,
    )

    # Step 4: Generate tailored resume content snippets (NEW)
    resume_content = await generate_resume_content(
        resume_text=resume_text,
        jd_text=job_description,
        matched_keywords=keyword_analysis.matched_keywords,
        missing_keywords=keyword_analysis.missing_keywords,
        ats_score=score_breakdown.total,
    )

    # Step 5: Determine hiring probability tier
    hiring_probability = determine_hiring_probability(score_breakdown.total)

    return AnalysisResult(
        ats_score=score_breakdown.total,
        match_percentage=match_pct,
        hiring_probability=hiring_probability,
        score_breakdown=score_breakdown,
        keyword_analysis=keyword_analysis,
        weak_sections=weak_sections,
        strengths=strengths,
        ai_suggestions=ai_suggestions,
        resume_content=resume_content,
        resume_text_preview=resume_text[:500] if resume_text else None,
    )
