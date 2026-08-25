"""
analysis_engine.schemas.analysis_payload
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Pydantic models that define the contract between the analysis-engine
and the ai-engine. The analysis-engine serialises an AnalysisPayload
to JSON and dispatches it to the ai_tasks Redis queue; the ai-engine
deserialises it on the other side.

Keep this schema stable — it is the public API between the two engines.
Any breaking change here requires coordinated updates in both codebases.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

# ------------------------------------------------------------------ #
# Complexity sub-schema (from radon cc / mi / raw)
# ------------------------------------------------------------------ #


class FileComplexity(BaseModel):
    """Per-file cyclomatic complexity summary."""

    file_path: str
    average_complexity: float
    max_complexity: float
    # Radon rank: A (≤5) through F (>25)
    rank: str


class ComplexityMetrics(BaseModel):
    """Aggregated complexity across the entire repository."""

    per_file: list[FileComplexity] = Field(default_factory=list)
    overall_average: float = 0.0
    overall_max: float = 0.0
    # Percentage of functions/methods with complexity > 10
    high_complexity_ratio: float = 0.0


# ------------------------------------------------------------------ #
# Maintainability sub-schema (from radon mi)
# ------------------------------------------------------------------ #


class FileMaintainability(BaseModel):
    """Per-file maintainability index."""

    file_path: str
    # MI score 0–100; higher is better
    mi_score: float
    # Radon grade: A (>20), B (10–20), C (<10)
    rank: str


class MaintainabilityMetrics(BaseModel):
    per_file: list[FileMaintainability] = Field(default_factory=list)
    overall_average: float = 0.0
    # Percentage of files graded C (poor maintainability)
    low_maintainability_ratio: float = 0.0


# ------------------------------------------------------------------ #
# Security sub-schema (from bandit)
# ------------------------------------------------------------------ #


class SecurityIssue(BaseModel):
    """A single Bandit SAST finding."""

    filename: str
    line_number: int
    test_id: str
    test_name: str
    issue_text: str
    severity: str   # LOW | MEDIUM | HIGH
    confidence: str  # LOW | MEDIUM | HIGH


class SecurityMetrics(BaseModel):
    issues: list[SecurityIssue] = Field(default_factory=list)
    total_issues: int = 0
    high_severity_count: int = 0
    medium_severity_count: int = 0
    low_severity_count: int = 0


# ------------------------------------------------------------------ #
# Raw code metrics sub-schema (from radon raw)
# ------------------------------------------------------------------ #


class RawMetrics(BaseModel):
    total_loc: int = 0          # Lines of code (including blank/comments)
    total_sloc: int = 0         # Source lines of code
    total_comments: int = 0
    total_blank: int = 0
    comment_ratio: float = 0.0  # comments / loc
    total_files_analyzed: int = 0
    python_files_count: int = 0


# ------------------------------------------------------------------ #
# Top-level payload — this is what crosses the queue boundary
# ------------------------------------------------------------------ #


class AnalysisPayload(BaseModel):
    """
    The complete output of the analysis-engine for a single repository.
    This is serialised to JSON and published to the ai_tasks queue.
    """

    # Correlates with the submission record in the backend DB
    submission_id: str
    repo_url: str
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)

    complexity: ComplexityMetrics = Field(default_factory=ComplexityMetrics)
    maintainability: MaintainabilityMetrics = Field(default_factory=MaintainabilityMetrics)
    security: SecurityMetrics = Field(default_factory=SecurityMetrics)
    raw_metrics: RawMetrics = Field(default_factory=RawMetrics)

    # Source code contents mapped by relative file path (for semantic chunking)
    source_files: dict[str, str] = Field(default_factory=dict)

    # Any additional metadata the analysis tasks want to attach
    extra: dict[str, Any] = Field(default_factory=dict)
