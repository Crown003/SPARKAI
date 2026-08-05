"""
ai_engine.graph.nodes
~~~~~~~~~~~~~~~~~~~~~~
LangGraph node functions for the RAG pipeline.

Each node is a plain Python function:
    (state: RAGState) -> dict   (partial state update)

Nodes run sequentially:
    prepare_query → retrieve_context → generate_report → format_output

LLM: Local Ollama via ChatOllama (langchain-ollama)
     Model configured via OLLAMA_CHAT_MODEL (default: qwen2.5:7b)
"""

from __future__ import annotations

import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from loguru import logger

from ai_engine.config import settings
from ai_engine.embeddings.embedder import get_embedder
from ai_engine.graph.report_schema import FALLBACK_REPORT, ReportSchema
from ai_engine.graph.state import RAGState
from ai_engine.vector_store.qdrant_store import QdrantStore


# ------------------------------------------------------------------ #
# Shared singletons — initialised once per worker process
# ------------------------------------------------------------------ #

_embedder = None
_qdrant: QdrantStore | None = None
_llm: ChatOllama | None = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = get_embedder()
    return _embedder


def _get_qdrant() -> QdrantStore:
    global _qdrant
    if _qdrant is None:
        from ai_engine.embeddings.embedder import VECTOR_SIZE
        _qdrant = QdrantStore(vector_size=VECTOR_SIZE)
    return _qdrant


def _get_llm() -> ChatOllama:
    global _llm
    if _llm is None:
        _llm = ChatOllama(
            model=settings.OLLAMA_CHAT_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            # Request JSON output directly — Ollama supports this natively
            format="json",
            # Temperature 0 for deterministic, structured reports
            temperature=0,
        )
        logger.info(
            "ChatOllama initialised",
            model=settings.OLLAMA_CHAT_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )
    return _llm


# ------------------------------------------------------------------ #
# Node 1: prepare_query
# ------------------------------------------------------------------ #

_QUERY_TEMPLATE = (
    "Analyse the engineering readiness of the repository: {repo_url}. "
    "Evaluate cyclomatic complexity, security vulnerabilities, "
    "maintainability index, and code volume metrics."
)


def prepare_query(state: RAGState) -> dict:
    """
    Convert the analysis payload into a natural-language retrieval query
    and embed it for Qdrant nearest-neighbour search.
    """
    repo_url = state.get("repo_url", "unknown repository")
    query = _QUERY_TEMPLATE.format(repo_url=repo_url)

    logger.debug("Embedding retrieval query", submission_id=state.get("submission_id"))
    query_vector = _get_embedder().embed_text(query)

    return {
        "retrieval_query": query,
        "query_vector": query_vector,
    }


# ------------------------------------------------------------------ #
# Node 2: retrieve_context
# ------------------------------------------------------------------ #


def retrieve_context(state: RAGState) -> dict:
    """
    Query Qdrant for the top-k most relevant chunks for this submission.

    We filter by submission_id so we only retrieve chunks from the
    current analysis run, not from other repos in the collection.
    """
    submission_id = state.get("submission_id", "")
    query_vector = state.get("query_vector", [])

    if not query_vector:
        logger.warning("No query vector — skipping retrieval", submission_id=submission_id)
        return {"retrieved_chunks": []}

    chunks = _get_qdrant().search(
        query_vector=query_vector,
        top_k=4,  # We have 4 chunks per submission, so top_k=4 retrieves all of them
        submission_id=submission_id,
    )

    logger.info(
        "Retrieved chunks from Qdrant",
        submission_id=submission_id,
        count=len(chunks),
    )

    return {"retrieved_chunks": chunks}


# ------------------------------------------------------------------ #
# Node 3: generate_report
# ------------------------------------------------------------------ #

_SYSTEM_PROMPT = """You are an expert software engineering assessor.
You analyse static code metrics and produce a structured Engineering Readiness Report.
You must respond with valid JSON only — no markdown, no explanation, just the JSON object.
The JSON must conform exactly to the schema provided."""

