"""Agent Copilot routes — AI-assisted reply, summary, KB retrieval, troubleshooting."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from backend.api.dependencies.auth import get_current_user
from backend.schemas.copilot import (
    KBRetrieveRequest,
    KBRetrieveResponse,
    SuggestReplyRequest,
    SuggestReplyResponse,
    SummarizeRequest,
    SummarizeResponse,
    TroubleshootingRequest,
    TroubleshootingResponse,
)

router = APIRouter(prefix="/copilot", tags=["copilot"])


def _get_copilot_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.conversations import ConversationRepository
    from backend.repositories.knowledge import KnowledgeRepository
    from backend.repositories.messages import MessageRepository
    from backend.services.copilot import CopilotService
    from backend.services.knowledge import KnowledgeService

    db = get_supabase_client()
    knowledge_svc = KnowledgeService(KnowledgeRepository(db))
    return CopilotService(
        conversation_repo=ConversationRepository(db),
        message_repo=MessageRepository(db),
        knowledge_svc=knowledge_svc,
    )


@router.post("/suggest-reply", response_model=SuggestReplyResponse)
async def suggest_reply(
    body: SuggestReplyRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_copilot_service()
    reply = await service.suggest_reply(
        tenant_id=user["tenant_id"],
        conversation_id=body.conversation_id or "",
        context=body.context,
    )
    return SuggestReplyResponse(suggested_reply=reply)


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(
    body: SummarizeRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_copilot_service()
    summary = await service.summarize(
        tenant_id=user["tenant_id"],
        conversation_id=body.conversation_id or "",
    )
    return SummarizeResponse(summary=summary)


@router.post("/retrieve-kb", response_model=KBRetrieveResponse)
async def retrieve_kb(
    body: KBRetrieveRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_copilot_service()
    snippets = await service.retrieve_kb(
        tenant_id=user["tenant_id"],
        query=body.query,
        top_k=body.top_k,
    )
    return KBRetrieveResponse(snippets=snippets)


@router.post("/troubleshooting-steps", response_model=TroubleshootingResponse)
async def troubleshooting_steps(
    body: TroubleshootingRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_copilot_service()
    steps = await service.get_troubleshooting_steps(
        tenant_id=user["tenant_id"],
        topic=body.topic or "",
        ticket_id=body.ticket_id,
    )
    return TroubleshootingResponse(steps=steps)
