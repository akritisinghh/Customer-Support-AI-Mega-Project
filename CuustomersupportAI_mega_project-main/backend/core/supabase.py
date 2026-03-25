from __future__ import annotations

from supabase import Client, create_client

from backend.core.config import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Return an initialised Supabase client (singleton)."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
        )
    return _supabase_client
