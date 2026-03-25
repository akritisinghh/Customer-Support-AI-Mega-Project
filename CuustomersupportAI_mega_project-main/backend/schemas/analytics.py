"""Analytics dashboard schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    csat_score: float | None = Field(default=None, description="0-5 scale")
    avg_resolution_time_minutes: float | None = None
    avg_first_response_minutes: float | None = None
    total_conversations: int = 0
    total_tickets: int = 0
    ai_resolution_rate: float | None = Field(
        default=None, description="Fraction resolved by AI alone"
    )
    human_resolution_rate: float | None = Field(
        default=None, description="Fraction requiring a human agent"
    )
    sentiment_breakdown: dict[str, int] | None = None
    channel_breakdown: dict[str, int] | None = None


class AgentPerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    agent_id: str
    display_name: str
    resolved_tickets: int = 0
    avg_response_time_minutes: float | None = None
    csat_score: float | None = None
