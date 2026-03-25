"""Auth request / response schemas."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=255)
    role: Literal["user", "agent", "admin"] = "user"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    redirect: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str | None = None
    display_name: str | None = None
    role: str | None = None
    tenant_id: str | None = None
    created_at: str | None = None
