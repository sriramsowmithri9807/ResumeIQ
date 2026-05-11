"""
ResumeIQ FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.analyze import router as analyze_router
from api.routes.health import router as health_router

app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered ATS Resume Analyzer backend",
    version="1.0.0",
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://resumeiq.vercel.app",  # production placeholder
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(analyze_router, prefix="/api/v1", tags=["Analyze"])


@app.get("/")
async def root():
    return {"message": "ResumeIQ API is running. Visit /docs for API documentation."}
