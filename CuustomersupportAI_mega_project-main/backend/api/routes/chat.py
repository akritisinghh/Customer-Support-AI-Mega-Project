"""Chat routes — AI completions with DB persistence, confidence detection, auto-ticket."""

from __future__ import annotations

import json
import traceback
import uuid

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status

from backend.api.dependencies.auth import get_current_user
from backend.core.config import settings
from backend.core.logging import get_logger

log = get_logger(__name__)
router = APIRouter(tags=["chat"])

_LOW_PHRASES = [
    "i'm not sure", "i don't know", "i cannot", "i'm unable",
    "contact support", "speak to an agent", "i don't have information",
    "beyond my capabilities", "human agent", "i apologize, but i",
]


def _confidence(text: str) -> float:
    low = text.lower()
    for p in _LOW_PHRASES:
        if p in low:
            return 0.3
    return 0.85 if len(text.strip()) > 30 else 0.4


def _db():
    from backend.core.supabase import get_supabase_client
    return get_supabase_client()


@router.post("/chat/completions")
async def chat_completions(body: dict, user: dict = Depends(get_current_user)) -> dict:
    from groq import AsyncGroq

    db = _db()
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    message = body.get("message", "").strip()
    conversation_id = body.get("conversation_id", "")
    tenant = user.get("tenant_id", "00000000-0000-0000-0000-000000000001")

    if not message:
        return {"conversation_id": conversation_id, "response": "Please enter a message.", "confidence": 1.0, "needs_agent": False, "ticket_id": None}

    # Ensure conversation row
    try:
        ex = db.table("conversations").select("id").eq("id", conversation_id).maybe_single().execute()
        if not ex or not ex.data:
            db.table("conversations").insert({"id": conversation_id, "tenant_id": tenant, "customer_id": user["id"], "channel": "chat", "status": "active"}).execute()
    except Exception:
        pass

    # Store user message
    try:
        db.table("messages").insert({"id": str(uuid.uuid4()), "tenant_id": tenant, "conversation_id": conversation_id, "sender_type": "customer", "sender_id": user["id"], "channel": "chat", "content": message, "content_type": "text"}).execute()
    except Exception:
        pass

    # AI response
    try:
        ai_resp = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "You are Nexora, a helpful AI customer support assistant. Answer clearly. If you cannot resolve the issue, say 'I'll escalate this to a human agent'."},
                {"role": "user", "content": message},
            ],
        )
        ai_text = ai_resp.choices[0].message.content or ""
    except Exception:
        log.error("chat.groq_error", traceback=traceback.format_exc())
        ai_text = "I'm sorry, I'm having trouble right now. Let me connect you with a human agent."

    conf = _confidence(ai_text)

    # Store AI message
    try:
        db.table("messages").insert({"id": str(uuid.uuid4()), "tenant_id": tenant, "conversation_id": conversation_id, "sender_type": "ai", "sender_id": "system", "channel": "chat", "content": ai_text, "content_type": "text"}).execute()
    except Exception:
        pass

    # Auto-ticket on low confidence
    ticket_id = None
    needs_agent = conf < 0.5
    if needs_agent:
        ticket_id = str(uuid.uuid4())
        try:
            db.table("tickets").insert({"id": ticket_id, "tenant_id": tenant, "conversation_id": conversation_id, "customer_id": user["id"], "subject": message[:200], "status": "open", "priority": "medium", "channel": "chat"}).execute()
            log.info("chat.ticket_auto_created", ticket_id=ticket_id, confidence=conf)
        except Exception:
            ticket_id = None

    return {"conversation_id": conversation_id, "response": ai_text, "confidence": round(conf, 2), "needs_agent": needs_agent, "ticket_id": ticket_id}


@router.get("/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str, user: dict = Depends(get_current_user)) -> dict:
    db = _db()
    try:
        result = db.table("messages").select("id, sender_type, sender_id, content, created_at").eq("conversation_id", conversation_id).order("created_at", desc=False).limit(100).execute()
        return {"data": result.data or [], "total": len(result.data or [])} if result else {"data": [], "total": 0}
    except Exception:
        return {"data": [], "total": 0}


@router.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: str):
    await websocket.accept()
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw) if raw else {}
            content = data.get("content", "")
            if not content:
                continue
            try:
                resp = await client.chat.completions.create(model=settings.AI_MODEL, messages=[{"role": "user", "content": content}])
                ai = resp.choices[0].message.content
            except Exception:
                ai = "Sorry, I'm having trouble right now."
            await websocket.send_json({"type": "ai_response", "conversation_id": conversation_id, "content": ai})
    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
