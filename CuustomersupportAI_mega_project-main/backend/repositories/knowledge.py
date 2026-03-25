"""Repository for knowledge base persistence via Supabase."""

from __future__ import annotations

from supabase import Client

DOCS_TABLE = "knowledge_documents"
CHUNKS_TABLE = "knowledge_chunks"


class KnowledgeRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    # --- Documents ---

    async def list_documents(
        self,
        tenant_id: str,
        *,
        status: str | None = None,
        source_type: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        try:
            query = (
                self.client.table(DOCS_TABLE)
                .select("*", count="exact")
                .eq("tenant_id", tenant_id)
                .is_("deleted_at", "null")
            )
            if status:
                query = query.eq("status", status)
            if source_type:
                query = query.eq("source_type", source_type)
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            result = query.execute()
            return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
        except Exception:
            return {"data": [], "total": 0}

    async def get_document(self, tenant_id: str, document_id: str) -> dict | None:
        try:
            result = (
                self.client.table(DOCS_TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("id", document_id)
                .is_("deleted_at", "null")
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None

    async def create_document(self, data: dict) -> dict:
        result = self.client.table(DOCS_TABLE).insert(data).execute()
        if not result or not result.data:
            raise RuntimeError(f"Failed to insert into {DOCS_TABLE}: {result}")
        return result.data[0]

    async def update_document(self, tenant_id: str, document_id: str, data: dict) -> dict | None:
        try:
            result = (
                self.client.table(DOCS_TABLE)
                .update(data)
                .eq("tenant_id", tenant_id)
                .eq("id", document_id)
                .execute()
            )
            return result.data[0] if result and result.data else None
        except Exception:
            return None

    async def delete_document(self, tenant_id: str, document_id: str) -> None:
        from datetime import UTC, datetime

        try:
            self.client.table(DOCS_TABLE).update(
                {"deleted_at": datetime.now(UTC).isoformat()}
            ).eq("tenant_id", tenant_id).eq("id", document_id).execute()
        except Exception:
            pass

    # --- Chunks ---

    async def create_chunks(self, chunks: list[dict]) -> list[dict]:
        if not chunks:
            return []
        try:
            result = self.client.table(CHUNKS_TABLE).insert(chunks).execute()
            return result.data if result and result.data else []
        except Exception:
            return []

    async def delete_chunks_by_document(self, document_id: str) -> None:
        try:
            self.client.table(CHUNKS_TABLE).delete().eq("document_id", document_id).execute()
        except Exception:
            pass

    async def search_chunks(
        self,
        tenant_id: str,
        embedding: list[float],
        *,
        top_k: int = 5,
        score_threshold: float = 0.72,
    ) -> list[dict]:
        try:
            result = self.client.rpc(
                "match_knowledge_chunks",
                {
                    "p_tenant_id": tenant_id,
                    "p_query_embedding": embedding,
                    "p_match_count": top_k,
                    "p_match_threshold": score_threshold,
                },
            ).execute()
            return result.data or [] if result else []
        except Exception:
            return []
