"""Conversation service — CRUD and messaging for omni-channel conversations."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from backend.core.exceptions import NotFoundError
from backend.core.logging import get_logger
from backend.repositories.conversations import ConversationRepository
from backend.repositories.messages import MessageRepository

log = get_logger(__name__)


class ConversationService:
    def __init__(
        self,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
    ) -> None:
        self.conversation_repo = conversation_repo
        self.message_repo = message_repo

    async def list_conversations(
        self,
        tenant_id: str,
        filters: dict | None = None,
    ) -> dict:
        filters = filters or {}
        result = await self.conversation_repo.list_by_tenant(
            tenant_id,
            status=filters.get("status"),
            channel=filters.get("channel"),
            customer_id=filters.get("customer_id"),
            offset=filters.get("offset", 0),
            limit=filters.get("limit", 20),
        )
        log.info(
            "conversations.list",
            tenant_id=tenant_id,
            total=result["total"],
        )
        return result

    async def get_conversation(self, tenant_id: str, conversation_id: str) -> dict:
        conversation = await self.conversation_repo.get_by_id(tenant_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversation", conversation_id)
        return conversation

    async def create_conversation(self, tenant_id: str, data: dict) -> dict:
        payload = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "customer_id": data["customer_id"],
            "channel": data.get("channel", "chat"),
            "status": "open",
            "metadata": data.get("metadata", {}),
            "created_at": datetime.now(UTC).isoformat(),
        }
        if data.get("assigned_agent_id"):
            payload["assigned_agent_id"] = data["assigned_agent_id"]

        conversation = await self.conversation_repo.create(payload)
        log.info(
            "conversations.created",
            tenant_id=tenant_id,
            conversation_id=conversation["id"],
            channel=payload["channel"],
        )
        return conversation

    async def update_conversation(
        self,
        tenant_id: str,
        conversation_id: str,
        data: dict,
    ) -> dict:
        existing = await self.conversation_repo.get_by_id(tenant_id, conversation_id)
        if not existing:
            raise NotFoundError("Conversation", conversation_id)

        update_fields: dict = {}
        for field in ("status", "assigned_agent_id", "metadata"):
            if field in data:
                update_fields[field] = data[field]

        if "status" in data and data["status"] == "closed":
            update_fields["closed_at"] = datetime.now(UTC).isoformat()

        update_fields["updated_at"] = datetime.now(UTC).isoformat()

        updated = await self.conversation_repo.update(tenant_id, conversation_id, update_fields)
        if not updated:
            raise NotFoundError("Conversation", conversation_id)

        log.info(
            "conversations.updated",
            tenant_id=tenant_id,
            conversation_id=conversation_id,
            fields=list(update_fields.keys()),
        )
        return updated

    async def get_messages(
        self,
        tenant_id: str,
        conversation_id: str,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> dict:
        await self.get_conversation(tenant_id, conversation_id)
        return await self.message_repo.get_by_conversation(
            tenant_id, conversation_id, offset=offset, limit=limit
        )

    async def add_message(
        self,
        tenant_id: str,
        conversation_id: str,
        data: dict,
    ) -> dict:
        await self.get_conversation(tenant_id, conversation_id)

        payload = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "conversation_id": conversation_id,
            "sender_type": data.get("sender_type", "customer"),
            "sender_id": data.get("sender_id"),
            "channel": data.get("channel", "chat"),
            "content": data["content"],
            "content_type": data.get("content_type", "text"),
            "metadata": data.get("metadata", {}),
            "created_at": datetime.now(UTC).isoformat(),
        }

        message = await self.message_repo.create(payload)
        log.info(
            "conversations.message_added",
            tenant_id=tenant_id,
            conversation_id=conversation_id,
            message_id=message["id"],
            sender_type=payload["sender_type"],
        )

        # TODO: emit event for NLP pipeline (intent, sentiment, urgency) and
        # auto-ticketing when implemented via event bus / Redis pub-sub.

        return message
