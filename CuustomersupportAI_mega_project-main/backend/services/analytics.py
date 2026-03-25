"""Analytics service — dashboard metrics, agent performance, and call metrics."""

from __future__ import annotations

from backend.core.logging import get_logger
from backend.core.supabase import get_supabase_client

log = get_logger(__name__)


class AnalyticsService:
    def __init__(self) -> None:
        self.db = get_supabase_client()

    async def get_dashboard(self, tenant_id: str) -> dict:
        """Aggregate high-level dashboard metrics for a tenant."""
        tickets_result = (
            self.db.table("tickets")
            .select("status", count="exact")
            .eq("tenant_id", tenant_id)
            .execute()
        )
        total_tickets = tickets_result.count or 0

        open_tickets = (
            self.db.table("tickets")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .eq("status", "open")
            .execute()
        ).count or 0

        resolved_tickets = (
            self.db.table("tickets")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .in_("status", ["resolved", "closed"])
            .execute()
        ).count or 0

        conversations_result = (
            self.db.table("conversations")
            .select("id", count="exact")
            .eq("tenant_id", tenant_id)
            .execute()
        )
        total_conversations = conversations_result.count or 0

        # TODO: compute avg resolution time, first response time, CSAT, and
        # sentiment breakdown from stored metrics once the analytics pipeline
        # is wired up.

        metrics = {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "total_conversations": total_conversations,
            "avg_resolution_time_minutes": None,
            "avg_first_response_time_minutes": None,
            "csat_score": None,
            "ai_resolution_rate": None,
        }
        log.info("analytics.dashboard", tenant_id=tenant_id)
        return metrics

    async def get_agent_performance(self, tenant_id: str) -> list[dict]:
        """Per-agent performance metrics."""
        agents_result = (
            self.db.table("agents")
            .select("id, display_name, status")
            .eq("tenant_id", tenant_id)
            .execute()
        )
        agents = agents_result.data or []

        performance: list[dict] = []
        for agent in agents:
            assigned_count = (
                self.db.table("tickets")
                .select("id", count="exact")
                .eq("tenant_id", tenant_id)
                .eq("assigned_agent_id", agent["id"])
                .execute()
            ).count or 0

            resolved_count = (
                self.db.table("tickets")
                .select("id", count="exact")
                .eq("tenant_id", tenant_id)
                .eq("assigned_agent_id", agent["id"])
                .in_("status", ["resolved", "closed"])
                .execute()
            ).count or 0

            performance.append(
                {
                    "agent_id": agent["id"],
                    "display_name": agent.get("display_name", ""),
                    "status": agent.get("status", "offline"),
                    "assigned_tickets": assigned_count,
                    "resolved_tickets": resolved_count,
                    # TODO: avg handling time, CSAT per agent
                    "avg_handling_time_minutes": None,
                    "csat_score": None,
                }
            )

        log.info("analytics.agent_performance", tenant_id=tenant_id, agents_count=len(performance))
        return performance

    async def get_call_metrics(self, tenant_id: str) -> list[dict]:
        """Aggregate voice call metrics."""
        calls_result = (
            self.db.table("voice_calls")
            .select("id, duration_seconds, created_at, agent_id")
            .eq("tenant_id", tenant_id)
            .order("created_at", desc=True)
            .limit(200)
            .execute()
        )
        calls = calls_result.data or []

        total_calls = len(calls)
        total_duration = sum(c.get("duration_seconds", 0) for c in calls)
        avg_duration = (total_duration / total_calls) if total_calls else 0

        log.info("analytics.call_metrics", tenant_id=tenant_id, total_calls=total_calls)
        return [
            {
                "total_calls": total_calls,
                "total_duration_seconds": total_duration,
                "avg_duration_seconds": round(avg_duration, 1),
                # TODO: breakdown by agent, call quality scores
            }
        ]
