"""
ai_engine.graph.report_schema
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Pydantic model for the structured JSON report that the LLM must produce.

The LLM is instructed to return valid JSON conforming to this schema.
We use Pydantic to validate the response — if validation fails, the
format_output node falls back to a safe default report.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class RecommendationItem(BaseModel):
    """A single actionable recommendation."""

    priority: str  # "HIGH" | "MEDIUM" | "LOW"
    area: str      # e.g. "Security", "Code Quality", "Documentation"
    title: str
    description: str


class MetricsBreakdown(BaseModel):
    """Normalised 0–100 scores for each metric dimension."""

    complexity_score: float = Field(ge=0, le=100)
    maintainability_score: float = Field(ge=0, le=100)
    security_score: float = Field(ge=0, le=100)
    documentation_score: float = Field(ge=0, le=100)


class ReportSchema(BaseModel):
    """
    The final Engineering Readiness Report produced by the LLM.

    This is what the ai-engine POSTs to the backend after generation.
    Keep this schema in sync with the backend's report endpoint.
    """

    # Top-level verdict
    overall_score: float = Field(ge=0, le=100, description="Composite readiness score 0–100")
    readiness_level: str = Field(
        description="One of: Not Ready | Needs Work | Good | Excellent"
    )

    # Narrative
    summary: str = Field(
        description="2–3 sentence executive summary of the project's engineering readiness"
    )
    strengths: list[str] = Field(
        default_factory=list,
        description="Positive aspects of the codebase",
    )
    critical_issues: list[str] = Field(
        default_factory=list,
        description="Issues that must be addressed before production readiness",
    )
    recommendations: list[RecommendationItem] = Field(
        default_factory=list,
        description="Prioritised, actionable recommendations",
    )

    # Per-dimension scores
    metrics_breakdown: MetricsBreakdown

    @field_validator("readiness_level")
    @classmethod
    def validate_readiness_level(cls, v: str) -> str:
        allowed = {"Not Ready", "Needs Work", "Good", "Excellent"}
        if v not in allowed:
            raise ValueError(f"readiness_level must be one of {allowed}, got '{v}'")
        return v

    @field_validator("overall_score")
    @classmethod
    def round_score(cls, v: float) -> float:
        return round(v, 1)


# ------------------------------------------------------------------ #
# Fallback report used when LLM response cannot be parsed
# ------------------------------------------------------------------ #

FALLBACK_REPORT = ReportSchema(
    overall_score=0.0,
    readiness_level="Not Ready",
    summary=(
        "Report generation failed due to an internal error. "
        "The static analysis data was collected successfully but could not be processed by the AI. "
        "Please try again or contact support."
    ),
    strengths=[],
    critical_issues=["AI report generation failed — manual review required."],
    recommendations=[],
    metrics_breakdown=MetricsBreakdown(
        complexity_score=0.0,
        maintainability_score=0.0,
        security_score=0.0,
        documentation_score=0.0,
    ),
)
