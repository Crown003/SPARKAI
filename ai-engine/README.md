# AI Engine

LLM RAG Celery worker for SPARK AI. Receives analysis payloads from the `analysis-engine`, embeds them into Qdrant, runs a LangGraph RAG pipeline against a local Ollama model, and POSTs the final Engineering Readiness Report to the backend.

## Prerequisites

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/) package manager
- Redis running (see `/infrastructure/docker/docker-compose.yml`)
- Qdrant running (see `/infrastructure/docker/docker-compose.yml`)
- [Ollama](https://ollama.com) installed and running

## Ollama Setup

```bash
# Install Ollama: https://ollama.com

# Pull the LLM (choose one)
ollama pull qwen2.5:7b      # recommended — good quality, ~4GB
ollama pull llama3.2:3b     # lighter — ~2GB, faster on low-end hardware

# Pull the embedding model
ollama pull nomic-embed-text  # 768-dim, fast, free
```

## Project Setup

```bash
cd ai-engine
cp .env.example .env
# Edit .env — set OLLAMA_CHAT_MODEL to your pulled model
uv sync
```

## Alternative: Google Gemini Embeddings (free tier)

If you want higher-quality embeddings without running a second local model:

1. Get a free API key (no credit card): https://aistudio.google.com/app/apikey
2. In `.env`, set:
   ```
   EMBED_PROVIDER=gemini
   GEMINI_API_KEY=your-key-here
   ```
Free quota: **1,500 requests/day** with `text-embedding-004` (same 768-dim as nomic-embed-text).

## Start Worker

```bash
uv run celery -A ai_engine.celery_app worker --loglevel=info -Q ai_tasks --pool=solo --hostname=ai@%h
```

> Keep concurrency at **-c 2** — Ollama inference is CPU/GPU bound and higher concurrency won't help.

## Architecture

```
Redis (ai_tasks queue)
    │
    ▼
process_analysis.py      root Celery task
    ├── chunker.py        AnalysisPayload → 4 text chunks
    ├── embedder.py       OllamaEmbedder / GeminiEmbedder
    ├── qdrant_store.py   upsert vectors → Qdrant
    └── rag_graph.py      LangGraph pipeline
            ├── prepare_query    embed retrieval query
            ├── retrieve_context nearest-neighbour search
            ├── generate_report  ChatOllama (local LLM)
            └── format_output    validate → ReportSchema
    │
    ▼
POST /api/v1/reports/{submission_id}  → Backend
```

## Queue Contract

- **Listens on**: `ai_tasks`
- **Input**: JSON string of `AnalysisPayload` (from analysis-engine)
- **Output**: POST to backend `/api/v1/reports/{submission_id}`
