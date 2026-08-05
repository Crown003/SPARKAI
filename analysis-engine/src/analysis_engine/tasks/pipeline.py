"""
analysis_engine.tasks.pipeline
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Root Celery task dispatched by the backend when a user submits a repository.

Flow:
    1. Clone the repository (shallow, read-only)
    2. Run static analysis (radon + bandit)
    3. Publish the AnalysisPayload to the ai-engine queue
    4. Cleanup on success or failure

This is the ONLY task the backend needs to know about.
"""

from __future__ import annotations

from pathlib import Path

from celery import Task
from loguru import logger

from analysis_engine.celery_app import app
from analysis_engine.tasks.analyse import run_static_analysis
from analysis_engine.tasks.clone import CloneError, clone_repository
from analysis_engine.tasks.publish import publish_to_ai_engine


@app.task(
    name="analysis_engine.tasks.pipeline.run_analysis_pipeline",
    bind=True,
    max_retries=3,
    default_retry_delay=30,  # seconds
    acks_late=True,
)
def run_analysis_pipeline(self: Task, repo_url: str, submission_id: str) -> dict:
    """
    Orchestrates the full analysis pipeline for a single repository submission.

    Args:
        repo_url:      HTTPS URL of the repository to analyse.
        submission_id: Unique ID from the backend for this submission.

    Returns:
        A dict with status and the ai-engine task ID.
    """
    clone_dir: Path | None = None

    logger.info(
        "Pipeline started",
        submission_id=submission_id,
        repo_url=repo_url,
        attempt=self.request.retries + 1,
    )

    try:
        # Step 1: Clone
        clone_dir = clone_repository(repo_url=repo_url, submission_id=submission_id)

        # Step 2: Analyse
        payload = run_static_analysis(
            repo_path=clone_dir,
            submission_id=submission_id,
            repo_url=repo_url,
        )

        # Step 3: Publish to ai-engine (also cleans up clone_dir on success)
        ai_task_id = publish_to_ai_engine(payload=payload, clone_dir=clone_dir)
        clone_dir = None  # Already cleaned up inside publish_to_ai_engine

        logger.info(
            "Pipeline completed successfully",
            submission_id=submission_id,
            ai_task_id=ai_task_id,
        )

        return {
            "status": "published",
            "submission_id": submission_id,
            "ai_task_id": ai_task_id,
        }

    except CloneError as exc:
        logger.error("Clone failed — will not retry", submission_id=submission_id, error=str(exc))
        # Don't retry clone failures — the URL is either wrong or the repo is private.
        raise

    except Exception as exc:
        logger.error(
            "Pipeline error — retrying",
            submission_id=submission_id,
            error=str(exc),
            attempt=self.request.retries + 1,
        )
        # Clean up stale clone dir before retry
        if clone_dir and clone_dir.exists():
            import shutil
            shutil.rmtree(clone_dir, ignore_errors=True)

        raise self.retry(exc=exc)
