export type Channel =
  | "chat"
  | "email"
  | "whatsapp"
  | "sms"
  | "slack"
  | "teams"
  | "voice"
  | "video";

export type SenderType = "customer" | "agent" | "system" | "ai";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export type Priority = "low" | "medium" | "high" | "urgent";

export type UserRole = "admin" | "agent" | "viewer";

export type AgentStatus = "available" | "busy" | "offline";

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  tenant_id: string;
  user_id: string;
  display_name: string;
  status: AgentStatus;
  skills: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  external_id?: string;
  email?: string;
  phone?: string;
  display_name: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer?: Customer;
  channel: Channel;
  status: "open" | "pending" | "closed";
  assigned_agent_id?: string;
  assigned_agent?: Agent;
  metadata?: Record<string, unknown>;
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id?: string;
  channel: Channel;
  content: string;
  content_type: "text" | "html";
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  tenant_id: string;
  conversation_id?: string;
  customer_id: string;
  customer?: Customer;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  assigned_agent_id?: string;
  assigned_agent?: Agent;
  sla_due_at?: string;
  sla_breach_at?: string;
  summary?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface KnowledgeDocument {
  id: string;
  tenant_id: string;
  title: string;
  source_type: "upload" | "url" | "api";
  source_ref?: string;
  status: DocumentStatus;
  version: number;
  chunk_count?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VoiceCall {
  id: string;
  tenant_id: string;
  conversation_id?: string;
  customer_id: string;
  agent_id?: string;
  external_id?: string;
  recording_url?: string;
  transcript?: string;
  summary?: string;
  duration_seconds?: number;
  created_at: string;
  ended_at?: string;
}

export interface AnalyticsDashboard {
  csat_score: number;
  avg_resolution_time_minutes: number;
  avg_first_response_minutes: number;
  total_conversations: number;
  total_tickets: number;
  ai_resolution_rate: number;
  human_resolution_rate: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  channel_breakdown: Record<Channel, number>;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_preview: string;
  scopes: string[];
  expires_at?: string;
  created_at: string;
  last_used_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  next_cursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
