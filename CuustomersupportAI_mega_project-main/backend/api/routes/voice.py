"""Voice routes — transcription, synthesis, call management."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile, status

from backend.api.dependencies.auth import get_current_user
from backend.schemas.voice import (
    SynthesizeRequest,
    SynthesizeResponse,
    TranscribeResponse,
    VoiceCallResponse,
)

router = APIRouter(prefix="/voice", tags=["voice"])


def _get_voice_service():
    from backend.services.voice import VoiceService

    return VoiceService()


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    service = _get_voice_service()
    audio_bytes = await file.read()
    transcript = await service.transcribe(
        audio_bytes, filename=file.filename or "audio.webm",
    )
    return TranscribeResponse(transcript=transcript)


@router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize(
    body: SynthesizeRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_voice_service()
    audio_url = await service.synthesize(
        body.text, voice=body.voice or "alloy",
    )
    return SynthesizeResponse(audio_url=audio_url)


@router.get("/calls/{call_id}", response_model=VoiceCallResponse)
async def get_call(
    call_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_voice_service()
    return await service.get_call(user["tenant_id"], call_id)


@router.post(
    "/calls",
    response_model=VoiceCallResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_call(
    body: dict,
    user: dict = Depends(get_current_user),
):
    service = _get_voice_service()
    return await service.register_call(user["tenant_id"], body)


@router.post("/calls/{call_id}/summary")
async def get_call_summary(
    call_id: str,
    user: dict = Depends(get_current_user),
) -> dict:
    service = _get_voice_service()
    summary = await service.generate_call_summary(user["tenant_id"], call_id)
    return {"call_id": call_id, "summary": summary}
