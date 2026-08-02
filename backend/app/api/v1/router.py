from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.modules.auth.router import router as auth_router

router = APIRouter()

router.include_router(
    health_router,
    tags=["Health"],
)

router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)