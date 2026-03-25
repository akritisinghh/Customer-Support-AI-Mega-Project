"""Webhook handlers for inbound Twilio (WhatsApp/SMS), email, and Slack events."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from backend.core.exceptions import ValidationError
from backend.core.logging import get_logger
from backend.repositories.conversations import ConversationRepository
from backend.repositories.customers import CustomerRepository
from backend.repositories.messages import MessageRepository
from backend.repositories.tickets import TicketRepository

log = get_logger(__name__)


class WebhookService:
    def __init__(
        self,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
        customer_repo: CustomerRepository,
        ticket_repo: TicketRepository,
    ) -> None:
        self.conversation_repo = conversation_repo
        self.message_repo = message_repo
        self.customer_repo = customer_repo
        self.ticket_repo = ticket_repo

    # ---- Twilio (WhatsApp / SMS) ----

    async def handle_twilio_webhook(self, payload: dict) -> dict:
        """Parse inbound WhatsApp/SMS webhook from Twilio and create or update a conversation."""
        from_number = payload.get("From", "")
        body = payload.get("Body", "")
        message_sid = payload.get("MessageSid", "")

        if not from_number or not body:
            raise ValidationError("Missing From or Body in Twilio payload")

        is_whatsapp = from_number.startswith("whatsapp:")
        channel = "whatsapp" if is_whatsapp else "sms"
        phone_clean = from_number.replace("whatsapp:", "")

        tenant_id = payload.get("tenant_id", "")
        if not tenant_id:
            log.warning("webhooks.twilio.no_tenant", from_number=phone_clean)
            raise ValidationError("Cannot determine tenant_id from webhook payload")

        customer = await self.customer_repo.get_by_email(tenant_id, phone_clean)
        if not customer:
            customer = await self.customer_repo.create(
                {
                    "id": str(uuid.uuid4()),
                    "tenant_id": tenant_id,
                    "phone": phone_clean,
                    "display_name": phone_clean,
                    "email": "",
                    "metadata": {"source": channel},
                    "created_at": datetime.now(UTC).isoformat(),
                }
            )
            log.info("webhooks.twilio.customer_created", customer_id=customer["id"], channel=channel)

        conversations = await self.conversation_repo.list_by_tenant(
            tenant_id, customer_id=customer["id"], channel=channel, status="open", limit=1
        )
        existing = conversations["data"]

        if existing:
            conversation = existing[0]
        else:
            conversation = await self.conversation_repo.create(
                {
                    "id": str(uuid.uuid4()),
                    "tenant_id": tenant_id,
                    "customer_id": customer["id"],
                    "channel": channel,
                    "status": "open",
                    "metadata": {"source": "twilio"},
                    "created_at": datetime.now(UTC).isoformat(),
                }
            )
            log.info("webhooks.twilio.conversation_created", conversation_id=conversation["id"])

        message = await self.message_repo.create(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "conversation_id": conversation["id"],
                "sender_type": "customer",
                "sender_id": customer["id"],
                "channel": channel,
                "content": body,
                "content_type": "text",
                "metadata": {"twilio_sid": message_sid},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )

        log.info(
            "webhooks.twilio.message_processed",
            tenant_id=tenant_id,
            channel=channel,
            conversation_id=conversation["id"],
            message_id=message["id"],
        )
        return {"status": "ok", "conversation_id": conversation["id"], "message_id": message["id"]}

    # ---- Email ----

    async def handle_email_webhook(self, payload: dict) -> dict:
        """Parse inbound email webhook and create a ticket with conversation."""
        sender_email = payload.get("from", "") or payload.get("sender", "")
        subject = payload.get("subject", "No subject")
        body = payload.get("text", "") or payload.get("body", "")
        message_id_header = payload.get("message_id", "")

        if not sender_email:
            raise ValidationError("Missing sender email in webhook payload")

        tenant_id = payload.get("tenant_id", "")
        if not tenant_id:
            raise ValidationError("Cannot determine tenant_id from email webhook")

        customer = await self.customer_repo.get_by_email(tenant_id, sender_email)
        if not customer:
            customer = await self.customer_repo.create(
                {
                    "id": str(uuid.uuid4()),
                    "tenant_id": tenant_id,
                    "email": sender_email,
                    "display_name": sender_email.split("@")[0],
                    "metadata": {"source": "email"},
                    "created_at": datetime.now(UTC).isoformat(),
                }
            )

        conversation = await self.conversation_repo.create(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "customer_id": customer["id"],
                "channel": "email",
                "status": "open",
                "metadata": {"email_message_id": message_id_header},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )

        await self.message_repo.create(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "conversation_id": conversation["id"],
                "sender_type": "customer",
                "sender_id": customer["id"],
                "channel": "email",
                "content": body,
                "content_type": "text",
                "metadata": {"subject": subject, "email_message_id": message_id_header},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )

        ticket = await self.ticket_repo.create(
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "customer_id": customer["id"],
                "conversation_id": conversation["id"],
                "subject": subject,
                "status": "open",
                "priority": "medium",
                "metadata": {"source": "email"},
                "created_at": datetime.now(UTC).isoformat(),
            }
        )

        log.info(
            "webhooks.email.processed",
            tenant_id=tenant_id,
            conversation_id=conversation["id"],
            ticket_id=ticket["id"],
        )
        return {
            "status": "ok",
            "conversation_id": conversation["id"],
            "ticket_id": ticket["id"],
        }

    # ---- Slack ----

    async def handle_slack_webhook(self, payload: dict) -> dict:
        """Handle inbound Slack event (message, app_mention, etc.)."""
        event_type = payload.get("type", "")

        if event_type == "url_verification":
            return {"challenge": payload.get("challenge", "")}

        event = payload.get("event", {})
        slack_event_type = event.get("type", "")

        if slack_event_type not in ("message", "app_mention"):
            log.debug("webhooks.slack.ignored_event", event_type=slack_event_type)
            return {"status": "ignored"}

        text = event.get("text", "")
        user_id = event.get("user", "")
        channel_id = event.get("channel", "")

        log.info(
            "webhooks.slack.event",
            event_type=slack_event_type,
            slack_user=user_id,
            slack_channel=channel_id,
        )

        # TODO: map Slack user/channel to tenant and customer; create or
        # update conversation and message. Requires Slack integration config
        # per tenant.

        return {"status": "ok", "event_type": slack_event_type}
