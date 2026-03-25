"""Message request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from backend.models.enums import ChannelEnum, SenderTypeEnum


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    channel: ChannelEnum
    content_type: str = "text"


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    conversation_id: str
    sender_type: SenderTypeEnum
    sender_id: str | None = None
    channel: ChannelEnum
    content: str
    content_type: str
    metadata: dict | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")


class MessageListResponse(BaseModel):
    data: list[MessageResponse]
    total: int
    next_cursor: str | None = None
