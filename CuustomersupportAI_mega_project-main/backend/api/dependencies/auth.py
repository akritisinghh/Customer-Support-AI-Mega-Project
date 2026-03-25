"""Authentication + role-guard dependencies for FastAPI."""

from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.core.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return {
        "id": user_id,
        "email": payload.get("email"),
        "display_name": payload.get("display_name", ""),
        "role": payload.get("role"),
        "tenant_id": payload.get("tenant_id"),
    }


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


async def require_agent_or_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("agent", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent or admin access required")
    return user
