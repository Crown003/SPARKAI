"""
ai_engine.graph.rag_graph
~~~~~~~~~~~~~~~~~~~~~~~~~~
Compiles the LangGraph StateGraph for the RAG pipeline.

Graph topology (linear — no branching needed for v1):

    START
      │
      ▼
  prepare_query          Embed retrieval query via Ollama / Gemini
      │
      ▼
  retrieve_context       Nearest-neighbour search in Qdrant
      │
      ▼
  generate_report        Call local Ollama LLM, get raw JSON
      │
      ▼
  format_output          Validate JSON → ReportSchema (or fallback)
      │
      ▼
    END

Usage:
    from ai_engine.graph.rag_graph import rag_graph

    result = rag_graph.invoke({
        "submission_id": "abc-123",
        "repo_url": "https://github.com/user/repo",
        "analysis_payload": {...},   # AnalysisPayload dict
    })

    report_json = result["report_json"]
"""

from langgraph.graph import END, START, StateGraph

from ai_engine.graph.nodes import (
    format_output,
    generate_report,
    prepare_query,
    retrieve_context,
)
from ai_engine.graph.state import RAGState

# ------------------------------------------------------------------ #
# Build the graph
# ------------------------------------------------------------------ #

_builder = StateGraph(RAGState)

# Register nodes
_builder.add_node("prepare_query", prepare_query)
_builder.add_node("retrieve_context", retrieve_context)
_builder.add_node("generate_report", generate_report)
_builder.add_node("format_output", format_output)

# Wire edges (linear chain)
_builder.add_edge(START, "prepare_query")
_builder.add_edge("prepare_query", "retrieve_context")
_builder.add_edge("retrieve_context", "generate_report")
_builder.add_edge("generate_report", "format_output")
_builder.add_edge("format_output", END)

# ------------------------------------------------------------------ #
# Compile — this is the object imported by the Celery task
# ------------------------------------------------------------------ #

rag_graph = _builder.compile()
