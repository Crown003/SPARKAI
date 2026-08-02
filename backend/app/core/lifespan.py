from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Handle startup and shutdown events.
    """
    # Startup logic
    logger.info("Application startup initiated.")
    
    # In the future:
    # - Initialize database connections
    # - Start background workers/Redis connections
    
    yield
    
    # Shutdown logic
    logger.info("Application shutdown initiated.")
    
    # In the future:
    # - Close database connections
    # - Stop background workers
