"""Agent copilot service — AI-powered suggestions, summaries, and KB retrieval."""

from __future__ import annotations

from groq import AsyncGroq

from backend.core.config import settings
from backend.core.exceptions import ExternalServiceError, NotFoundError
from backend.core.logging import get_logger
from backend.repositories.conversations import ConversationRepository
from backend.repositories.messages import MessageRepository
from backend.services.knowledge import KnowledgeService

log = get_logger(__name__)


class CopilotService:
    def __init__(
        self,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
        knowledge_svc: KnowledgeService,
    ) -> None:
        self.conversation_repo = conversation_repo
        self.message_repo = message_repo
        self.knowledge_svc = knowledge_svc
        self.groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def suggest_reply(
        self,
        tenant_id: str,
        conversation_id: str,
        *,
        context: str | None = None,
    ) -> str:
        conversation = await self.conversation_repo.get_by_id(tenant_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversation", conversation_id)

        messages_result = await self.message_repo.get_by_conversation(
            tenant_id, conversation_id, limit=20
        )
        messages = messages_result.get("data", [])
        transcript = "\n".join(
            f"[{m.get('sender_type', 'unknown')}]: {m.get('content', '')}" for m in messages
        )

        last_customer_msg = ""
        for m in reversed(messages):
            if m.get("sender_type") == "customer":
                last_customer_msg = m.get("content", "")
                break

        kb_snippets: list[dict] = []
        if last_customer_msg:
            kb_snippets = await self.knowledge_svc.search_knowledge(
                tenant_id, last_customer_msg, top_k=3
            )

        kb_context = "\n---\n".join(s.get("content", "") for s in kb_snippets) if kb_snippets else ""

        system_prompt = (
            "You are a helpful customer support agent assistant. "
            "Based on the conversation history and knowledge base context, "
            "draft a professional, empathetic reply to the customer's latest message."
        )
        user_prompt_parts = [f"Conversation:\n{transcript}"]
        if kb_context:
            user_prompt_parts.append(f"Knowledge base context:\n{kb_context}")
        if context:
            user_prompt_parts.append(f"Additional context:\n{context}")

        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "\n\n".join(user_prompt_parts)},
                ],
            )
            reply = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("copilot.suggest_reply_error", conversation_id=conversation_id, error=str(exc))
            raise ExternalServiceError("Groq", "Failed to generate suggested reply") from exc

        log.info("copilot.suggest_reply", tenant_id=tenant_id, conversation_id=conversation_id)
        return reply

    async def summarize(self, tenant_id: str, conversation_id: str) -> str:
        conversation = await self.conversation_repo.get_by_id(tenant_id, conversation_id)
        if not conversation:
            raise NotFoundError("Conversation", conversation_id)

        messages_result = await self.message_repo.get_by_conversation(
            tenant_id, conversation_id, limit=100
        )
        messages = messages_result.get("data", [])
        transcript = "\n".join(
            f"[{m.get('sender_type', 'unknown')}]: {m.get('content', '')}" for m in messages
        )

        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Summarize the following customer support conversation concisely. "
                            "Highlight the customer's issue, steps taken, and current status."
                        ),
                    },
                    {"role": "user", "content": transcript},
                ],
            )
            summary = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("copilot.summarize_error", conversation_id=conversation_id, error=str(exc))
            raise ExternalServiceError("Groq", "Failed to generate summary") from exc

        log.info("copilot.summarize", tenant_id=tenant_id, conversation_id=conversation_id)
        return summary

    async def retrieve_kb(
        self,
        tenant_id: str,
        query: str,
        *,
        top_k: int | None = None,
    ) -> list[dict]:
        return await self.knowledge_svc.search_knowledge(tenant_id, query, top_k=top_k)

    async def get_troubleshooting_steps(
        self,
        tenant_id: str,
        topic: str,
        *,
        ticket_id: str | None = None,
    ) -> list[str]:
        kb_snippets = await self.knowledge_svc.search_knowledge(tenant_id, topic, top_k=3)
        kb_context = "\n---\n".join(s.get("content", "") for s in kb_snippets) if kb_snippets else ""

        user_parts = [f"Topic: {topic}"]
        if kb_context:
            user_parts.append(f"Knowledge base context:\n{kb_context}")
        if ticket_id:
            user_parts.append(f"Ticket ID (for reference): {ticket_id}")

        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a support troubleshooting expert. "
                            "Provide a numbered list of clear, actionable troubleshooting steps. "
                            "Return ONLY the numbered steps, one per line."
                        ),
                    },
                    {"role": "user", "content": "\n\n".join(user_parts)},
                ],
            )
            raw = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("copilot.troubleshooting_error", topic=topic, error=str(exc))
            raise ExternalServiceError("Groq", "Failed to generate troubleshooting steps") from exc

        steps = [line.strip() for line in raw.splitlines() if line.strip()]
        log.info("copilot.troubleshooting", tenant_id=tenant_id, topic=topic, steps_count=len(steps))
        return steps
