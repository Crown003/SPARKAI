import logging
import sys
from typing import Any

def setup_logging() -> None:
    """
    Setup standard application logging.
    In a production application, this might configure structured JSON logging
    (e.g., structlog) or send logs to an external aggregator.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Disable overly verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
