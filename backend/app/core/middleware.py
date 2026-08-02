import time
import logging
from typing import Callable, Awaitable
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

logger = logging.getLogger(__name__)

async def log_request_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """
    Middleware to log request details and timing.
    """
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    # Add custom header for process time
    response.headers["X-Process-Time"] = str(process_time)
    
    logger.info(
        f"{request.method} {request.url.path} "
        f"- Status: {response.status_code} "
        f"- Time: {process_time:.4f}s"
    )
    
    return response

def setup_middlewares(app: FastAPI) -> None:
    """
    Configure all middlewares for the application.
    Note: Middlewares are executed in the reverse order they are added.
    """
    # 1. Request logging (added first, executes last to capture full time)
    app.middleware("http")(log_request_middleware)
    
    # 2. CORS setup
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
