"""Admin routes — agent management, AI config, API keys, usage (admin-only)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status

from backend.api.dependencies.auth import require_admin
from backend.schemas.admin import (
    AIConfigResponse,
    AIConfigUpdate,
    ApiKeyCreate,
    ApiKeyResponse,
    UsageResponse,
)
from backend.schemas.agents import AgentResponse, AgentUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


def _get_admin_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.agents import AgentRepository
    from backend.services.admin import AdminService

    db = get_supabase_client()
    return AdminService(AgentRepository(db))


@router.get("/agents", response_model=list[AgentResponse])
async def list_agents(
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.list_agents(admin["tenant_id"])


@router.patch("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    body: AgentUpdate,
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.update_agent(
        tenant_id=admin["tenant_id"],
        agent_id=agent_id,
        data=body.model_dump(exclude_unset=True),
    )


@router.get("/config/ai", response_model=AIConfigResponse)
async def get_ai_config(
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.get_ai_config(admin["tenant_id"])


@router.patch("/config/ai", response_model=AIConfigResponse)
async def update_ai_config(
    body: AIConfigUpdate,
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.update_ai_config(
        tenant_id=admin["tenant_id"],
        data=body.model_dump(exclude_unset=True),
    )


@router.get("/api-keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.list_api_keys(admin["tenant_id"])


@router.post(
    "/api-keys",
    response_model=ApiKeyResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_api_key(
    body: ApiKeyCreate,
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.create_api_key(
        tenant_id=admin["tenant_id"],
        name=body.name,
        scopes=body.scopes,
    )


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    await service.revoke_api_key(admin["tenant_id"], key_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/usage", response_model=UsageResponse)
async def get_usage(
    admin: dict = Depends(require_admin),
):
    service = _get_admin_service()
    return await service.get_usage(admin["tenant_id"])


# ── Extended admin endpoints for dashboard ───────────────────────

def _db():
    from backend.core.supabase import get_supabase_client
    return get_supabase_client()


@router.get("/users")
async def list_users(admin: dict = Depends(require_admin)) -> dict:
    db = _db()
    tenant = admin.get("tenant_id", "00000000-0000-0000-0000-000000000001")
    try:
        result = db.table("users").select("id, email, display_name, role, created_at", count="exact").eq("tenant_id", tenant).order("created_at", desc=True).execute()
        return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
    except Exception:
        return {"data": [], "total": 0}


@router.get("/all-tickets")
async def list_all_tickets(admin: dict = Depends(require_admin)) -> dict:
    db = _db()
    tenant = admin.get("tenant_id", "00000000-0000-0000-0000-000000000001")
    try:
        result = db.table("tickets").select("*", count="exact").eq("tenant_id", tenant).order("created_at", desc=True).limit(100).execute()
        return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
    except Exception:
        return {"data": [], "total": 0}


@router.patch("/tickets/{ticket_id}/assign")
async def assign_ticket(ticket_id: str, body: dict, admin: dict = Depends(require_admin)) -> dict:
    db = _db()
    agent_id = body.get("agent_id", "")
    if not agent_id:
        return {"error": "agent_id is required"}
    try:
        from datetime import UTC, datetime
        db.table("tickets").update({"assigned_agent_id": agent_id, "status": "in_progress", "updated_at": datetime.now(UTC).isoformat()}).eq("id", ticket_id).execute()
        return {"assigned": True}
    except Exception:
        return {"error": "Failed to assign"}


@router.get("/analytics")
async def analytics(admin: dict = Depends(require_admin)) -> dict:
    db = _db()
    tenant = admin.get("tenant_id", "00000000-0000-0000-0000-000000000001")
    try:
        u = db.table("users").select("id", count="exact").eq("tenant_id", tenant).execute()
        t = db.table("tickets").select("id, status", count="exact").eq("tenant_id", tenant).execute()
        m = db.table("messages").select("sender_type", count="exact").eq("tenant_id", tenant).execute()
        c = db.table("conversations").select("id", count="exact").eq("tenant_id", tenant).execute()

        tickets = t.data or [] if t else []
        msgs = m.data or [] if m else []
        ai = sum(1 for x in msgs if x.get("sender_type") == "ai")
        ag = sum(1 for x in msgs if x.get("sender_type") == "agent")
        total_resp = ai + ag
        return {
            "total_users": u.count or 0 if u else 0,
            "total_tickets": t.count or 0 if t else 0,
            "open_tickets": sum(1 for x in tickets if x.get("status") == "open"),
            "resolved_tickets": sum(1 for x in tickets if x.get("status") in ("resolved", "closed")),
            "total_conversations": c.count or 0 if c else 0,
            "ai_responses": ai,
            "agent_responses": ag,
            "ai_resolution_rate": round(ai / total_resp * 100, 1) if total_resp > 0 else 0,
        }
    except Exception:
        return {"total_users": 0, "total_tickets": 0, "open_tickets": 0, "resolved_tickets": 0, "total_conversations": 0, "ai_responses": 0, "agent_responses": 0, "ai_resolution_rate": 0}
