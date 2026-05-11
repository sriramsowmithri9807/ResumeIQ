"""
Health check route.
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "ResumeIQ API",
        "timestamp": datetime.utcnow().isoformat(),
    }
