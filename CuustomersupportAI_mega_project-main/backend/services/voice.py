"""Voice service — transcription, synthesis, call management, and summaries."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from groq import AsyncGroq

from backend.core.config import settings
from backend.core.exceptions import ExternalServiceError, NotFoundError
from backend.core.logging import get_logger
from backend.core.supabase import get_supabase_client

log = get_logger(__name__)

CALLS_TABLE = "voice_calls"


class VoiceService:
    def __init__(self) -> None:
        self.groq = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.db = get_supabase_client()

    async def transcribe(self, audio_file: bytes, *, filename: str = "audio.webm") -> str:
        """Stub: Groq does not support audio transcription (STT).
        Configure OpenAI Whisper or another STT provider for production use.
        """
        log.warning(
            "voice.transcribe_stub",
            filename=filename,
            size_bytes=len(audio_file),
        )
        return (
            "[Transcription not available - Groq does not support STT. "
            "Configure OpenAI Whisper for production.]"
        )

    async def synthesize(self, text: str, *, voice: str = "alloy") -> str:
        """Stub: Groq does not support text-to-speech (TTS).
        Configure OpenAI TTS or another TTS provider for production use.
        """
        log.warning("voice.synthesize_stub", text_length=len(text), voice=voice)
        placeholder_id = str(uuid.uuid4())
        return f"https://placeholder.tts/audio/{placeholder_id}.mp3"

    async def get_call(self, tenant_id: str, call_id: str) -> dict:
        result = (
            self.db.table(CALLS_TABLE)
            .select("*")
            .eq("tenant_id", tenant_id)
            .eq("id", call_id)
            .maybe_single()
            .execute()
        )
        if not result.data:
            raise NotFoundError("Call", call_id)
        return result.data

    async def register_call(self, tenant_id: str, data: dict) -> dict:
        payload = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "conversation_id": data.get("conversation_id"),
            "customer_id": data.get("customer_id"),
            "agent_id": data.get("agent_id"),
            "external_id": data.get("external_id"),
            "recording_url": data.get("recording_url"),
            "duration_seconds": data.get("duration_seconds", 0),
            "created_at": datetime.now(UTC).isoformat(),
        }
        result = self.db.table(CALLS_TABLE).insert(payload).execute()
        call = result.data[0]
        log.info("voice.call_registered", tenant_id=tenant_id, call_id=call["id"])
        return call

    async def generate_call_summary(self, tenant_id: str, call_id: str) -> str:
        call = await self.get_call(tenant_id, call_id)
        transcript = call.get("transcript", "")

        if not transcript:
            log.warning("voice.no_transcript", call_id=call_id)
            return "No transcript available for summarization."

        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Summarize the following voice call transcript. "
                            "Include the main topic, resolution, and any follow-up actions."
                        ),
                    },
                    {"role": "user", "content": transcript},
                ],
            )
            summary = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("voice.summary_error", call_id=call_id, error=str(exc))
            raise ExternalServiceError("Groq", "Failed to generate call summary") from exc

        self.db.table(CALLS_TABLE).update({"summary": summary}).eq("id", call_id).execute()
        log.info("voice.summary_generated", tenant_id=tenant_id, call_id=call_id)
        return summary
