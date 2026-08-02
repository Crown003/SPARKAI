# SPARK AI - Team Onboarding & Task Distribution

Welcome to the **SPARK AI** project! We are building an Engineering Readiness Analyzer that transforms raw GitHub repositories into actionable, industry-standard metrics. 

This document outlines how we are dividing the work, how to set up your environment, and how to use our AI-assisted development tools to stay aligned with the architecture.

---

## 1. Task Distribution

We are splitting the workload into three specialized domains to move fast and independently.

### Backend & DevOps (Lead: Harsh / Current Focus)
- **Directory**: `/backend/`, `/infrastructure/`
- **Responsibilities**: 
  - Manage the FastAPI Orchestrator.
  - Setup and maintain the PostgreSQL and Redis infrastructure via Docker Compose.
  - Build the **Repository Import Service** (OAuth, rate-limiting, and pushing jobs to Celery).
  - Manage database migrations (Alembic) and authentication.

### Frontend Engineering (Team Member 1)
- **Directory**: `/frontend/`
- **Responsibilities**: 
  - Build the student-facing Next.js dashboard.
  - Design premium, modern UI components  (smooth animations).
  - Consume the backend APIs to display the Engineering Readiness Report (the 1-100 score, the charts, and the AI recommendations).
- **Starting Point**: Initialize the Next.js project inside `/frontend/` and establish the global CSS/Theming system.

### AI Engine & Analysis (Team Member 2)
- **Directory**: `/ai-engine/`, `/analysis-engine/`
- **Responsibilities**: 
  - Build the Celery worker scripts in Python to pull jobs from Redis.
  - **Analysis Engine**: Orchestrate the sandboxed static analysis (AST parsing, linters, cyclomatic complexity) and extract metrics.
  - **AI Engine**: Use LangGraph and Qdrant to process the metrics, generate the Engineering Knowledge Graph, and format the final LLM report.
- **Starting Point**: Set up a Python virtual environment in `/ai-engine/`, install Celery and `qdrant-client`, and create the first dummy worker that listens to the `spark_ai_dev_redis` queue.

---

## 2. Using AI Coding Assistants (CRITICAL)

We are heavily leveraging AI coding assistants (like Cursor, GitHub Copilot, or Gemini) to build this project. To ensure the AI doesn't hallucinate or break our monorepo architecture, we have implemented **Global Customization Rules**.

### The `AGENTS.md` File
At the root of our workspace, inside the `.agents/` folder, there is an `AGENTS.md` file. 
**This file is our single source of truth for AI context.**

When you ask your AI to "Build the Next.js dashboard" or "Create a Celery task", your AI assistant is configured to automatically read `.agents/AGENTS.md` first. It tells the AI:
- What tech stack we use for each folder.
- Our database rules (e.g., using `asyncpg`).
- Our Docker networking rules.

**Your Action Item:**
If you make a major architectural decision in your domain (e.g., "I decided to use Zustand instead of Redux for state management" or "I am using OpenAI for embeddings"), **update the `.agents/AGENTS.md` file immediately**. This ensures everyone's AI assistants stay in sync with the project's evolution.

---

## 3. Getting Started

### Prerequisites
1. Install Docker Desktop.
2. Install `uv` (our Python package manager).
3. Install Node.js (for frontend).

### Booting the Infrastructure
Before writing any code, boot the local infrastructure:
```bash
cd infrastructure/docker
docker-compose up -d
```
This starts PostgreSQL, Redis, and Qdrant in the background.

### Next Steps
- Pick your domain (Frontend, Backend, or AI-Engine).
- Navigate to your folder and begin initializing your specific stack according to the rules in `.agents/AGENTS.md`.
- Communicate any cross-domain API contracts (e.g., "What will the JSON look like when the backend sends the AI Report to the frontend?") in our team chat before implementing.

Happy building! Let's make something incredible.
