# SPARK AI - Architecture & Agent Context

This file serves as a global context mapping for AI coding assistants and team members working on **SPARK AI** (Software Project Assessment Readiness Knowledge AI). It contains the core architectural decisions, folder structures, and tech stack choices made during Sprint 1 & 2. 

Always adhere to these standards when generating code for this repository.

## 1. Monorepo Structure
We use a unified monorepo structure. All services must be contained within their respective top-level directories:

- `/backend/` -> The core FastAPI application (Orchestrator).
- `/frontend/` -> (Planned) The web interface for students and educators.
- `/analysis-engine/` -> (Planned) Celery workers handling static analysis (AST, linters, cyclomatic complexity).
- `/ai-engine/` -> (Planned) Celery workers handling LLM-powered RAG, engineering graph reasoning, and vector search.
- `/infrastructure/docker/` -> Shared docker orchestration (`docker-compose.yml`) for local dev (Postgres, Redis, Qdrant).
- `/docs/` -> Project documentation.

> **CRITICAL RULE**: Do not create a separate `/worker/` directory. The AI engine and Analysis engine must manage their own dedicated Celery worker logic inside their respective directories.

## 2. Tech Stack & Conventions

### Backend (`/backend/`)
- **Framework**: FastAPI (Python 3.12+).
- **Package Manager**: `uv` (Fastest Python package installer and resolver).
- **Database**: PostgreSQL (managed via SQLAlchemy `asyncpg` async sessions). For testing, fallback is `sqlite+aiosqlite`.
- **Migrations**: Alembic (async configured).
- **Authentication**: JWT Access Tokens via OAuth2 (GitHub OAuth implemented). Passwords hashed via `passlib` & `bcrypt==3.2.2`.
- **Environment**: Managed via `pydantic-settings`. Always inject environment variables via `.env`.

### Environment Toggles
We use a flag-based environment system to easily switch between Local development and Cloud Production (`ENVIRONMENT=development` vs `ENVIRONMENT=production`). When in production, infrastructure will point to cloud-managed PostgreSQL and Redis.

## 3. Workflow for Agents
1. **Tool Usage**: Prefer specific environment commands (e.g. `uv run pytest` instead of standard `pytest`) to ensure the correct virtual environment is used without activation.
2. **Docker Orchestration**: The local infrastructure (`docker-compose.yml`) uses namespaced services (e.g., `spark_ai_dev_postgres`, `spark_ai_dev_redis`) so container lists remain legible.
3. **Database Changes**: Always update the `Base` metadata in `alembic/env.py` and run `uv run alembic revision --autogenerate -m "description"` followed by `uv run alembic upgrade head` when modifying SQLAlchemy domain models.

## 4. Current State (End of Sprint 2)
- ✅ Core database and asynchronous dependency injections are mapped (`app.core.database`).
- ✅ GitHub OAuth flow is implemented in `app.modules.auth`.
- ✅ User domain models are defined in `app.modules.users.models`.
- ✅ Local infrastructure is defined via Docker Compose (Postgres, Redis, Qdrant).
