"""
ai_engine.vector_store.qdrant_store
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Qdrant vector database client wrapper.

Responsibilities:
  - Ensure the target collection exists (create if not)
  - Upsert embedding chunks + metadata for a submission
  - Search for nearest neighbours given a query vector
  - Delete all vectors for a submission (cleanup hook)
"""

from __future__ import annotations

from loguru import logger
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from qdrant_client.http.exceptions import UnexpectedResponse

from ai_engine.config import settings
from ai_engine.vector_store.chunker import EmbeddingChunk


class QdrantStore:
    """
    Manages a single Qdrant collection used by the SPARK AI engine.

    The collection is named via settings.QDRANT_COLLECTION.
    Vector size is determined by the embedder passed at construction.
    """

    def __init__(self, vector_size: int) -> None:
        self._client = QdrantClient(url=settings.QDRANT_URL)
        self._collection = settings.QDRANT_COLLECTION
        self._vector_size = vector_size
        self._ensure_collection()

    # ---------------------------------------------------------------- #
    # Collection management
    # ---------------------------------------------------------------- #

    def _ensure_collection(self) -> None:
        """Create the collection if it doesn't exist."""
        try:
            self._client.get_collection(self._collection)
            logger.debug("Qdrant collection exists", collection=self._collection)
        except (UnexpectedResponse, Exception):
            logger.info(
                "Creating Qdrant collection",
                collection=self._collection,
                vector_size=self._vector_size,
            )
            self._client.create_collection(
                collection_name=self._collection,
                vectors_config=qdrant_models.VectorParams(
                    size=self._vector_size,
                    distance=qdrant_models.Distance.COSINE,
                ),
            )

    # ---------------------------------------------------------------- #
    # Write
    # ---------------------------------------------------------------- #

    def upsert_chunks(
        self,
        chunks: list[EmbeddingChunk],
        vectors: list[list[float]],
    ) -> None:
        """
        Upsert a list of chunks with their corresponding embedding vectors.

        Args:
            chunks:  EmbeddingChunk objects (text + metadata).
            vectors: Embedding vectors, same order as chunks.
        """
        if len(chunks) != len(vectors):
            raise ValueError(
                f"chunks ({len(chunks)}) and vectors ({len(vectors)}) must have the same length"
            )

        points = [
            qdrant_models.PointStruct(
                id=self._chunk_id_to_int(chunk.chunk_id),
                vector=vector,
                payload={
                    "chunk_id": chunk.chunk_id,
                    "text": chunk.text,
                    **chunk.metadata,
                },
            )
            for chunk, vector in zip(chunks, vectors)
        ]

        self._client.upsert(
            collection_name=self._collection,
            points=points,
            wait=True,  # Block until indexing is complete
        )

        logger.info(
            "Upserted vectors to Qdrant",
            collection=self._collection,
            count=len(points),
        )

    # ---------------------------------------------------------------- #
    # Read
    # ---------------------------------------------------------------- #

    def search(
        self,
        query_vector: list[float],
        top_k: int = 4,
        submission_id: str | None = None,
    ) -> list[dict]:
        """
        Find the top-k nearest chunks to the query vector.

        Args:
            query_vector:  The embedded query.
            top_k:         Number of results to return.
            submission_id: If provided, restrict results to this submission.

        Returns:
            List of payload dicts from matching points, ordered by score (desc).
        """
        query_filter = None
        if submission_id:
            query_filter = qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="submission_id",
                        match=qdrant_models.MatchValue(value=submission_id),
                    )
                ]
            )

        results = self._client.query_points(
            collection_name=self._collection,
            query=query_vector,
            limit=top_k,
            query_filter=query_filter,
            with_payload=True,
        )

        return [
            {"score": hit.score, **hit.payload}
            for hit in results.points
            if hit.payload
        ]

    # ---------------------------------------------------------------- #
    # Delete
    # ---------------------------------------------------------------- #

    def delete_by_submission(self, submission_id: str) -> None:
        """Remove all vectors associated with a given submission_id."""
        self._client.delete(
            collection_name=self._collection,
            points_selector=qdrant_models.FilterSelector(
                filter=qdrant_models.Filter(
                    must=[
                        qdrant_models.FieldCondition(
                            key="submission_id",
                            match=qdrant_models.MatchValue(value=submission_id),
                        )
                    ]
                )
            ),
        )
        logger.info(
            "Deleted vectors from Qdrant",
            submission_id=submission_id,
            collection=self._collection,
        )

    # ---------------------------------------------------------------- #
    # Internal helpers
    # ---------------------------------------------------------------- #

    @staticmethod
    def _chunk_id_to_int(chunk_id: str) -> int:
        """
        Convert a string chunk ID to a stable integer for Qdrant point IDs.
        Uses Python's built-in hash, masked to a positive 64-bit range.
        """
        return abs(hash(chunk_id)) % (2**63)
