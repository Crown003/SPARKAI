from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class SparkAIException(Exception):
    """Base exception for all SPARK AI custom exceptions."""
    def __init__(self, message: str, status_code: int = 500, detail: str | None = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)

class ResourceNotFoundException(SparkAIException):
    def __init__(self, resource: str, resource_id: str | int):
        super().__init__(
            message=f"{resource} not found.",
            status_code=404,
            detail=f"The {resource} with ID {resource_id} does not exist.",
        )

def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(SparkAIException)
    async def spark_ai_exception_handler(request: Request, exc: SparkAIException) -> JSONResponse:
        logger.error(f"Handled Exception: {exc.message} - {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.message,
                "detail": exc.detail,
            }
        )
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled Server Error")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": "An unexpected error occurred. Please try again later.",
            }
        )
