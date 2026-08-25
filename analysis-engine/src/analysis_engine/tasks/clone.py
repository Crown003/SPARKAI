"""
analysis_engine.tasks.clone
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Clones a GitHub repository into a local temporary directory for analysis.

Security note:
  - This task performs a read-only, shallow clone.
  - No code is executed during cloning.
  - The caller (pipeline.py) is responsible for cleanup via publish.py.
  - Full Docker sandboxing is planned for a later sprint; for now,
    all cloning runs on the host in a dedicated temp directory.
"""

import shutil
from pathlib import Path

from git import GitCommandError, Repo
from loguru import logger

from analysis_engine.config import settings


class CloneError(Exception):
    """Raised when a repository cannot be cloned."""


def clone_repository(repo_url: str, submission_id: str) -> Path:
    """
    Clone *repo_url* into a subdirectory under TEMP_CLONE_DIR.

    Args:
        repo_url:      The HTTPS URL of the repository (e.g. https://github.com/user/repo).
        submission_id: Unique identifier for this submission — used as the directory name
                       to avoid collisions between concurrent tasks.

    Returns:
        Absolute Path to the cloned repository root.

    Raises:
        CloneError: If cloning fails for any reason.
    """
    base_dir = Path(settings.TEMP_CLONE_DIR)
    base_dir.mkdir(parents=True, exist_ok=True)

    target_dir = base_dir / submission_id

    # Remove any leftover directory from a previous failed attempt
    if target_dir.exists():
        logger.warning(
            "Clone target already exists — removing stale clone",
            submission_id=submission_id,
            path=str(target_dir),
        )
        shutil.rmtree(target_dir, ignore_errors=True)

    logger.info(
        "Cloning repository",
        submission_id=submission_id,
        repo_url=repo_url,
        target=str(target_dir),
    )

    try:
        Repo.clone_from(
            url=repo_url,
            to_path=str(target_dir),
            depth=1,          # shallow clone — we don't need git history
            single_branch=True,
        )
    except GitCommandError as exc:
        raise CloneError(
            f"Failed to clone {repo_url} for submission {submission_id}: {exc}"
        ) from exc

    logger.info(
        "Clone successful",
        submission_id=submission_id,
        path=str(target_dir),
    )
    return target_dir
