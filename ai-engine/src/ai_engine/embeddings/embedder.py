"""
ai_engine.embeddings.embedder
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Provider-agnostic embedding interface.

Two implementations are provided:
  1. OllamaEmbedder  — default. Uses a locally running Ollama server.
                       Zero cost, zero API keys, works offline.
                       Recommended model: nomic-embed-text (768-dim).

  2. GeminiEmbedder  — alternative. Uses Google Gemini API free tier.
                       1,500 requests/day, no credit card required.
                       Model: text-embedding-004 (768-dim).
                       Get a free API key at https://aistudio.google.com/app/apikey

Both produce 768-dimensional vectors, so they are interchangeable
without any Qdrant collection changes.

Select the provider via config:
    EMBED_PROVIDER=ollama  (default)
    EMBED_PROVIDER=gemini  (requires GEMINI_API_KEY)
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod

from loguru import logger

from ai_engine.config import settings

# Vector size is 768 for both nomic-embed-text and text-embedding-004.
# Update this constant if you switch to a different model dimensionality.
VECTOR_SIZE = 768


# ------------------------------------------------------------------ #
# Abstract interface
# ------------------------------------------------------------------ #


class BaseEmbedder(ABC):
    """Abstract base — swap providers by subclassing."""

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        """Embed a single text string. Returns a float vector."""
        ...

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of strings. Returns a list of float vectors (same order)."""
        ...

    @property
    def vector_size(self) -> int:
        """Dimensionality of the vectors produced by this embedder."""
        return VECTOR_SIZE


# ------------------------------------------------------------------ #
# Ollama implementation (default — local, free, offline)
# ------------------------------------------------------------------ #


class OllamaEmbedder(BaseEmbedder):
    """
    Embeds text via a locally running Ollama server.

    Requirements:
      1. Ollama installed and running: https://ollama.com
      2. Embedding model pulled: `ollama pull nomic-embed-text`

    The langchain-ollama package is used for the HTTP calls.
    """

    def __init__(
        self,
        model: str | None = None,
        base_url: str | None = None,
    ) -> None:
        from langchain_ollama import OllamaEmbeddings  # lazy import

        self._model = model or settings.OLLAMA_EMBED_MODEL
        self._base_url = base_url or settings.OLLAMA_BASE_URL
        self._embedder = OllamaEmbeddings(
            model=self._model,
            base_url=self._base_url,
        )
        logger.info(
            "OllamaEmbedder initialised",
            model=self._model,
            base_url=self._base_url,
        )

    def embed_text(self, text: str) -> list[float]:
        return self._embedder.embed_query(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        return self._embedder.embed_documents(texts)


# ------------------------------------------------------------------ #
# Google Gemini implementation (free-tier alternative — online)
# ------------------------------------------------------------------ #


class GeminiEmbedder(BaseEmbedder):
    """
    Embeds text using Google Gemini's text-embedding-004 model.

    Free tier: 1,500 requests per day. No credit card required.
    Get an API key at: https://aistudio.google.com/app/apikey

    Note: Google's free tier may use your data for model improvement.
    For sensitive/proprietary codebases, use OllamaEmbedder instead.
    """

    def __init__(
        self,
        model: str | None = None,
        api_key: str | None = None,
    ) -> None:
        import google.generativeai as genai  # lazy import

        self._model = model or settings.GEMINI_EMBED_MODEL
        resolved_key = api_key or settings.GEMINI_API_KEY
        if not resolved_key:
            raise ValueError(
                "GEMINI_API_KEY is required when EMBED_PROVIDER=gemini. "
                "Get a free key at https://aistudio.google.com/app/apikey"
            )
        genai.configure(api_key=resolved_key)
        self._genai = genai
        logger.info("GeminiEmbedder initialised", model=self._model)

    def embed_text(self, text: str) -> list[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Embed a list of texts.

        The Gemini free tier has a rate limit of ~1500 req/day.
        We embed one by one with a tiny sleep to avoid burst-rate issues.
        """
        if not texts:
            return []

        results: list[list[float]] = []
        for i, text in enumerate(texts):
            result = self._genai.embed_content(
                model=self._model,
                content=text,
                task_type="retrieval_document",
            )
            results.append(result["embedding"])
            # Small polite delay to stay well within rate limits
            if i < len(texts) - 1:
                time.sleep(0.1)

        return results


# ------------------------------------------------------------------ #
# Factory — selects provider from config
# ------------------------------------------------------------------ #


def get_embedder() -> BaseEmbedder:
    """
    Return the configured embedder instance.

    Controlled by EMBED_PROVIDER environment variable:
      - "ollama"  (default) → OllamaEmbedder
      - "gemini"            → GeminiEmbedder
    """
    provider = settings.EMBED_PROVIDER.lower()

    if provider == "gemini":
        logger.info("Using GeminiEmbedder (Google free tier)")
        return GeminiEmbedder()

    if provider == "ollama":
        logger.info("Using OllamaEmbedder (local)")
        return OllamaEmbedder()

    raise ValueError(
        f"Unknown EMBED_PROVIDER '{provider}'. "
        "Valid options: 'ollama' (default), 'gemini'."
    )
