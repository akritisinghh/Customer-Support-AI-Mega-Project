"""Conversation request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from backend.models.enums import ChannelEnum


class ConversationCreate(BaseModel):
    channel: ChannelEnum
    customer_id: str


class ConversationUpdate(BaseModel):
    status: str | None = None
    assigned_agent_id: str | None = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    customer_id: str
    channel: ChannelEnum
    status: str
    assigned_agent_id: str | None = None
    metadata: dict | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")
    updated_at: str = Field(..., description="ISO 8601 UTC timestamp")
    closed_at: str | None = None


class ConversationListResponse(BaseModel):
    data: list[ConversationResponse]
    total: int
    next_cursor: str | None = None
