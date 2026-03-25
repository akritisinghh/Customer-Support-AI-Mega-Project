"""Knowledge base routes — document CRUD, URL ingestion, collections."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status

from backend.api.dependencies.auth import get_current_user
from backend.schemas.knowledge import (
    DocumentListResponse,
    DocumentResponse,
    IngestURLRequest,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def _get_knowledge_service():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.knowledge import KnowledgeRepository
    from backend.services.knowledge import KnowledgeService

    db = get_supabase_client()
    return KnowledgeService(KnowledgeRepository(db))


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    user: dict = Depends(get_current_user),
):
    service = _get_knowledge_service()
    return await service.list_documents(user["tenant_id"])


@router.post(
    "/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    title: str = Form(...),
    source_type: str = Form(default="upload"),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    service = _get_knowledge_service()
    file_content = await file.read()
    return await service.upload_document(
        tenant_id=user["tenant_id"],
        title=title,
        source_type=source_type,
        file_content=file_content,
        filename=file.filename or "",
    )


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_knowledge_service()
    return await service.get_document(user["tenant_id"], document_id)


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    service = _get_knowledge_service()
    await service.delete_document(user["tenant_id"], document_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/ingest-url", response_model=DocumentResponse)
async def ingest_url(
    body: IngestURLRequest,
    user: dict = Depends(get_current_user),
):
    service = _get_knowledge_service()
    return await service.ingest_url(user["tenant_id"], url=str(body.url))


@router.get("/collections")
async def list_collections(
    user: dict = Depends(get_current_user),
) -> list:
    service = _get_knowledge_service()
    try:
        return await service.knowledge_repo.list_collections(user["tenant_id"])
    except AttributeError:
        return []


@router.post("/collections", status_code=status.HTTP_201_CREATED)
async def create_collection(
    body: dict,
    user: dict = Depends(get_current_user),
) -> dict:
    service = _get_knowledge_service()
    try:
        return await service.knowledge_repo.create_collection(
            {**body, "tenant_id": user["tenant_id"]}
        )
    except AttributeError:
        return {"status": "not_implemented", "message": "Collections support pending"}
