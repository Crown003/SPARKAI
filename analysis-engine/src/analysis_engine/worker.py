"""
analysis_engine.worker
~~~~~~~~~~~~~~~~~~~~~~
CLI entry point for the Analysis Engine Celery worker.

Usage (from the analysis-engine/ directory):
    uv run celery -A analysis_engine.celery_app worker \
        --loglevel=info \
        -Q analysis_tasks \
        -c 4 \
        --hostname=analysis@%h

The -c flag sets the concurrency level (number of worker processes).
4 is a safe default; tune based on available CPU cores.
"""

# This module exists purely as documentation / CLI reference.
# The actual Celery worker is launched via `celery_app.py`.
# Import the app so `celery -A analysis_engine.worker` also works.
from analysis_engine.celery_app import app  # noqa: F401
