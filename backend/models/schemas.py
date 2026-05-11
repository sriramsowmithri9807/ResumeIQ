"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import List, Optional


class AnalysisRequest(BaseModel):
    """Request model — job description text (resume comes as file upload)."""
    job_description: str


class KeywordAnalysis(BaseModel):
    """Breakdown of keyword matching."""
    matched_keywords: List[str]
    missing_keywords: List[str]
    match_percentage: float


class ScoreBreakdown(BaseModel):
    """Detailed ATS score breakdown by category."""
    keyword_match: float       # 50% weight
    skills_match: float        # 20% weight
    experience_relevance: float  # 15% weight
    projects_relevance: float  # 10% weight
    formatting_score: float    # 5% weight
    total: float               # weighted total (0-100)


class WeakSection(BaseModel):
    """A section of the resume identified as weak."""
    section: str
    reason: str
    suggestion: str


class AISuggestion(BaseModel):
    """A single AI-generated improvement suggestion."""
    category: str     # e.g. "Keywords", "Bullet Points", "Skills"
    suggestion: str
    priority: str     # "High", "Medium", "Low"


class ResumeStrength(BaseModel):
    """A identified strength in the resume."""
    area: str
    description: str


class ResumeContentSnippets(BaseModel):
    """
    Ready-to-copy resume content tailored to the job description.
    Users can copy-paste these directly into their resume.
    """
    tailored_summary: str           # Professional summary paragraph to paste at the top
    experience_bullets: List[str]   # Bullet points to add/replace in experience section
    skills_to_add: List[str]        # Skills to add to the skills section
    cover_letter_intro: str         # Opening paragraph for a cover letter


class AnalysisResult(BaseModel):
    """Full analysis result returned to the frontend."""
    ats_score: float                    # 0-100
    match_percentage: float             # % of JD requirements matched
    hiring_probability: str             # "High", "Medium", "Low"
    score_breakdown: ScoreBreakdown
    keyword_analysis: KeywordAnalysis
    weak_sections: List[WeakSection]
    strengths: List[ResumeStrength]
    ai_suggestions: List[AISuggestion]
    resume_content: ResumeContentSnippets   # copy-pasteable resume content
    resume_text_preview: Optional[str] = None  # first 500 chars
