"""Customer request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from backend.schemas.conversations import ConversationResponse
from backend.schemas.tickets import TicketResponse


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    external_id: str | None = None
    email: str | None = None
    phone: str | None = None
    display_name: str | None = None
    metadata: dict | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")


class CustomerContextResponse(BaseModel):
    customer: CustomerResponse
    tickets: list[TicketResponse] = []
    conversations: list[ConversationResponse] = []
