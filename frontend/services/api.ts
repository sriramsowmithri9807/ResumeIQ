/**
 * API service — typed client for the FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types matching backend schemas ─────────────────────────────────────────

export interface ScoreBreakdown {
  keyword_match: number;
  skills_match: number;
  experience_relevance: number;
  projects_relevance: number;
  formatting_score: number;
  total: number;
}

export interface KeywordAnalysis {
  matched_keywords: string[];
  missing_keywords: string[];
  match_percentage: number;
}

export interface WeakSection {
  section: string;
  reason: string;
  suggestion: string;
}

export interface AISuggestion {
  category: string;
  suggestion: string;
  priority: "High" | "Medium" | "Low";
}

export interface ResumeStrength {
  area: string;
  description: string;
}

/** Ready-to-copy resume content tailored to the job description */
export interface ResumeContentSnippets {
  tailored_summary: string;
  experience_bullets: string[];
  skills_to_add: string[];
  cover_letter_intro: string;
}

export interface AnalysisResult {
  ats_score: number;
  match_percentage: number;
  hiring_probability: "High" | "Medium" | "Low";
  score_breakdown: ScoreBreakdown;
  keyword_analysis: KeywordAnalysis;
  weak_sections: WeakSection[];
  strengths: ResumeStrength[];
  ai_suggestions: AISuggestion[];
  resume_content: ResumeContentSnippets; // ← NEW
  resume_text_preview?: string;
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("job_description", jobDescription);

  const response = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Analysis failed. Please try again.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
