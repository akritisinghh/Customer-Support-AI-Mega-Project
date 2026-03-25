"""Repository for customer persistence via Supabase."""

from __future__ import annotations

from supabase import Client

TABLE = "customers"


class CustomerRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    async def get_by_id(self, tenant_id: str, customer_id: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("id", customer_id)
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None

    async def get_by_email(self, tenant_id: str, email: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("tenant_id", tenant_id)
                .eq("email", email)
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None

    async def create(self, data: dict) -> dict:
        result = self.client.table(TABLE).insert(data).execute()
        if not result or not result.data:
            raise RuntimeError(f"Failed to insert into {TABLE}: {result}")
        return result.data[0]

    async def update(self, tenant_id: str, customer_id: str, data: dict) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .update(data)
                .eq("tenant_id", tenant_id)
                .eq("id", customer_id)
                .execute()
            )
            return result.data[0] if result and result.data else None
        except Exception:
            return None

    async def list_by_tenant(
        self,
        tenant_id: str,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        try:
            result = (
                self.client.table(TABLE)
                .select("*", count="exact")
                .eq("tenant_id", tenant_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
        except Exception:
            return {"data": [], "total": 0}
