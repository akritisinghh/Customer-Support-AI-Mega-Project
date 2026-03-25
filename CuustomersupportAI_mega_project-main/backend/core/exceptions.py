"""Custom exception hierarchy and FastAPI exception handlers."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(
        self,
        status_code: int = 500,
        code: str = "INTERNAL_ERROR",
        message: str = "An unexpected error occurred.",
        details: Any | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource", resource_id: Any = None) -> None:
        detail = f"{resource} not found" + (f": {resource_id}" if resource_id else "")
        super().__init__(status_code=404, code="NOT_FOUND", message=detail)


class AuthenticationError(AppException):
    def __init__(self, message: str = "Not authenticated") -> None:
        super().__init__(status_code=401, code="UNAUTHORIZED", message=message)


class AuthorizationError(AppException):
    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(status_code=403, code="FORBIDDEN", message=message)


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists") -> None:
        super().__init__(status_code=409, code="CONFLICT", message=message)


class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed") -> None:
        super().__init__(status_code=422, code="VALIDATION_ERROR", message=message)


class ExternalServiceError(AppException):
    def __init__(self, service: str = "External", message: str = "Service call failed") -> None:
        super().__init__(status_code=502, code="EXTERNAL_SERVICE_ERROR", message=f"{service}: {message}")


class RateLimitError(AppException):
    def __init__(self, message: str = "Rate limit exceeded") -> None:
        super().__init__(status_code=429, code="RATE_LIMIT", message=message)


# Aliases for backward compatibility
NotFoundException = NotFoundError
UnauthorizedException = AuthenticationError
ForbiddenException = AuthorizationError


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message, "details": exc.details},
        )
