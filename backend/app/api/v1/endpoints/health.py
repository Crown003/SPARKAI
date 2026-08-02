from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Perform a Health Check", response_model=dict[str, str])
async def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        API health status.
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }