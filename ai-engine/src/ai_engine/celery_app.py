"""
ai_engine.celery_app
~~~~~~~~~~~~~~~~~~~~
Celery application instance for the AI Engine.

Start the worker with:
    uv run celery -A ai_engine.celery_app worker \
        --loglevel=info -Q ai_tasks -c 2
"""

from celery import Celery

from ai_engine.config import settings

app = Celery(
    "ai_engine",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "ai_engine.tasks.process_analysis",
    ]
)

app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Timezone
    timezone="UTC",
    enable_utc=True,
    # Reliability — LLM calls are expensive; ack only after success
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Retry defaults (overridden per-task where needed)
    task_max_retries=3,
    task_default_retry_delay=30,  # seconds — give OpenAI rate limits time to clear
    # Routing — all tasks go to ai_tasks queue by default
    task_default_queue=settings.AI_CELERY_QUEUE,
    task_queues={
        settings.AI_CELERY_QUEUE: {
            "exchange": settings.AI_CELERY_QUEUE,
            "routing_key": settings.AI_CELERY_QUEUE,
        }
    },
)

