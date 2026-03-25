"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.core.exceptions import register_exception_handlers
from backend.core.logging import get_logger, setup_logging

setup_logging(settings.LOG_LEVEL)
log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("app.startup", version="0.1.0")
    yield
    log.info("app.shutdown")


app = FastAPI(
    title="Nexora AI Customer Support API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


# ── Router registration ─────────────────────────────────────────────
from backend.api.routes.admin import router as admin_router  # noqa: E402
from backend.api.routes.agent import router as agent_router  # noqa: E402
from backend.api.routes.analytics import router as analytics_router  # noqa: E402
from backend.api.routes.auth import router as auth_router  # noqa: E402
from backend.api.routes.chat import router as chat_router  # noqa: E402
from backend.api.routes.conversations import router as conversations_router  # noqa: E402
from backend.api.routes.copilot import router as copilot_router  # noqa: E402
from backend.api.routes.customers import router as customers_router  # noqa: E402
from backend.api.routes.knowledge import router as knowledge_router  # noqa: E402
from backend.api.routes.tickets import router as tickets_router  # noqa: E402
from backend.api.routes.voice import router as voice_router  # noqa: E402
from backend.api.routes.webhooks import router as webhooks_router  # noqa: E402

API_V1 = "/api/v1"

app.include_router(auth_router, prefix=API_V1)
app.include_router(conversations_router, prefix=API_V1)
app.include_router(tickets_router, prefix=API_V1)
app.include_router(customers_router, prefix=API_V1)
app.include_router(chat_router, prefix=API_V1)
app.include_router(copilot_router, prefix=API_V1)
app.include_router(voice_router, prefix=API_V1)
app.include_router(knowledge_router, prefix=API_V1)
app.include_router(admin_router, prefix=API_V1)
app.include_router(agent_router, prefix=API_V1)
app.include_router(webhooks_router, prefix=API_V1)
app.include_router(analytics_router, prefix=API_V1)
