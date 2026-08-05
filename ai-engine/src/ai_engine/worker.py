"""
ai_engine.worker
~~~~~~~~~~~~~~~~
CLI entry point for the AI Engine Celery worker.

Usage (from the ai-engine/ directory):
    uv run celery -A ai_engine.celery_app worker \
        --loglevel=info \
        -Q ai_tasks \
        -c 2 \
        --hostname=ai@%h

Keep concurrency low (-c 2) because each task makes expensive LLM API calls.
"""

# Import the app so `celery -A ai_engine.worker` also works as an alias.
from ai_engine.celery_app import app  # noqa: F401
