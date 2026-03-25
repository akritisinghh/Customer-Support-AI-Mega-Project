"""Knowledge-base request / response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from backend.models.enums import DocumentStatusEnum


class DocumentUpload(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    source_type: str = Field(..., description="upload | url | api")


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    title: str
    source_type: str
    source_ref: str | None = None
    status: DocumentStatusEnum
    version: int | None = None
    chunk_count: int | None = None
    metadata: dict | None = None
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")
    updated_at: str = Field(..., description="ISO 8601 UTC timestamp")


class DocumentListResponse(BaseModel):
    data: list[DocumentResponse]
    total: int
    next_cursor: str | None = None


class IngestURLRequest(BaseModel):
    url: HttpUrl
    collection_id: str | None = None
