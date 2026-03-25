"""Ticket routes — CRUD, messaging, summary, and routing for support tickets."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status

from backend.api.dependencies.auth import get_current_user
from backend.schemas.messages import (
    MessageCreate,
    MessageListResponse,
    MessageResponse,
)
from backend.schemas.tickets import (
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketSummaryResponse,
    TicketUpdate,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _get_ticket_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.agents import AgentRepository
    from backend.repositories.messages import MessageRepository
    from backend.repositories.tickets import TicketRepository
    from backend.services.tickets import TicketService

    db = get_supabase_client()
    return TicketService(
        ticket_repo=TicketRepository(db),
        message_repo=MessageRepository(db),
        agent_repo=AgentRepository(db),
    )


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    user: dict = Depends(get_current_user),
    status_filter: str | None = Query(default=None, alias="status"),
    channel: str | None = Query(default=None),
    assigned_agent_id: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    service = _get_ticket_service()
    return await service.list_tickets(
        tenant_id=user["tenant_id"],
        filters={
            "status": status_filter,
            "channel": channel,
            "assigned_agent_id": assigned_agent_id,
            "priority": priority,
            "limit": limit,
            "offset": offset,
        },
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    return await service.get_ticket(user["tenant_id"], ticket_id)


@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ticket(
    body: TicketCreate,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    return await service.create_ticket(
        tenant_id=user["tenant_id"],
        data=body.model_dump(),
    )


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    body: TicketUpdate,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    return await service.update_ticket(
        tenant_id=user["tenant_id"],
        ticket_id=ticket_id,
        data=body.model_dump(exclude_unset=True),
    )


@router.get("/{ticket_id}/messages", response_model=MessageListResponse)
async def list_ticket_messages(
    ticket_id: str,
    user: dict = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    service = _get_ticket_service()
    return await service.get_ticket_messages(user["tenant_id"], ticket_id)


@router.post(
    "/{ticket_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_ticket_message(
    ticket_id: str,
    body: MessageCreate,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    return await service.add_ticket_message(
        tenant_id=user["tenant_id"],
        ticket_id=ticket_id,
        data={
            **body.model_dump(),
            "sender_type": "agent",
            "sender_id": user["id"],
        },
    )


@router.get("/{ticket_id}/summary", response_model=TicketSummaryResponse)
async def get_ticket_summary(
    ticket_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    summary = await service.get_ticket_summary(user["tenant_id"], ticket_id)
    return TicketSummaryResponse(summary=summary)


@router.post("/{ticket_id}/route", response_model=TicketResponse)
async def route_ticket(
    ticket_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_ticket_service()
    return await service.route_ticket(user["tenant_id"], ticket_id)
