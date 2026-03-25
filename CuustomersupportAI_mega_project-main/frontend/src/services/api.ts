import { API_V1 } from "@/lib/constants";
import { getToken } from "@/lib/auth";

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(response.status, err.code || "ERROR", err.detail || err.message || response.statusText);
    }
    return response.json();
  }

  /* Auth */
  login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string; role: string; redirect: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  }
  register(email: string, password: string, displayName: string, role: string) {
    return this.request<{ id: string; email: string; display_name: string; role: string }>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, display_name: displayName, role }) });
  }
  me() {
    return this.request<{ id: string; email: string; display_name: string; role: string; tenant_id: string }>("/auth/me");
  }

  /* Chat */
  chatCompletion(message: string, conversationId: string) {
    return this.request<{ conversation_id: string; response: string; confidence: number; needs_agent: boolean; ticket_id: string | null }>("/chat/completions", { method: "POST", body: JSON.stringify({ message, conversation_id: conversationId }) });
  }
  chatHistory(conversationId: string) {
    return this.request<{ data: { id: string; sender_type: string; content: string; created_at: string }[]; total: number }>(`/chat/history/${conversationId}`);
  }

  /* Agent */
  agentTickets(status?: string) { return this.request<{ data: Record<string, unknown>[]; total: number }>(`/agent/tickets${status ? `?status=${status}` : ""}`); }
  agentTicketDetail(id: string) { return this.request<{ ticket: Record<string, unknown> | null; messages: { id: string; sender_type: string; content: string; created_at: string }[] }>(`/agent/tickets/${id}`); }
  agentReply(ticketId: string, content: string) { return this.request<{ message_id: string }>(`/agent/tickets/${ticketId}/reply`, { method: "POST", body: JSON.stringify({ content }) }); }
  agentUpdateStatus(ticketId: string, status: string) { return this.request<{ updated: boolean }>(`/agent/tickets/${ticketId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); }

  /* Admin */
  adminUsers() { return this.request<{ data: Record<string, unknown>[]; total: number }>("/admin/users"); }
  adminTickets() { return this.request<{ data: Record<string, unknown>[]; total: number }>("/admin/all-tickets"); }
  adminAnalytics() { return this.request<Record<string, number>>("/admin/analytics"); }
  adminAssign(ticketId: string, agentId: string) { return this.request<{ assigned: boolean }>(`/admin/tickets/${ticketId}/assign`, { method: "PATCH", body: JSON.stringify({ agent_id: agentId }) }); }
}

export class ApiError extends Error {
  status: number; code: string;
  constructor(s: number, c: string, m: string) { super(m); this.status = s; this.code = c; this.name = "ApiError"; }
}

export const api = new ApiClient(API_V1);
