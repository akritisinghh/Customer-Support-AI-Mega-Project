"""Auth routes — login (returns role + redirect), register (with role), profile."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from backend.api.dependencies.auth import get_current_user
from backend.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_TENANT = "00000000-0000-0000-0000-000000000001"


def _svc():
    from backend.core.supabase import get_supabase_client
    from backend.repositories.users import UserRepository
    from backend.services.auth import AuthService
    return AuthService(user_repo=UserRepository(get_supabase_client()))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    return await _svc().login(body.email, body.password)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    return await _svc().register(
        email=body.email,
        password=body.password,
        display_name=body.display_name,
        tenant_id=DEFAULT_TENANT,
        role=body.role,
    )


@router.get("/me", response_model=UserResponse)
async def me(user: dict = Depends(get_current_user)):
    return user
