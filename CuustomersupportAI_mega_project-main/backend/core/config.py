from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings

# Resolve the .env path relative to this file: backend/core/config.py -> backend/.env
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379"

    # --- Groq ---
    GROQ_API_KEY: str = ""

    # --- Twilio ---
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # --- Email ---
    EMAIL_API_KEY: str = ""
    EMAIL_FROM: str = ""

    # --- CORS ---
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- JWT / Auth ---
    JWT_SECRET_KEY: str = "change-me-in-production-super-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- AI / LLM (Groq) ---
    AI_MODEL: str = "llama-3.3-70b-versatile"
    AI_TEMPERATURE: float = 0.3
    AI_MAX_TOKENS: int = 2048

    # --- RAG ---
    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.7

    # --- Logging ---
    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
