"""
analysis_engine.celery_app
~~~~~~~~~~~~~~~~~~~~~~~~~~
Celery application instance for the Analysis Engine.

Start the worker with:
    uv run celery -A analysis_engine.celery_app worker \
        --loglevel=info -Q analysis_tasks -c 4
"""

from celery import Celery

from analysis_engine.config import settings

app = Celery(
    "analysis_engine",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "analysis_engine.tasks.clone",
        "analysis_engine.tasks.analyse",
        "analysis_engine.tasks.publish",
        "analysis_engine.tasks.pipeline",
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
    # Reliability
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Retry defaults
    task_max_retries=3,
    task_default_retry_delay=10,  # seconds
    # Routing — all tasks go to the analysis_tasks queue by default
    task_default_queue=settings.ANALYSIS_CELERY_QUEUE,
    task_queues={
        settings.ANALYSIS_CELERY_QUEUE: {
            "exchange": settings.ANALYSIS_CELERY_QUEUE,
            "routing_key": settings.ANALYSIS_CELERY_QUEUE,
        }
    },
)

