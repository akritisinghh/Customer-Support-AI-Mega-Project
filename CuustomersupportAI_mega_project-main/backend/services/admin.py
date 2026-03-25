"""Admin service — agents, AI config, API keys, and usage."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, datetime

from backend.core.config import settings
from backend.core.exceptions import NotFoundError
from backend.core.logging import get_logger
from backend.core.supabase import get_supabase_client
from backend.repositories.agents import AgentRepository

log = get_logger(__name__)

API_KEYS_TABLE = "api_keys"
AI_CONFIG_TABLE = "integrations_config"


class AdminService:
    def __init__(self, agent_repo: AgentRepository) -> None:
        self.agent_repo = agent_repo
        self.db = get_supabase_client()

    # ---- Agents ----

    async def list_agents(self, tenant_id: str) -> list[dict]:
        result = await self.agent_repo.list_by_tenant(tenant_id, limit=200)
        return result["data"]

    async def update_agent(self, tenant_id: str, agent_id: str, data: dict) -> dict:
        existing = await self.agent_repo.get_by_id(tenant_id, agent_id)
        if not existing:
            raise NotFoundError("Agent", agent_id)

        update_fields: dict = {}
        for field in ("display_name", "status", "skills"):
            if field in data:
                update_fields[field] = data[field]
        update_fields["updated_at"] = datetime.now(UTC).isoformat()

        updated = await self.agent_repo.update(tenant_id, agent_id, update_fields)
        if not updated:
            raise NotFoundError("Agent", agent_id)

        log.info("admin.agent_updated", tenant_id=tenant_id, agent_id=agent_id)
        return updated

    # ---- AI Config ----

    async def get_ai_config(self, tenant_id: str) -> dict:
        result = (
            self.db.table(AI_CONFIG_TABLE)
            .select("*")
            .eq("tenant_id", tenant_id)
            .eq("provider", "groq")
            .maybe_single()
            .execute()
        )
        if result.data:
            return result.data.get("config", {})

        return {
            "model": settings.AI_MODEL,
            "temperature": settings.AI_TEMPERATURE,
            "max_tokens": settings.AI_MAX_TOKENS,
            "rag_top_k": settings.RAG_TOP_K,
            "rag_score_threshold": settings.RAG_SCORE_THRESHOLD,
        }

    async def update_ai_config(self, tenant_id: str, data: dict) -> dict:
        config_payload = {
            "model": data.get("model", settings.AI_MODEL),
            "temperature": data.get("temperature", settings.AI_TEMPERATURE),
            "max_tokens": data.get("max_tokens", settings.AI_MAX_TOKENS),
            "rag_top_k": data.get("rag_top_k", settings.RAG_TOP_K),
            "rag_score_threshold": data.get("rag_score_threshold", settings.RAG_SCORE_THRESHOLD),
        }

        existing = (
            self.db.table(AI_CONFIG_TABLE)
            .select("id")
            .eq("tenant_id", tenant_id)
            .eq("provider", "groq")
            .maybe_single()
            .execute()
        )

        if existing.data:
            self.db.table(AI_CONFIG_TABLE).update(
                {"config": config_payload, "updated_at": datetime.now(UTC).isoformat()}
            ).eq("id", existing.data["id"]).execute()
        else:
            self.db.table(AI_CONFIG_TABLE).insert(
                {
                    "id": str(uuid.uuid4()),
                    "tenant_id": tenant_id,
                    "provider": "groq",
                    "config": config_payload,
                    "enabled": True,
                    "created_at": datetime.now(UTC).isoformat(),
                }
            ).execute()

        log.info("admin.ai_config_updated", tenant_id=tenant_id)
        return config_payload

    # ---- API Keys ----

    async def list_api_keys(self, tenant_id: str) -> list[dict]:
        result = (
            self.db.table(API_KEYS_TABLE)
            .select("id, tenant_id, name, scopes, created_at, last_used_at, expires_at")
            .eq("tenant_id", tenant_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []

    async def create_api_key(
        self,
        tenant_id: str,
        name: str,
        scopes: list[str],
    ) -> dict:
        raw_key = f"csk_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        record = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "name": name,
            "key_hash": key_hash,
            "scopes": scopes,
            "created_at": datetime.now(UTC).isoformat(),
        }
        result = self.db.table(API_KEYS_TABLE).insert(record).execute()
        created = result.data[0]

        log.info("admin.api_key_created", tenant_id=tenant_id, key_id=created["id"], name=name)
        return {
            "id": created["id"],
            "name": created["name"],
            "scopes": created.get("scopes", []),
            "raw_key": raw_key,
            "created_at": created["created_at"],
        }

    async def revoke_api_key(self, tenant_id: str, key_id: str) -> None:
        result = (
            self.db.table(API_KEYS_TABLE)
            .delete()
            .eq("tenant_id", tenant_id)
            .eq("id", key_id)
            .execute()
        )
        if not result.data:
            raise NotFoundError("API Key", key_id)

        log.info("admin.api_key_revoked", tenant_id=tenant_id, key_id=key_id)

    # ---- Usage ----

    async def get_usage(self, tenant_id: str) -> dict:
        """Return usage statistics for the tenant."""
        tickets_count = (
            self.db.table("tickets")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .execute()
        ).count or 0

        conversations_count = (
            self.db.table("conversations")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .execute()
        ).count or 0

        messages_count = (
            self.db.table("messages")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .execute()
        ).count or 0

        kb_docs_count = (
            self.db.table("knowledge_documents")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .is_("deleted_at", "null")
            .execute()
        ).count or 0

        log.info("admin.usage", tenant_id=tenant_id)
        return {
            "tenant_id": tenant_id,
            "tickets": tickets_count,
            "conversations": conversations_count,
            "messages": messages_count,
            "knowledge_documents": kb_docs_count,
            # TODO: token usage, API request counts from audit logs
            "ai_tokens_used": None,
            "api_requests": None,
        }
