"""Repository for message persistence via Supabase."""

from __future__ import annotations

from supabase import Client

TABLE = "messages"


class MessageRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    async def get_by_conversation(
        self,
        tenant_id: str,
        conversation_id: str,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> dict:
        try:
            result = (
                self.client.table(TABLE)
                .select("*", count="exact")
                .eq("tenant_id", tenant_id)
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=False)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
        except Exception:
            return {"data": [], "total": 0}

    async def create(self, data: dict) -> dict:
        result = self.client.table(TABLE).insert(data).execute()
        if not result or not result.data:
            raise RuntimeError(f"Failed to insert into {TABLE}: {result}")
        return result.data[0]

    async def get_by_id(self, tenant_id: str, message_id: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("id", message_id)
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None
