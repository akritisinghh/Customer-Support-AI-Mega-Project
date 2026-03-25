"""Inbound webhook payload schemas (Twilio, email providers)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TwilioWebhookPayload(BaseModel):
    """Twilio inbound message webhook — fields arrive as form-encoded strings."""

    MessageSid: str | None = None
    AccountSid: str | None = None
    From: str | None = Field(default=None, alias="From")
    To: str | None = Field(default=None, alias="To")
    Body: str | None = None
    NumMedia: str | None = None
    MediaUrl0: str | None = None
    MediaContentType0: str | None = None
    SmsStatus: str | None = None
    SmsSid: str | None = None
    MessagingServiceSid: str | None = None


class EmailWebhookPayload(BaseModel):
    """Generic inbound email webhook (e.g. SendGrid Inbound Parse, AWS SES)."""

    from_addr: str
    to_addr: str
    subject: str | None = None
    body: str | None = None
    message_id: str | None = None
    headers: dict | None = None
    attachments: list[dict] | None = None
