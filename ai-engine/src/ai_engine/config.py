"""
ai_engine.config
~~~~~~~~~~~~~~~~
Pydantic-settings configuration for the AI Engine worker.
All values are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ------------------------------------------------------------------ #
    # Redis / Celery
    # ------------------------------------------------------------------ #
    REDIS_URL: str = "redis://localhost:6379/0"

    # Queue that this worker listens on
    AI_CELERY_QUEUE: str = "ai_tasks"

    # ------------------------------------------------------------------ #
    # Qdrant Vector Database
    # ------------------------------------------------------------------ #
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "spark_analysis"

    # ------------------------------------------------------------------ #
    # Ollama (local LLM + optional local embeddings)
    # ------------------------------------------------------------------ #
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # LLM model — any model pulled via `ollama pull <model>`
    # Recommended: qwen2.5:7b (balanced) or llama3.2:3b (lighter)
    OLLAMA_CHAT_MODEL: str = "qwen2.5:7b"

    # Embedding model running on Ollama
    # Recommended: nomic-embed-text (768-dim, fast, high quality)
    # Pull with: ollama pull nomic-embed-text
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    # ------------------------------------------------------------------ #
    # Embedding provider selection
    # "ollama"  → use local Ollama (default, completely free, no key needed)
    # "gemini"  → use Google Gemini free tier (1500 req/day, no credit card)
    # ------------------------------------------------------------------ #
    EMBED_PROVIDER: str = "ollama"

    # Google Gemini API key — only required when EMBED_PROVIDER=gemini
    # Free API key via: https://aistudio.google.com/app/apikey
    # Model used: text-embedding-004 (768-dim, same size as nomic-embed-text)
    GEMINI_API_KEY: str = ""
    GEMINI_EMBED_MODEL: str = "models/text-embedding-004"

    # ------------------------------------------------------------------ #
    # Backend API (for posting the final report)
    # ------------------------------------------------------------------ #
    BACKEND_API_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

