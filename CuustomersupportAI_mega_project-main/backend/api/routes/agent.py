"""Agent routes — view tickets, read conversations, reply, update status."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query

from backend.api.dependencies.auth import require_agent_or_admin

router = APIRouter(prefix="/agent", tags=["agent"])


def _db():
    from backend.core.supabase import get_supabase_client
    return get_supabase_client()


@router.get("/tickets")
async def list_tickets(agent: dict = Depends(require_agent_or_admin), status_filter: str | None = Query(default=None, alias="status")) -> dict:
    db = _db()
    tenant = agent.get("tenant_id", "00000000-0000-0000-0000-000000000001")
    try:
        q = db.table("tickets").select("*", count="exact").eq("tenant_id", tenant)
        if status_filter:
            q = q.eq("status", status_filter)
        result = q.order("created_at", desc=True).limit(50).execute()
        return {"data": result.data or [], "total": result.count or 0} if result else {"data": [], "total": 0}
    except Exception:
        return {"data": [], "total": 0}


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, agent: dict = Depends(require_agent_or_admin)) -> dict:
    db = _db()
    try:
        t = db.table("tickets").select("*").eq("id", ticket_id).maybe_single().execute()
        ticket = t.data if t else None
        messages = []
        if ticket and ticket.get("conversation_id"):
            m = db.table("messages").select("id, sender_type, sender_id, content, created_at").eq("conversation_id", ticket["conversation_id"]).order("created_at", desc=False).execute()
            messages = m.data or [] if m else []
        return {"ticket": ticket, "messages": messages}
    except Exception:
        return {"ticket": None, "messages": []}


@router.post("/tickets/{ticket_id}/reply")
async def reply(ticket_id: str, body: dict, agent: dict = Depends(require_agent_or_admin)) -> dict:
    db = _db()
    content = body.get("content", "").strip()
    if not content:
        return {"error": "Content is required"}
    tenant = agent.get("tenant_id", "00000000-0000-0000-0000-000000000001")
    try:
        t = db.table("tickets").select("conversation_id").eq("id", ticket_id).maybe_single().execute()
        if not t or not t.data or not t.data.get("conversation_id"):
            return {"error": "Ticket not found"}
        conv_id = t.data["conversation_id"]
        msg_id = str(uuid.uuid4())
        db.table("messages").insert({"id": msg_id, "tenant_id": tenant, "conversation_id": conv_id, "sender_type": "agent", "sender_id": agent["id"], "channel": "chat", "content": content, "content_type": "text"}).execute()
        db.table("tickets").update({"status": "in_progress", "assigned_agent_id": agent["id"], "updated_at": datetime.now(UTC).isoformat()}).eq("id", ticket_id).execute()
        return {"message_id": msg_id, "status": "sent"}
    except Exception:
        return {"error": "Failed to send reply"}


@router.patch("/tickets/{ticket_id}/status")
async def update_status(ticket_id: str, body: dict, agent: dict = Depends(require_agent_or_admin)) -> dict:
    db = _db()
    new_status = body.get("status", "")
    if new_status not in ("open", "in_progress", "resolved", "closed"):
        return {"error": "Invalid status"}
    try:
        upd: dict = {"status": new_status, "updated_at": datetime.now(UTC).isoformat()}
        if new_status in ("resolved", "closed"):
            upd["closed_at"] = datetime.now(UTC).isoformat()
        db.table("tickets").update(upd).eq("id", ticket_id).execute()
        return {"status": new_status, "updated": True}
    except Exception:
        return {"error": "Failed to update"}
