"""Customer service — profile and aggregated context."""

from __future__ import annotations

from backend.core.exceptions import NotFoundError
from backend.core.logging import get_logger
from backend.repositories.conversations import ConversationRepository
from backend.repositories.customers import CustomerRepository
from backend.repositories.tickets import TicketRepository

log = get_logger(__name__)


class CustomerService:
    def __init__(
        self,
        customer_repo: CustomerRepository,
        ticket_repo: TicketRepository,
        conversation_repo: ConversationRepository,
    ) -> None:
        self.customer_repo = customer_repo
        self.ticket_repo = ticket_repo
        self.conversation_repo = conversation_repo

    async def get_customer(self, tenant_id: str, customer_id: str) -> dict:
        customer = await self.customer_repo.get_by_id(tenant_id, customer_id)
        if not customer:
            raise NotFoundError("Customer", customer_id)
        return customer

    async def get_customer_context(self, tenant_id: str, customer_id: str) -> dict:
        """Aggregate customer profile, recent tickets, and recent conversations."""
        customer = await self.get_customer(tenant_id, customer_id)

        tickets = await self.ticket_repo.list_by_tenant(
            tenant_id, customer_id=customer_id, limit=10
        )
        conversations = await self.conversation_repo.list_by_tenant(
            tenant_id, customer_id=customer_id, limit=10
        )

        log.info(
            "customers.context_loaded",
            tenant_id=tenant_id,
            customer_id=customer_id,
            tickets_count=tickets["total"],
            conversations_count=conversations["total"],
        )
        return {
            "customer": customer,
            "tickets": tickets["data"],
            "conversations": conversations["data"],
        }
