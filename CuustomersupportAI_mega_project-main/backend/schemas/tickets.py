"""Ticket request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from backend.models.enums import ChannelEnum, PriorityEnum, TicketStatusEnum


class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=500)
    customer_id: str
    conversation_id: str | None = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    channel: ChannelEnum = ChannelEnum.CHAT


class TicketUpdate(BaseModel):
    status: TicketStatusEnum | None = None
    priority: PriorityEnum | None = None
    assigned_agent_id: str | None = None
    tags: list[str] | None = None


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    conversation_id: str | None = None
    customer_id: str
    subject: str
    status: TicketStatusEnum
    priority: PriorityEnum
    assigned_agent_id: str | None = None
    sla_due_at: str | None = None
    summary: str | None = None
    tags: list[str] | None = None
    metadata: dict | None = None
    created_at: str | None = None
    updated_at: str | None = None
    closed_at: str | None = None


class TicketSummaryResponse(BaseModel):
    summary: str


class TicketListResponse(BaseModel):
    data: list[TicketResponse]
    total: int
    next_cursor: str | None = None
