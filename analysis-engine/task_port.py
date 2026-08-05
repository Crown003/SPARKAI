
from analysis_engine.celery_app import app
app.send_task(
    "analysis_engine.tasks.pipeline.run_analysis_pipeline",
    kwargs={"repo_url": "https://github.com/Harsh-Choudhary-21/portfolio-website", "submission_id": "test-001"},
    queue="analysis_tasks",
)