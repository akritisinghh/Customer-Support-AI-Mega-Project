"""Analytics routes — dashboard aggregates, agent performance, call metrics."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from backend.api.dependencies.auth import get_current_user
from backend.schemas.analytics import AgentPerformanceResponse, DashboardResponse
from backend.schemas.voice import VoiceCallResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _get_analytics_service():
    from backend.services.analytics import AnalyticsService

    return AnalyticsService()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    user: dict = Depends(get_current_user),
    start_date: str | None = Query(default=None, description="ISO 8601 date"),
    end_date: str | None = Query(default=None, description="ISO 8601 date"),
    channel: str | None = Query(default=None),
):
    service = _get_analytics_service()
    return await service.get_dashboard(user["tenant_id"])


@router.get("/agents", response_model=list[AgentPerformanceResponse])
async def get_agent_performance(
    user: dict = Depends(get_current_user),
    start_date: str | None = Query(default=None, description="ISO 8601 date"),
    end_date: str | None = Query(default=None, description="ISO 8601 date"),
):
    service = _get_analytics_service()
    return await service.get_agent_performance(user["tenant_id"])


@router.get("/calls", response_model=list[VoiceCallResponse])
async def get_call_metrics(
    user: dict = Depends(get_current_user),
    start_date: str | None = Query(default=None, description="ISO 8601 date"),
    end_date: str | None = Query(default=None, description="ISO 8601 date"),
):
    service = _get_analytics_service()
    return await service.get_call_metrics(user["tenant_id"])
