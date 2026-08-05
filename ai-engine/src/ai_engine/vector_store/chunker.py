"""
ai_engine.vector_store.chunker
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Converts an AnalysisPayload into a list of EmbeddingChunks.

Chunking strategy:
  We produce ONE chunk per metric category:
    1. complexity_summary   — overall complexity numbers + worst files
    2. security_summary     — all security issues, grouped by severity
    3. maintainability_summary — MI scores + low-maintainability files
    4. raw_metrics_summary  — LOC, SLOC, comment ratio

Each chunk is a self-contained plain-text description that a language model
can understand without extra context. This keeps retrieval meaningful at the
category level while staying well within embedding token limits.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class EmbeddingChunk:
    """A single text chunk ready for embedding and storage in Qdrant."""

    # Globally unique identifier for this chunk
    chunk_id: str
    # The text that will be embedded
    text: str
    # Metadata stored alongside the vector in Qdrant (used for filtering/display)
    metadata: dict = field(default_factory=dict)


class AnalysisChunker:
    """
    Converts an AnalysisPayload dict (already JSON-decoded) into EmbeddingChunks.

    Accepts a plain dict rather than the AnalysisPayload model so that the
    ai-engine doesn't need to import the analysis-engine package.
    """

    def chunk(self, payload: dict) -> list[EmbeddingChunk]:
        """
        Produce a list of EmbeddingChunk objects from a payload dict.

        Args:
            payload: The decoded AnalysisPayload dict.

        Returns:
            List of EmbeddingChunk, one per metric category.
        """
        submission_id = payload.get("submission_id", "unknown")
        repo_url = payload.get("repo_url", "unknown")

        chunks = [
            self._complexity_chunk(payload, submission_id, repo_url),
            self._security_chunk(payload, submission_id, repo_url),
            self._maintainability_chunk(payload, submission_id, repo_url),
            self._raw_metrics_chunk(payload, submission_id, repo_url),
        ]
        return chunks

    # ---------------------------------------------------------------- #
    # Private chunk builders
    # ---------------------------------------------------------------- #

    def _complexity_chunk(
        self, payload: dict, submission_id: str, repo_url: str
    ) -> EmbeddingChunk:
        c = payload.get("complexity", {})
        avg = c.get("overall_average", 0)
        max_c = c.get("overall_max", 0)
        high_ratio = c.get("high_complexity_ratio", 0)
        per_file = c.get("per_file", [])

        worst_files = sorted(
            per_file, key=lambda f: f.get("max_complexity", 0), reverse=True
        )[:5]

        worst_text = "\n".join(
            f"  - {f['file_path']}: avg={f['average_complexity']}, "
            f"max={f['max_complexity']}, rank={f['rank']}"
            for f in worst_files
        ) or "  No Python files found."

        text = (
            f"Repository: {repo_url}\n"
            f"Cyclomatic Complexity Analysis:\n"
            f"  Overall average complexity: {avg:.1f}\n"
            f"  Overall maximum complexity: {max_c:.1f}\n"
            f"  Ratio of high-complexity functions (>10): {high_ratio:.1%}\n"
            f"  Most complex files:\n{worst_text}"
        )

        return EmbeddingChunk(
            chunk_id=f"{submission_id}::complexity",
            text=text,
            metadata={
                "submission_id": submission_id,
                "repo_url": repo_url,
                "category": "complexity",
                "overall_average": avg,
                "overall_max": max_c,
                "high_complexity_ratio": high_ratio,
            },
        )

    def _security_chunk(
        self, payload: dict, submission_id: str, repo_url: str
    ) -> EmbeddingChunk:
        s = payload.get("security", {})
        issues = s.get("issues", [])
        total = s.get("total_issues", 0)
        high = s.get("high_severity_count", 0)
        medium = s.get("medium_severity_count", 0)
        low = s.get("low_severity_count", 0)

        # Include up to 10 issues in the text to keep chunk size reasonable
        sample_issues = issues[:10]
        issues_text = "\n".join(
            f"  - [{i['severity']}/{i['confidence']}] {i['test_name']}: "
            f"{i['issue_text']} ({i['filename']}:{i['line_number']})"
            for i in sample_issues
        ) or "  No security issues detected."

        text = (
            f"Repository: {repo_url}\n"
            f"Security Analysis (SAST via Bandit):\n"
            f"  Total issues: {total} (High: {high}, Medium: {medium}, Low: {low})\n"
            f"  Issues (sample):\n{issues_text}"
        )

        return EmbeddingChunk(
            chunk_id=f"{submission_id}::security",
            text=text,
            metadata={
                "submission_id": submission_id,
                "repo_url": repo_url,
                "category": "security",
                "total_issues": total,
                "high_severity_count": high,
                "medium_severity_count": medium,
                "low_severity_count": low,
            },
        )

    def _maintainability_chunk(
        self, payload: dict, submission_id: str, repo_url: str
    ) -> EmbeddingChunk:
        m = payload.get("maintainability", {})
        avg = m.get("overall_average", 0)
        low_ratio = m.get("low_maintainability_ratio", 0)
        per_file = m.get("per_file", [])

        worst_files = sorted(
            per_file, key=lambda f: f.get("mi_score", 100)
        )[:5]

        worst_text = "\n".join(
            f"  - {f['file_path']}: MI={f['mi_score']:.1f} (rank={f['rank']})"
            for f in worst_files
        ) or "  No Python files found."

        text = (
            f"Repository: {repo_url}\n"
            f"Maintainability Index Analysis (via Radon MI):\n"
            f"  Overall average MI score: {avg:.1f} / 100\n"
            f"  Ratio of poorly-maintained files (grade C): {low_ratio:.1%}\n"
            f"  Files with lowest maintainability:\n{worst_text}"
        )

        return EmbeddingChunk(
            chunk_id=f"{submission_id}::maintainability",
            text=text,
            metadata={
                "submission_id": submission_id,
                "repo_url": repo_url,
                "category": "maintainability",
                "overall_average": avg,
                "low_maintainability_ratio": low_ratio,
            },
        )

    def _raw_metrics_chunk(
        self, payload: dict, submission_id: str, repo_url: str
    ) -> EmbeddingChunk:
        r = payload.get("raw_metrics", {})
        loc = r.get("total_loc", 0)
        sloc = r.get("total_sloc", 0)
        comments = r.get("total_comments", 0)
        comment_ratio = r.get("comment_ratio", 0)
        files = r.get("total_files_analyzed", 0)

        text = (
            f"Repository: {repo_url}\n"
            f"Raw Code Metrics:\n"
            f"  Python files analysed: {files}\n"
            f"  Total lines of code (LOC): {loc}\n"
            f"  Source lines of code (SLOC): {sloc}\n"
            f"  Comment lines: {comments}\n"
            f"  Comment-to-code ratio: {comment_ratio:.1%}"
        )

        return EmbeddingChunk(
            chunk_id=f"{submission_id}::raw_metrics",
            text=text,
            metadata={
                "submission_id": submission_id,
                "repo_url": repo_url,
                "category": "raw_metrics",
                "total_loc": loc,
                "total_sloc": sloc,
                "comment_ratio": comment_ratio,
                "python_files": files,
            },
        )
