"""
analysis_engine.tasks.analyse
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Runs static analysis on a locally cloned repository using:
  - radon  → cyclomatic complexity, maintainability index, raw metrics
  - bandit → SAST (security issues)

All analysis is pure read-only file inspection — no code is executed.
Results are aggregated into an AnalysisPayload Pydantic model.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from loguru import logger

from analysis_engine.schemas.analysis_payload import (
    AnalysisPayload,
    ComplexityMetrics,
    FileComplexity,
    FileMaintainability,
    MaintainabilityMetrics,
    RawMetrics,
    SecurityIssue,
    SecurityMetrics,
)

# ------------------------------------------------------------------ #
# Internal helpers
# ------------------------------------------------------------------ #


def _run(cmd: list[str], cwd: Path) -> str:
    """Run a subprocess and return stdout as a string. Raises on non-zero exit."""
    result = subprocess.run(
        cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=120,  # 2-minute hard cap per tool
    )
    if result.returncode not in (0, 1):
        # bandit exits with 1 when issues are found — that's normal
        raise RuntimeError(
            f"Command {' '.join(cmd)} failed (exit {result.returncode}):\n{result.stderr}"
        )
    return result.stdout


def _collect_python_files(repo_path: Path) -> list[Path]:
    """Return all .py files under repo_path, skipping hidden dirs and venvs."""
    skip_dirs = {".git", ".venv", "venv", "node_modules", "__pycache__", ".tox"}
    files = []
    for p in repo_path.rglob("*.py"):
        if not any(part in skip_dirs for part in p.parts):
            files.append(p)
    return files


def _collect_source_files(repo_path: Path, max_file_size: int = 1024 * 1024) -> dict[str, str]:
    """
    Read contents of all relevant python files.
    Skips files larger than max_file_size to prevent memory bloat.
    """
    files = _collect_python_files(repo_path)
    source_files = {}
    for p in files:
        if p.stat().st_size <= max_file_size:
            try:
                # Store relative to repo_path
                rel_path = p.relative_to(repo_path).as_posix()
                source_files[rel_path] = p.read_text(encoding="utf-8")
            except Exception as exc:
                logger.warning(f"Could not read source file {p}", error=str(exc))
    return source_files


# ------------------------------------------------------------------ #
# Per-analyser functions
# ------------------------------------------------------------------ #


def _analyse_complexity(repo_path: Path) -> ComplexityMetrics:
    """Run `radon cc` and parse the JSON output."""
    try:
        raw = _run(["radon", "cc", ".", "--json", "--min", "A"], cwd=repo_path)
        data: dict = json.loads(raw) if raw.strip() else {}
    except Exception as exc:
        logger.warning("Complexity analysis failed — using empty metrics", error=str(exc))
        return ComplexityMetrics()

    per_file: list[FileComplexity] = []
    all_scores: list[float] = []

    for file_path, functions in data.items():
        if not functions:
            continue
        scores = [fn.get("complexity", 0) for fn in functions]
        avg = sum(scores) / len(scores)
        max_c = max(scores)
        rank = functions[0].get("rank", "A") if functions else "A"
        per_file.append(
            FileComplexity(
                file_path=file_path,
                average_complexity=round(avg, 2),
                max_complexity=float(max_c),
                rank=rank,
            )
        )
        all_scores.extend(scores)

    if not all_scores:
        return ComplexityMetrics()

    overall_avg = sum(all_scores) / len(all_scores)
    high_ratio = sum(1 for s in all_scores if s > 10) / len(all_scores)

    return ComplexityMetrics(
        per_file=per_file,
        overall_average=round(overall_avg, 2),
        overall_max=float(max(all_scores)),
        high_complexity_ratio=round(high_ratio, 4),
    )


def _analyse_maintainability(repo_path: Path) -> MaintainabilityMetrics:
    """Run `radon mi` and parse the JSON output."""
    try:
        raw = _run(["radon", "mi", ".", "--json"], cwd=repo_path)
        data: dict = json.loads(raw) if raw.strip() else {}
    except Exception as exc:
        logger.warning("Maintainability analysis failed — using empty metrics", error=str(exc))
        return MaintainabilityMetrics()

    per_file: list[FileMaintainability] = []
    scores: list[float] = []

    for file_path, result in data.items():
        mi_score = result.get("mi", 0.0)
        rank = result.get("rank", "C")
        per_file.append(
            FileMaintainability(
                file_path=file_path,
                mi_score=round(float(mi_score), 2),
                rank=rank,
            )
        )
        scores.append(float(mi_score))

    if not scores:
        return MaintainabilityMetrics()

    overall_avg = sum(scores) / len(scores)
    low_ratio = sum(1 for f in per_file if f.rank == "C") / len(per_file)

    return MaintainabilityMetrics(
        per_file=per_file,
        overall_average=round(overall_avg, 2),
        low_maintainability_ratio=round(low_ratio, 4),
    )


def _analyse_security(repo_path: Path) -> SecurityMetrics:
    """Run `bandit -r` and parse the JSON output."""
    try:
        raw = _run(
            ["bandit", "-r", ".", "-f", "json", "-q"],
            cwd=repo_path,
        )
        data: dict = json.loads(raw) if raw.strip() else {}
    except Exception as exc:
        logger.warning("Security analysis failed — using empty metrics", error=str(exc))
        return SecurityMetrics()

    results = data.get("results", [])
    issues: list[SecurityIssue] = []

    for item in results:
        issues.append(
            SecurityIssue(
                filename=item.get("filename", ""),
                line_number=item.get("line_number", 0),
                test_id=item.get("test_id", ""),
                test_name=item.get("test_name", ""),
                issue_text=item.get("issue_text", ""),
                severity=item.get("issue_severity", "LOW"),
                confidence=item.get("issue_confidence", "LOW"),
            )
        )

    return SecurityMetrics(
        issues=issues,
        total_issues=len(issues),
        high_severity_count=sum(1 for i in issues if i.severity == "HIGH"),
        medium_severity_count=sum(1 for i in issues if i.severity == "MEDIUM"),
        low_severity_count=sum(1 for i in issues if i.severity == "LOW"),
    )


def _analyse_raw_metrics(repo_path: Path) -> RawMetrics:
    """Run `radon raw` and aggregate across all files."""
    try:
        raw = _run(["radon", "raw", ".", "--json"], cwd=repo_path)
        data: dict = json.loads(raw) if raw.strip() else {}
    except Exception as exc:
        logger.warning("Raw metrics analysis failed — using empty metrics", error=str(exc))
        return RawMetrics()

    total_loc = total_sloc = total_comments = total_blank = 0
    python_files = 0

    for _file, metrics in data.items():
        total_loc += metrics.get("loc", 0)
        total_sloc += metrics.get("sloc", 0)
        total_comments += metrics.get("comments", 0)
        total_blank += metrics.get("blank", 0)
        python_files += 1

    comment_ratio = (total_comments / total_loc) if total_loc > 0 else 0.0

    return RawMetrics(
        total_loc=total_loc,
        total_sloc=total_sloc,
        total_comments=total_comments,
        total_blank=total_blank,
        comment_ratio=round(comment_ratio, 4),
        total_files_analyzed=python_files,
        python_files_count=python_files,
    )


# ------------------------------------------------------------------ #
# Public entry-point
# ------------------------------------------------------------------ #


def run_static_analysis(repo_path: Path, submission_id: str, repo_url: str) -> AnalysisPayload:
    """
    Run all static analysers against *repo_path* and return a
    populated AnalysisPayload.

    Args:
        repo_path:     Local path to the cloned repository.
        submission_id: Submission ID — embedded in the payload for traceability.
        repo_url:      Original repo URL — embedded for reference.

    Returns:
        AnalysisPayload ready to be serialised and published.
    """
    logger.info("Starting static analysis", submission_id=submission_id, path=str(repo_path))

    complexity = _analyse_complexity(repo_path)
    maintainability = _analyse_maintainability(repo_path)
    security = _analyse_security(repo_path)
    raw = _analyse_raw_metrics(repo_path)
    source_files = _collect_source_files(repo_path)

    payload = AnalysisPayload(
        submission_id=submission_id,
        repo_url=repo_url,
        complexity=complexity,
        maintainability=maintainability,
        security=security,
        raw_metrics=raw,
        source_files=source_files,
    )

    logger.info(
        "Static analysis complete",
        submission_id=submission_id,
        total_loc=raw.total_loc,
        security_issues=security.total_issues,
        avg_complexity=complexity.overall_average,
    )

    return payload
