"""Ticket service — CRUD, auto-categorization, routing, and AI summaries."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from groq import AsyncGroq

from backend.core.config import settings
from backend.core.exceptions import ExternalServiceError, NotFoundError
from backend.core.logging import get_logger
from backend.repositories.agents import AgentRepository
from backend.repositories.messages import MessageRepository
from backend.repositories.tickets import TicketRepository

log = get_logger(__name__)


class TicketService:
    def __init__(
        self,
        ticket_repo: TicketRepository,
        message_repo: MessageRepository,
        agent_repo: AgentRepository,
    ) -> None:
        self.ticket_repo = ticket_repo
        self.message_repo = message_repo
        self.agent_repo = agent_repo
        self.groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

    # ---- CRUD ----

    async def list_tickets(self, tenant_id: str, filters: dict | None = None) -> dict:
        filters = filters or {}
        result = await self.ticket_repo.list_by_tenant(
            tenant_id,
            status=filters.get("status"),
            priority=filters.get("priority"),
            assigned_agent_id=filters.get("assigned_agent_id"),
            customer_id=filters.get("customer_id"),
            offset=filters.get("offset", 0),
            limit=filters.get("limit", 20),
        )
        log.info("tickets.list", tenant_id=tenant_id, total=result["total"])
        return result

    async def get_ticket(self, tenant_id: str, ticket_id: str) -> dict:
        ticket = await self.ticket_repo.get_by_id(tenant_id, ticket_id)
        if not ticket:
            raise NotFoundError("Ticket", ticket_id)
        return ticket

    async def create_ticket(self, tenant_id: str, data: dict) -> dict:
        priority = data.get("priority", "medium")
        if "subject" in data and not data.get("priority"):
            priority = await self._auto_classify_priority(data["subject"])

        payload: dict = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "customer_id": data["customer_id"],
            "subject": data.get("subject", ""),
            "status": "open",
            "priority": priority,
            "metadata": data.get("metadata", {}),
            "created_at": datetime.now(UTC).isoformat(),
        }
        if data.get("conversation_id"):
            payload["conversation_id"] = data["conversation_id"]

        ticket = await self.ticket_repo.create(payload)
        log.info(
            "tickets.created",
            tenant_id=tenant_id,
            ticket_id=ticket["id"],
            priority=priority,
        )

        try:
            routed = await self.route_ticket(tenant_id, ticket["id"])
            return routed
        except Exception:
            log.warning("tickets.auto_route_failed", ticket_id=ticket["id"])
            return ticket

    async def update_ticket(self, tenant_id: str, ticket_id: str, data: dict) -> dict:
        existing = await self.ticket_repo.get_by_id(tenant_id, ticket_id)
        if not existing:
            raise NotFoundError("Ticket", ticket_id)

        update_fields: dict = {}
        for field in ("status", "priority", "assigned_agent_id", "subject", "summary", "metadata"):
            if field in data:
                update_fields[field] = data[field]

        if data.get("status") in ("resolved", "closed"):
            update_fields["closed_at"] = datetime.now(UTC).isoformat()

        update_fields["updated_at"] = datetime.now(UTC).isoformat()

        updated = await self.ticket_repo.update(tenant_id, ticket_id, update_fields)
        if not updated:
            raise NotFoundError("Ticket", ticket_id)

        log.info("tickets.updated", tenant_id=tenant_id, ticket_id=ticket_id)
        return updated

    # ---- Messages ----

    async def get_ticket_messages(self, tenant_id: str, ticket_id: str) -> dict:
        await self.get_ticket(tenant_id, ticket_id)
        return await self.ticket_repo.get_messages(tenant_id, ticket_id)

    async def add_ticket_message(self, tenant_id: str, ticket_id: str, data: dict) -> dict:
        ticket = await self.get_ticket(tenant_id, ticket_id)

        msg_payload = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "conversation_id": ticket.get("conversation_id"),
            "sender_type": data.get("sender_type", "agent"),
            "sender_id": data.get("sender_id"),
            "channel": data.get("channel", "chat"),
            "content": data["content"],
            "content_type": data.get("content_type", "text"),
            "metadata": data.get("metadata", {}),
            "created_at": datetime.now(UTC).isoformat(),
        }

        message = await self.message_repo.create(msg_payload)
        await self.ticket_repo.add_message_link(ticket_id, message["id"])

        log.info("tickets.message_added", tenant_id=tenant_id, ticket_id=ticket_id, message_id=message["id"])
        return message

    # ---- AI ----

    async def get_ticket_summary(self, tenant_id: str, ticket_id: str) -> str:
        ticket = await self.get_ticket(tenant_id, ticket_id)
        messages_result = await self.ticket_repo.get_messages(tenant_id, ticket_id)
        messages = messages_result.get("data", [])

        transcript = "\n".join(
            f"[{m.get('sender_type', 'unknown')}]: {m.get('content', '')}" for m in messages
        )
        if not transcript:
            transcript = f"Ticket subject: {ticket.get('subject', 'N/A')}"

        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a support analyst. Provide a concise summary of the "
                            "following support ticket conversation. Include the main issue, "
                            "current status, and any resolution steps taken."
                        ),
                    },
                    {"role": "user", "content": transcript},
                ],
            )
            summary = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("tickets.summary_ai_error", ticket_id=ticket_id, error=str(exc))
            raise ExternalServiceError("Groq", "Failed to generate ticket summary") from exc

        await self.ticket_repo.update(tenant_id, ticket_id, {"summary": summary})
        log.info("tickets.summary_generated", tenant_id=tenant_id, ticket_id=ticket_id)
        return summary

    # ---- Routing ----

    async def route_ticket(self, tenant_id: str, ticket_id: str) -> dict:
        """Assign ticket to the best available agent based on skills / load."""
        ticket = await self.get_ticket(tenant_id, ticket_id)
        available = await self.agent_repo.get_available_agents(tenant_id)

        if not available:
            log.warning("tickets.no_available_agents", tenant_id=tenant_id, ticket_id=ticket_id)
            return ticket

        # Round-robin as baseline; TODO: skill-based matching using ticket metadata
        agent = available[0]

        updated = await self.ticket_repo.update(
            tenant_id,
            ticket_id,
            {
                "assigned_agent_id": agent["id"],
                "updated_at": datetime.now(UTC).isoformat(),
            },
        )
        log.info("tickets.routed", tenant_id=tenant_id, ticket_id=ticket_id, agent_id=agent["id"])
        return updated or ticket

    # ---- Internal helpers ----

    async def _auto_classify_priority(self, text: str) -> str:
        """Use Groq to classify ticket priority from subject text."""
        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=0,
                max_tokens=10,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Classify the support ticket priority as exactly one of: "
                            "low, medium, high, urgent. Reply with just the word."
                        ),
                    },
                    {"role": "user", "content": text},
                ],
            )
            raw = (response.choices[0].message.content or "medium").strip().lower()
            return raw if raw in ("low", "medium", "high", "urgent") else "medium"
        except Exception:
            log.warning("tickets.auto_classify_fallback", text=text[:80])
            return "medium"
