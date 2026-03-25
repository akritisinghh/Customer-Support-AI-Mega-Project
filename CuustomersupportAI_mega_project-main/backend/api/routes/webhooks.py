"""Inbound webhook routes — Twilio, email, Slack event handlers."""

from __future__ import annotations

from fastapi import APIRouter, Request, Response, status

from backend.core.logging import get_logger

log = get_logger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _get_webhook_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.conversations import ConversationRepository
    from backend.repositories.customers import CustomerRepository
    from backend.repositories.messages import MessageRepository
    from backend.repositories.tickets import TicketRepository
    from backend.services.webhooks import WebhookService

    db = get_supabase_client()
    return WebhookService(
        conversation_repo=ConversationRepository(db),
        message_repo=MessageRepository(db),
        customer_repo=CustomerRepository(db),
        ticket_repo=TicketRepository(db),
    )


@router.post("/twilio")
async def twilio_webhook(request: Request) -> Response:
    """Handle inbound Twilio (WhatsApp/SMS) messages."""
    form = await request.form()
    log.info(
        "webhook.twilio.received",
        message_sid=form.get("MessageSid"),
        from_number=form.get("From"),
    )
    service = _get_webhook_service()
    payload = dict(form)
    result = await service.handle_twilio_webhook(payload)
    return Response(
        content=f'<Response>{result.get("status", "ok")}</Response>',
        media_type="application/xml",
        status_code=status.HTTP_200_OK,
    )


@router.post("/email")
async def email_webhook(request: Request) -> Response:
    """Handle inbound email events (e.g. SendGrid Inbound Parse, AWS SES)."""
    body = await request.json()
    log.info(
        "webhook.email.received",
        message_id=body.get("message_id"),
    )
    service = _get_webhook_service()
    await service.handle_email_webhook(body)
    return Response(
        content="ok",
        media_type="text/plain",
        status_code=status.HTTP_200_OK,
    )


@router.post("/slack")
async def slack_webhook(request: Request) -> Response:
    """Handle Slack event callbacks."""
    body = await request.json()

    if body.get("type") == "url_verification":
        return Response(
            content=body.get("challenge", ""),
            media_type="text/plain",
            status_code=status.HTTP_200_OK,
        )

    log.info(
        "webhook.slack.received",
        event_type=body.get("event", {}).get("type"),
    )
    service = _get_webhook_service()
    await service.handle_slack_webhook(body)
    return Response(
        content="ok",
        media_type="text/plain",
        status_code=status.HTTP_200_OK,
    )
