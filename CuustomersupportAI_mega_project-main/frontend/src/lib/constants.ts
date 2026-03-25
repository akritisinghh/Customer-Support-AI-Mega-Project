export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
export const API_V1 = `${API_BASE_URL}/api/v1`;

export const CHANNELS = [
  { value: "chat", label: "Live Chat", icon: "MessageSquare" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
  { value: "sms", label: "SMS", icon: "Smartphone" },
  { value: "slack", label: "Slack", icon: "Hash" },
  { value: "teams", label: "Teams", icon: "Users" },
  { value: "voice", label: "Voice", icon: "Phone" },
  { value: "video", label: "Video", icon: "Video" },
] as const;

export const TICKET_STATUSES = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
] as const;

export const SENDER_TYPES = ["customer", "agent", "system", "ai"] as const;

export const USER_ROLES = ["admin", "agent", "viewer"] as const;
