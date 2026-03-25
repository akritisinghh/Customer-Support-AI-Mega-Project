"""Admin configuration and management schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class AIConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    model: str
    temperature: float
    max_tokens: int
    rag_top_k: int
    rag_score_threshold: float


class AIConfigUpdate(BaseModel):
    model: str | None = None
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1, le=128_000)
    rag_top_k: int | None = Field(default=None, ge=1, le=50)
    rag_score_threshold: float | None = Field(default=None, ge=0.0, le=1.0)


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    scopes: list[str] = Field(..., min_length=1)


class ApiKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    name: str
    key_preview: str = Field(..., description="Last 8 characters of the key")
    scopes: list[str]
    expires_at: str | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")
    last_used_at: str | None = None


class UsageResponse(BaseModel):
    total_tokens: int
    total_requests: int
    by_tenant: dict[str, dict]
