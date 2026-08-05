"""
ai_engine.graph.state
~~~~~~~~~~~~~~~~~~~~~~
LangGraph state definition for the RAG pipeline.

RAGState flows through four nodes:
    prepare_query → retrieve_context → generate_report → format_output

Each node reads from state and returns a dict of updated keys.
LangGraph merges those updates into the shared state automatically.
"""

from __future__ import annotations

from typing import Any, TypedDict


class RAGState(TypedDict, total=False):
    """
    Shared state object passed between all LangGraph nodes.

    Fields are populated progressively as the graph runs.
    `total=False` means all fields are optional at init — nodes
    add their own outputs without needing to pre-populate every key.
    """

    # Input: set by the caller before invoking the graph
    submission_id: str
    repo_url: str
    analysis_payload: dict[str, Any]   # The full AnalysisPayload dict

    # prepare_query → retrieve_context
    retrieval_query: str               # Natural-language query for Qdrant
    query_vector: list[float]          # Embedded retrieval_query

    # retrieve_context → generate_report
    retrieved_chunks: list[dict]       # Top-k chunks from Qdrant

    # generate_report → format_output
    raw_llm_response: str              # Raw JSON string from the LLM

    # format_output → END
    report: dict[str, Any]            # Validated ReportSchema dict
    report_json: str                   # Serialised JSON ready for backend POST

    # Error propagation — any node can set this to short-circuit the graph
    error: str | None
