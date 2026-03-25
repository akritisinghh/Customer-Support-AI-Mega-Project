"""Repository for conversation persistence via Supabase."""

from __future__ import annotations

from supabase import Client

TABLE = "conversations"


class ConversationRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    async def get_by_id(self, tenant_id: str, conversation_id: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("id", conversation_id)
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None

    async def list_by_tenant(
        self,
        tenant_id: str,
        *,
        status: str | None = None,
        channel: str | None = None,
        customer_id: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        try:
            query = self.client.table(TABLE).select("*", count="exact").eq("tenant_id", tenant_id)
            if status:
                query = query.eq("status", status)
            if channel:
                query = query.eq("channel", channel)
            if customer_id:
                query = query.eq("customer_id", customer_id)
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            result = query.execute()
            return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
        except Exception:
            return {"data": [], "total": 0}

    async def create(self, data: dict) -> dict:
        result = self.client.table(TABLE).insert(data).execute()
        if not result or not result.data:
            raise RuntimeError(f"Failed to insert into {TABLE}: {result}")
        return result.data[0]

    async def update(self, tenant_id: str, conversation_id: str, data: dict) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .update(data)
                .eq("tenant_id", tenant_id)
                .eq("id", conversation_id)
                .execute()
            )
            return result.data[0] if result and result.data else None
        except Exception:
            return None
