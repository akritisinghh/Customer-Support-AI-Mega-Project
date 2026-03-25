"""Repository for user persistence via Supabase."""

from __future__ import annotations

from supabase import Client

TABLE = "users"


class UserRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    async def get_by_id(self, user_id: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
                .eq("id", user_id)
                .maybe_single()
                .execute()
            )
            return result.data if result else None
        except Exception:
            return None

    async def get_by_email(self, email: str) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .select("*")
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

    async def update(self, user_id: str, data: dict) -> dict | None:
        try:
            result = (
                self.client.table(TABLE)
                .update(data)
                .eq("id", user_id)
                .execute()
            )
            return result.data[0] if result and result.data else None
        except Exception:
            return None
