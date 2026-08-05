"""
analysis_engine.tasks.publish
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Serialises the completed AnalysisPayload and dispatches it to the
ai-engine's Celery queue (ai_tasks) via the shared Redis broker.

After publishing, the temporary clone directory is cleaned up.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from celery import Celery
from loguru import logger

from analysis_engine.config import settings
from analysis_engine.schemas.analysis_payload import AnalysisPayload


def publish_to_ai_engine(
    payload: AnalysisPayload,
    clone_dir: Path | None = None,
) -> str:
    """
    Serialise *payload* and send it as a Celery task to the ai_tasks queue.

    The ai-engine worker is a completely separate process (possibly on a
    different host). We connect to it only through the shared Redis broker,
    never via direct import.

    Args:
        payload:   The completed analysis payload.
        clone_dir: If provided, this directory is deleted after publishing.

    Returns:
        The Celery task ID of the dispatched ai-engine task.
    """
    # Create a minimal Celery "sender" app — we only need the producer side.
    # We do NOT import the ai_engine package here to keep engines fully decoupled.
    sender = Celery(
        "analysis_engine_publisher",
        broker=settings.REDIS_URL,
    )

    payload_json = payload.model_dump_json()

    # Send the task to the ai_tasks queue.
    # The task name must match the @app.task(name=...) declaration in ai_engine.
    result = sender.send_task(
        name="ai_engine.tasks.process_analysis.process_analysis",
        args=[payload_json],
        queue=settings.AI_CELERY_QUEUE,
        serializer="json",
    )

    task_id: str = result.id

    logger.info(
        "Payload published to ai-engine",
        submission_id=payload.submission_id,
        ai_task_id=task_id,
        queue=settings.AI_CELERY_QUEUE,
    )

    # Cleanup clone directory
    if clone_dir and clone_dir.exists():
        shutil.rmtree(clone_dir, ignore_errors=True)
        logger.info("Clone directory cleaned up", path=str(clone_dir))

    return task_id
