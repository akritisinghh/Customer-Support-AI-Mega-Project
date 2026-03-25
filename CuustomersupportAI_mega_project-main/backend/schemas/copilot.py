"""Agent Copilot (AI-assist) request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SuggestReplyRequest(BaseModel):
    conversation_id: str | None = None
    ticket_id: str | None = None
    context: str | None = None


class SuggestReplyResponse(BaseModel):
    suggested_reply: str
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class SummarizeRequest(BaseModel):
    conversation_id: str | None = None
    ticket_id: str | None = None


class SummarizeResponse(BaseModel):
    summary: str


class KBRetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=50)


class KBRetrieveResponse(BaseModel):
    snippets: list[dict]


class TroubleshootingRequest(BaseModel):
    topic: str | None = None
    ticket_id: str | None = None


class TroubleshootingResponse(BaseModel):
    steps: list[str]
