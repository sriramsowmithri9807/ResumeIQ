"""
FastAPI route: POST /api/v1/analyze
Accepts multipart form with resume file + job description text.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from ai_engine.analyzer import analyze_resume
from models.schemas import AnalysisResult

router = APIRouter()

# Max file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    resume: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Job description text"),
):
    """
    Analyze a resume against a job description.
    Returns ATS score, keyword analysis, and AI improvement suggestions.
    """
    # Validate file extension
    filename = resume.filename or "resume"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Please upload a PDF or DOCX file."
        )

    # Read and validate file size
    file_bytes = await resume.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 5MB."
        )

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Validate job description
    jd_stripped = job_description.strip()
    if len(jd_stripped) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please paste the full job description (at least 50 characters)."
        )

    try:
        result = await analyze_resume(
            resume_bytes=file_bytes,
            filename=filename,
            job_description=jd_stripped,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
