"""Domain enums mirroring PostgreSQL enum types in the Supabase schema."""

from enum import Enum


class ChannelEnum(str, Enum):
    CHAT = "chat"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    SLACK = "slack"
    TEAMS = "teams"
    VOICE = "voice"
    VIDEO = "video"


class SenderTypeEnum(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    SYSTEM = "system"
    AI = "ai"


class TicketStatusEnum(str, Enum):
    OPEN = "open"
    PENDING = "pending"
    RESOLVED = "resolved"
    CLOSED = "closed"


class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class DocumentStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    VIEWER = "viewer"
    API = "api"


class AgentStatusEnum(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
