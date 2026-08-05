"""
analysis_engine.config
~~~~~~~~~~~~~~~~~~~~~~
Pydantic-settings configuration for the Analysis Engine worker.
All values are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ------------------------------------------------------------------ #
    # Redis / Celery
    # ------------------------------------------------------------------ #
    REDIS_URL: str = "redis://localhost:6379/0"

    # Queue that analysis-engine workers listen on
    ANALYSIS_CELERY_QUEUE: str = "analysis_tasks"

    # Queue that ai-engine workers listen on (used when publishing tasks)
    AI_CELERY_QUEUE: str = "ai_tasks"

    # ------------------------------------------------------------------ #
    # File system
    # ------------------------------------------------------------------ #
    # Temporary directory where repos are cloned before analysis
    TEMP_CLONE_DIR: str = "/tmp/spark_repos"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
