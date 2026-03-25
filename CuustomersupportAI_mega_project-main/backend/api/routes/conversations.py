"""Conversation routes — CRUD and messaging for omni-channel conversations."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status

from backend.api.dependencies.auth import get_current_user
from backend.schemas.conversations import (
    ConversationCreate,
    ConversationListResponse,
    ConversationResponse,
    ConversationUpdate,
)
from backend.schemas.messages import (
    MessageCreate,
    MessageListResponse,
    MessageResponse,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


def _get_conversation_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.conversations import ConversationRepository
    from backend.repositories.messages import MessageRepository
    from backend.services.conversations import ConversationService

    db = get_supabase_client()
    return ConversationService(
        conversation_repo=ConversationRepository(db),
        message_repo=MessageRepository(db),
    )


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user: dict = Depends(get_current_user),
    status_filter: str | None = Query(default=None, alias="status"),
    channel: str | None = Query(default=None),
    customer_id: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    service = _get_conversation_service()
    result = await service.list_conversations(
        tenant_id=user["tenant_id"],
        filters={
            "status": status_filter,
            "channel": channel,
            "customer_id": customer_id,
            "limit": limit,
            "offset": offset,
        },
    )
    return result


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_conversation_service()
    return await service.get_conversation(user["tenant_id"], conversation_id)


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    body: ConversationCreate,
    user: dict = Depends(get_current_user),
):
    service = _get_conversation_service()
    return await service.create_conversation(
        tenant_id=user["tenant_id"],
        data=body.model_dump(),
    )


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    body: ConversationUpdate,
    user: dict = Depends(get_current_user),
):
    service = _get_conversation_service()
    return await service.update_conversation(
        tenant_id=user["tenant_id"],
        conversation_id=conversation_id,
        data=body.model_dump(exclude_unset=True),
    )


@router.get("/{conversation_id}/messages", response_model=MessageListResponse)
async def list_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    service = _get_conversation_service()
    return await service.get_messages(
        tenant_id=user["tenant_id"],
        conversation_id=conversation_id,
        offset=offset,
        limit=limit,
    )


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_message(
    conversation_id: str,
    body: MessageCreate,
    user: dict = Depends(get_current_user),
):
    service = _get_conversation_service()
    return await service.add_message(
        tenant_id=user["tenant_id"],
        conversation_id=conversation_id,
        data={
            **body.model_dump(),
            "sender_type": "customer",
            "sender_id": user["id"],
        },
    )
