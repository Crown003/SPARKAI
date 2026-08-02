# Analysis Engine Context & Rules

This file serves as the specific context for the `analysis-engine` module in the SPARK AI project.
As an AI agent operating in this folder, you must adhere strictly to these rules.

## 1. Tech Stack
- **Language:** Python 3.12+.
- **Task Queue:** Celery (listening to Redis).
- **Core Tooling:** Docker SDK (for managing ephemeral sandboxes), AST libraries, open-source static analyzers (e.g., Semgrep, Bandit, Radon).

## 2. Core Responsibilities
- This engine is responsible for securely cloning user repositories into isolated Docker containers (sandboxing).
- It executes deterministic static analysis (SAST, SCA, cyclomatic complexity) and extracts raw metrics.
- It normalizes these metrics and passes them to the `ai-engine` via the Redis message broker.

## 3. Strict Execution Rules
- **NO HTTP ENDPOINTS:** Do not create FastAPI or Flask servers here. This module must ONLY execute tasks via Celery.
- **Security First:** Never run arbitrary user code on the host machine. All analysis requiring execution must happen inside an ephemeral Docker container.
- **Dependency Management:** Use `uv` for managing `pyproject.toml` dependencies.
