"""
ai_engine.tasks.process_analysis
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Root Celery task for the AI engine.

This task is dispatched by the analysis-engine after it finishes static
analysis and publishes the AnalysisPayload to the ai_tasks Redis queue.

Full pipeline executed within this task:
    1. Deserialise JSON → AnalysisPayload dict
    2. Chunk payload via AnalysisChunker (4 chunks)
    3. Embed chunks via configured embedder (Ollama or Gemini)
    4. Upsert vectors + metadata into Qdrant
    5. Invoke the LangGraph RAG graph to generate the report
    6. POST the final ReportSchema JSON to the backend API
    7. On error: log + retry (max 3 attempts, 30s delay)
"""

from __future__ import annotations

import json

import httpx
from celery import Task
from loguru import logger

from ai_engine.celery_app import app
from ai_engine.config import settings
from ai_engine.embeddings.embedder import get_embedder
from ai_engine.graph.rag_graph import rag_graph
from ai_engine.vector_store.chunker import AnalysisChunker
from ai_engine.vector_store.qdrant_store import QdrantStore


@app.task(
    name="ai_engine.tasks.process_analysis.process_analysis",
    bind=True,
    max_retries=3,
    default_retry_delay=30,  # seconds — also gives Ollama time to recover
    acks_late=True,
)
def process_analysis(self: Task, payload_json: str) -> dict:
    """
    Process a completed AnalysisPayload through the full RAG pipeline
    and persist the generated report to the backend.

    Args:
        payload_json: JSON string of the AnalysisPayload produced by
                      the analysis-engine.

    Returns:
        Dict with status, submission_id, and overall_score from the report.
    """
    # ---------------------------------------------------------------- #
    # Step 1: Deserialise
    # ---------------------------------------------------------------- #
    try:
        payload: dict = json.loads(payload_json)
    except json.JSONDecodeError as exc:
        # Malformed JSON from analysis-engine — do not retry, this won't fix itself
        logger.error("Invalid JSON payload — discarding task", error=str(exc))
        raise

    submission_id: str = payload.get("submission_id", "unknown")
    repo_url: str = payload.get("repo_url", "unknown")

    logger.info(
        "AI pipeline started",
        submission_id=submission_id,
        repo_url=repo_url,
        attempt=self.request.retries + 1,
    )

    try:
        # ---------------------------------------------------------------- #
        # Step 2: Chunk the payload
        # ---------------------------------------------------------------- #
        chunker = AnalysisChunker()
        chunks = chunker.chunk(payload)
        logger.debug("Payload chunked", submission_id=submission_id, chunks=len(chunks))

        # ---------------------------------------------------------------- #
        # Step 3: Embed chunks
        # ---------------------------------------------------------------- #
        embedder = get_embedder()
        texts = [chunk.text for chunk in chunks]
        vectors = embedder.embed_batch(texts)
        logger.debug("Chunks embedded", submission_id=submission_id, vectors=len(vectors))

        # ---------------------------------------------------------------- #
        # Step 4: Upsert into Qdrant
        # ---------------------------------------------------------------- #
        store = QdrantStore(vector_size=embedder.vector_size)
        store.upsert_chunks(chunks=chunks, vectors=vectors)
        logger.info("Vectors stored in Qdrant", submission_id=submission_id)

        # ---------------------------------------------------------------- #
        # Step 5: Run the LangGraph RAG pipeline
        # ---------------------------------------------------------------- #
        initial_state = {
            "submission_id": submission_id,
            "repo_url": repo_url,
            "analysis_payload": payload,
        }

        final_state = rag_graph.invoke(initial_state)
        report_json: str = final_state.get("report_json", "")
        report: dict = final_state.get("report", {})
        graph_error = final_state.get("error")

        if graph_error:
            logger.warning(
                "RAG graph completed with error — fallback report used",
                submission_id=submission_id,
                error=graph_error,
            )

        logger.info(
            "RAG graph completed",
            submission_id=submission_id,
            overall_score=report.get("overall_score"),
            readiness_level=report.get("readiness_level"),
        )

        # ---------------------------------------------------------------- #
        # Step 6: POST report to backend
        # ---------------------------------------------------------------- #
        _post_report_to_backend(submission_id=submission_id, report_json=report_json)

        return {
            "status": "completed",
            "submission_id": submission_id,
            "overall_score": report.get("overall_score", 0),
            "readiness_level": report.get("readiness_level", "Not Ready"),
        }

    except Exception as exc:
        logger.error(
            "AI pipeline error — retrying",
            submission_id=submission_id,
            error=str(exc),
            attempt=self.request.retries + 1,
        )
        raise self.retry(exc=exc)


# ------------------------------------------------------------------ #
# Helper: POST report to backend
# ------------------------------------------------------------------ #


def _post_report_to_backend(submission_id: str, report_json: str) -> None:
    """
    POST the generated report JSON to the backend REST API.

    Endpoint (expected): POST /api/v1/reports/{submission_id}
    Body: ReportSchema JSON

    If the backend is unavailable, we log the error but do NOT raise —
    the vectors are already stored in Qdrant so the report can be
    re-generated later if needed.
    """
    url = f"{settings.BACKEND_API_URL}/api/v1/reports/{submission_id}"

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url=url,
                content=report_json,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            logger.info(
                "Report successfully posted to backend",
                submission_id=submission_id,
                status_code=response.status_code,
            )
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Backend rejected the report",
            submission_id=submission_id,
            status_code=exc.response.status_code,
            response_body=exc.response.text[:500],
        )
    except httpx.RequestError as exc:
        logger.error(
            "Backend unreachable — report not persisted",
            submission_id=submission_id,
            error=str(exc),
        )
