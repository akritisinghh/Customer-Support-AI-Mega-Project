"""Agent request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from backend.models.enums import AgentStatusEnum


class AgentUpdate(BaseModel):
    status: AgentStatusEnum | None = None
    skills: list[str] | None = None
    display_name: str | None = None


class AgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    user_id: str
    display_name: str
    status: AgentStatusEnum
    skills: list[str] | None = None
    avatar_url: str | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")
    updated_at: str = Field(..., description="ISO 8601 UTC timestamp")
