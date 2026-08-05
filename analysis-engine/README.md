# Analysis Engine

Static analysis Celery worker for SPARK AI. Clones a GitHub repository, runs deterministic static analysis (complexity, security, raw metrics), and publishes results to the `ai-engine` via Redis.

## Prerequisites

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/) package manager
- Redis running (see `/infrastructure/docker/docker-compose.yml`)
- `radon` and `bandit` installed (handled by `uv sync`)

## Setup

```bash
cd analysis-engine
cp .env.example .env
uv sync
```

## Start Worker

```bash
uv run celery -A analysis_engine.celery_app worker --loglevel=info -Q analysis_tasks --pool=solo --hostname=analysis@%h
```

## Dispatch a Test Task

```python
from analysis_engine.celery_app import app
app.send_task(
    "analysis_engine.tasks.pipeline.run_analysis_pipeline",
    kwargs={"repo_url": "https://github.com/user/repo", "submission_id": "test-001"},
    queue="analysis_tasks",
)
```

## Architecture

```
Redis (analysis_tasks queue)
    │
    ▼
pipeline.py          clone → analyse → publish
    ├── clone.py     gitpython shallow clone
    ├── analyse.py   radon cc/mi/raw + bandit SAST
    └── publish.py   send AnalysisPayload to ai_tasks queue
```

## Queue Contract

- **Listens on**: `analysis_tasks`
- **Publishes to**: `ai_tasks` (consumed by ai-engine)
- **Payload schema**: `src/analysis_engine/schemas/analysis_payload.py`
