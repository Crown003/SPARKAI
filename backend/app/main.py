from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.logger import setup_logging
from app.core.middleware import setup_middlewares
from app.core.lifespan import lifespan
from app.shared.exceptions import setup_exception_handlers

# Setup Logging First
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Setup Exception Handlers
setup_exception_handlers(app)

# Setup Middlewares
setup_middlewares(app)

# Include Routers
app.include_router(api_router)