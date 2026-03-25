"""Authentication service — login, register, token verification."""

from __future__ import annotations

import uuid

import jwt

from backend.core.exceptions import AuthenticationError, ConflictError
from backend.core.logging import get_logger
from backend.core.security import create_access_token, decode_access_token, hash_password, verify_password
from backend.repositories.users import UserRepository

log = get_logger(__name__)

ROLE_REDIRECTS = {"user": "/chat", "agent": "/agent", "admin": "/admin", "viewer": "/chat"}


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def login(self, email: str, password: str) -> dict:
        log.info("auth.login_attempt", email=email)
        user = await self.user_repo.get_by_email(email)
        if not user:
            log.warning("auth.login_failed", reason="user_not_found", email=email)
            raise AuthenticationError("Invalid email or password")

        if not verify_password(password, user["password_hash"]):
            log.warning("auth.login_failed", reason="bad_password", email=email)
            raise AuthenticationError("Invalid email or password")

        role = user.get("role", "user")
        token = create_access_token({
            "sub": user["id"],
            "email": user["email"],
            "display_name": user.get("display_name", ""),
            "role": role,
            "tenant_id": user.get("tenant_id"),
        })
        log.info("auth.login_success", user_id=user["id"], role=role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role,
            "redirect": ROLE_REDIRECTS.get(role, "/chat"),
        }

    async def register(self, *, email: str, password: str, display_name: str, tenant_id: str, role: str = "user") -> dict:
        log.info("auth.register_attempt", email=email, role=role)
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ConflictError("A user with this email already exists")

        if role not in ("user", "agent", "admin"):
            role = "user"

        user = await self.user_repo.create({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "display_name": display_name,
            "tenant_id": tenant_id,
            "role": role,
        })
        log.info("auth.register_success", user_id=user["id"], role=role)
        return {k: v for k, v in user.items() if k != "password_hash"}

    async def get_current_user(self, token: str) -> dict:
        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")

        user_id: str | None = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token payload")

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User no longer exists")
        return {k: v for k, v in user.items() if k != "password_hash"}
