"""Repository for ticket persistence via Supabase."""

from __future__ import annotations

from supabase import Client

TABLE = "tickets"
TICKET_MESSAGES_TABLE = "ticket_messages"


class TicketRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    async def get_by_id(self, tenant_id: str, ticket_id: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("id", ticket_id)
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
        priority: str | None = None,
        assigned_agent_id: str | None = None,
        customer_id: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        try:
            query = self.client.table(TABLE).select("*", count="exact").eq("tenant_id", tenant_id)
            if status:
                query = query.eq("status", status)
            if priority:
                query = query.eq("priority", priority)
            if assigned_agent_id:
                query = query.eq("assigned_agent_id", assigned_agent_id)
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

    async def update(self, tenant_id: str, ticket_id: str, data: dict) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .update(data)
                .eq("tenant_id", tenant_id)
                .eq("id", ticket_id)
                .execute()
            )
            return result.data[0] if result and result.data else None
        except Exception:
            return None

    async def get_messages(
        self,
        tenant_id: str,
        ticket_id: str,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> dict:
        try:
            result = (
                self.client.table(TICKET_MESSAGES_TABLE)
                .select("message_id, messages(*)", count="exact")
                .eq("ticket_id", ticket_id)
                .order("created_at", desc=False)
                .range(offset, offset + limit - 1)
                .execute()
            )
            if not result or not result.data:
                return {"data": [], "total": 0}
            messages = [row["messages"] for row in result.data if row.get("messages")]
            return {"data": messages, "total": result.count or 0}
        except Exception:
            return {"data": [], "total": 0}

    async def add_message_link(self, ticket_id: str, message_id: str) -> dict:
        result = (
            self.client.table(TICKET_MESSAGES_TABLE)
            .insert({"ticket_id": ticket_id, "message_id": message_id})
            .execute()
        )
        if not result or not result.data:
            raise RuntimeError(f"Failed to insert into {TICKET_MESSAGES_TABLE}")
        return result.data[0]