_REPORT_JSON_SCHEMA = json.dumps(
    {
        "overall_score": "float (0-100)",
        "readiness_level": "one of: Not Ready | Needs Work | Good | Excellent",
        "summary": "2-3 sentence executive summary",
        "strengths": ["list of positive aspects"],
        "critical_issues": ["list of critical problems to fix"],
        "recommendations": [
            {
                "priority": "HIGH | MEDIUM | LOW",
                "area": "e.g. Security, Code Quality, Documentation",
                "title": "short title",
                "description": "actionable description",
            }
        ],
        "metrics_breakdown": {
            "complexity_score": "float 0-100 (100=simplest)",
            "maintainability_score": "float 0-100 (100=most maintainable)",
            "security_score": "float 0-100 (100=no issues)",
            "documentation_score": "float 0-100 (100=well documented)",
        },
    },
    indent=2,
)


def _build_user_prompt(state: RAGState) -> str:
    """Build the user-facing prompt from retrieved chunks + full payload summary."""
    chunks = state.get("retrieved_chunks", [])
    payload = state.get("analysis_payload", {})
    submission_id = state.get("submission_id", "")

    # Assemble context from retrieved chunks
    context_parts: list[str] = []
    for chunk in chunks:
        category = chunk.get("category", "unknown")
        text = chunk.get("text", "")
        score = chunk.get("score", 0)
        context_parts.append(f"[{category.upper()} — relevance: {score:.2f}]\n{text}")

    context = "\n\n".join(context_parts) if context_parts else "No analysis data available."

    # Quick summary stats for the LLM to anchor its scoring
    raw = payload.get("raw_metrics", {})
    security = payload.get("security", {})

    stats_summary = (
        f"Total LOC: {raw.get('total_loc', 0)} | "
        f"Python files: {raw.get('python_files_count', 0)} | "
        f"Security issues: {security.get('total_issues', 0)} "
        f"(HIGH: {security.get('high_severity_count', 0)})"
    )

    return (
        f"Submission ID: {submission_id}\n\n"
        f"=== ANALYSIS CONTEXT ===\n{context}\n\n"
        f"=== QUICK STATS ===\n{stats_summary}\n\n"
        f"=== REQUIRED JSON SCHEMA ===\n{_REPORT_JSON_SCHEMA}\n\n"
        "Now generate the Engineering Readiness Report as valid JSON:"
    )


def generate_report(state: RAGState) -> dict:
    """
    Call the local Ollama LLM with the retrieved context and produce
    a raw JSON report string.
    """
    submission_id = state.get("submission_id", "")
    logger.info("Calling Ollama LLM for report generation", submission_id=submission_id)

    messages = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=_build_user_prompt(state)),
    ]

    try:
        response = _get_llm().invoke(messages)
        raw_text: str = response.content if hasattr(response, "content") else str(response)
        logger.debug(
            "LLM response received",
            submission_id=submission_id,
            length=len(raw_text),
        )
        return {"raw_llm_response": raw_text}
    except Exception as exc:
        logger.error("LLM call failed", submission_id=submission_id, error=str(exc))
        return {"raw_llm_response": "", "error": str(exc)}


# ------------------------------------------------------------------ #
# Node 4: format_output
# ------------------------------------------------------------------ #


def format_output(state: RAGState) -> dict:
    """
    Parse and validate the raw LLM response against ReportSchema.
    Falls back to FALLBACK_REPORT if parsing fails.
    """
    submission_id = state.get("submission_id", "")
    raw = state.get("raw_llm_response", "")

    if not raw or state.get("error"):
        logger.warning(
            "Using fallback report due to empty/errored LLM response",
            submission_id=submission_id,
        )
        report = FALLBACK_REPORT
    else:
        try:
            data = json.loads(raw)
            report = ReportSchema.model_validate(data)
            logger.info("Report validated successfully", submission_id=submission_id)
        except (json.JSONDecodeError, Exception) as exc:
            logger.error(
                "Report validation failed — using fallback",
                submission_id=submission_id,
                error=str(exc),
                raw_snippet=raw[:200],
            )
            report = FALLBACK_REPORT

    report_dict = report.model_dump()
    report_json = report.model_dump_json()

    return {
        "report": report_dict,
        "report_json": report_json,
        "error": state.get("error"),  # preserve any upstream error
    }
