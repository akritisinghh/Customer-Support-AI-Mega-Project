"""Knowledge base service — document management, ingestion, and vector search."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from backend.core.config import settings
from backend.core.exceptions import NotFoundError, ValidationError
from backend.core.logging import get_logger
from backend.repositories.knowledge import KnowledgeRepository

log = get_logger(__name__)


class KnowledgeService:
    def __init__(self, knowledge_repo: KnowledgeRepository) -> None:
        self.knowledge_repo = knowledge_repo

    async def list_documents(self, tenant_id: str, filters: dict | None = None) -> dict:
        filters = filters or {}
        result = await self.knowledge_repo.list_documents(
            tenant_id,
            status=filters.get("status"),
            source_type=filters.get("source_type"),
            offset=filters.get("offset", 0),
            limit=filters.get("limit", 20),
        )
        log.info("knowledge.list_documents", tenant_id=tenant_id, total=result["total"])
        return result

    async def get_document(self, tenant_id: str, document_id: str) -> dict:
        doc = await self.knowledge_repo.get_document(tenant_id, document_id)
        if not doc:
            raise NotFoundError("Document", document_id)
        return doc

    async def upload_document(
        self,
        tenant_id: str,
        title: str,
        source_type: str,
        file_content: bytes,
        *,
        filename: str = "",
    ) -> dict:
        if not file_content:
            raise ValidationError("File content is empty")

        doc = await self.knowledge_repo.create_document(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "title": title,
                "source_type": source_type,
                "source_ref": filename,
                "status": "pending",
                "version": 1,
                "metadata": {"original_filename": filename, "size_bytes": len(file_content)},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )
        log.info("knowledge.document_uploaded", tenant_id=tenant_id, document_id=doc["id"])

        # TODO: dispatch async ingestion job (parse → chunk → embed → store)
        # via Redis queue or SQS. For now, mark as processing.
        await self.knowledge_repo.update_document(
            tenant_id, doc["id"], {"status": "processing"}
        )

        return doc

    async def delete_document(self, tenant_id: str, document_id: str) -> None:
        doc = await self.knowledge_repo.get_document(tenant_id, document_id)
        if not doc:
            raise NotFoundError("Document", document_id)

        await self.knowledge_repo.delete_chunks_by_document(document_id)
        await self.knowledge_repo.delete_document(tenant_id, document_id)
        log.info("knowledge.document_deleted", tenant_id=tenant_id, document_id=document_id)

    async def ingest_url(self, tenant_id: str, url: str) -> dict:
        doc = await self.knowledge_repo.create_document(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "title": url,
                "source_type": "url",
                "source_ref": url,
                "status": "pending",
                "version": 1,
                "metadata": {"url": url},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )
        log.info("knowledge.url_ingestion_queued", tenant_id=tenant_id, document_id=doc["id"], url=url)

        # TODO: dispatch async scrape + ingest job
        await self.knowledge_repo.update_document(
            tenant_id, doc["id"], {"status": "processing"}
        )

        return doc

    async def search_knowledge(
        self,
        tenant_id: str,
        query: str,
        *,
        top_k: int | None = None,
    ) -> list[dict]:
        """Vector search is unavailable — Groq does not support embeddings.
        Configure an embedding provider (e.g. OpenAI, Sentence-Transformers)
        and update _embed() before using knowledge search in production.
        """
        log.warning(
            "knowledge.search_unavailable",
            tenant_id=tenant_id,
            query_len=len(query),
            reason="Groq does not support embeddings; search returns empty results",
        )
        return []

    # ---- Internal ----

    async def _embed(self, text: str) -> list[float]:
        """Stub: Groq does not support embeddings.
        Replace with OpenAI, Sentence-Transformers, or another embedding provider.
        """
        log.warning(
            "knowledge.embed_stub",
            text_len=len(text),
            reason="Groq does not support embeddings; returning empty vector",
        )
        return []
