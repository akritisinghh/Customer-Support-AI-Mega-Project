"""Customer routes — profile, tickets, and aggregated context."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from backend.api.dependencies.auth import get_current_user
from backend.schemas.customers import CustomerContextResponse, CustomerResponse
from backend.schemas.tickets import TicketListResponse

router = APIRouter(prefix="/customers", tags=["customers"])


def _get_customer_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.conversations import ConversationRepository
    from backend.repositories.customers import CustomerRepository
    from backend.repositories.tickets import TicketRepository
    from backend.services.customers import CustomerService

    db = get_supabase_client()
    return CustomerService(
        customer_repo=CustomerRepository(db),
        ticket_repo=TicketRepository(db),
        conversation_repo=ConversationRepository(db),
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_customer_service()
    return await service.get_customer(user["tenant_id"], customer_id)


@router.get("/{customer_id}/tickets", response_model=TicketListResponse)
async def get_customer_tickets(
    customer_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_customer_service()
    await service.get_customer(user["tenant_id"], customer_id)
    return await service.ticket_repo.list_by_tenant(
        user["tenant_id"], customer_id=customer_id,
    )


@router.get("/{customer_id}/context", response_model=CustomerContextResponse)
async def get_customer_context(
    customer_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_customer_service()
    return await service.get_customer_context(user["tenant_id"], customer_id)
