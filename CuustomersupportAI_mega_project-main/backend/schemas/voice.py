"""Voice / speech request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class TranscribeRequest(BaseModel):
    audio_url: str | None = Field(default=None, description="URL of stored audio file")
    audio_format: str | None = Field(default=None, description="e.g. wav, mp3, webm")
    language: str | None = Field(default=None, description="BCP-47 language code")


class TranscribeResponse(BaseModel):
    transcript: str


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice: str | None = Field(default=None, description="Voice identifier (e.g. alloy, echo)")


class SynthesizeResponse(BaseModel):
    audio_url: str


class VoiceCallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str | None = None
    customer_id: str
    agent_id: str | None = None
    external_id: str | None = Field(default=None, description="Provider call SID")
    recording_url: str | None = None
    transcript: str | None = None
    summary: str | None = None
    duration_seconds: int | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")
    ended_at: str | None = None
