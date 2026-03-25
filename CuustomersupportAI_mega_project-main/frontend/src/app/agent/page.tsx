"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Ticket, MessageSquare, Send, CheckCircle2, Clock, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

type TicketRow = Record<string, unknown>;
type Msg = { id: string; sender_type: string; content: string; created_at: string };

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700", in_progress: "bg-blue-100 text-blue-700", resolved: "bg-green-100 text-green-700", closed: "bg-slate-100 text-slate-500",
};

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ ticket: TicketRow | null; messages: Msg[] }>({ ticket: null, messages: [] });
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try { const r = await api.agentTickets(); setTickets(r.data); } catch { setTickets([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try { const r = await api.agentTicketDetail(selectedId); setDetail({ ticket: r.ticket, messages: r.messages }); } catch { setDetail({ ticket: null, messages: [] }); }
    })();

    const iv = setInterval(async () => {
      try { const r = await api.agentTicketDetail(selectedId); setDetail({ ticket: r.ticket, messages: r.messages }); } catch {}
    }, 8000);
    return () => clearInterval(iv);
  }, [selectedId]);

  async function handleReply() {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      await api.agentReply(selectedId, reply.trim());
      setReply("");
      const r = await api.agentTicketDetail(selectedId);
      setDetail({ ticket: r.ticket, messages: r.messages });
      loadTickets();
    } catch {}
    setSending(false);
  }

  async function handleStatus(status: string) {
    if (!selectedId) return;
    try {
      await api.agentUpdateStatus(selectedId, status);
      loadTickets();
      const r = await api.agentTicketDetail(selectedId);
      setDetail({ ticket: r.ticket, messages: r.messages });
    } catch {}
  }

  const openCount = tickets.filter((t) => t.status === "open").length;
  const progressCount = tickets.filter((t) => t.status === "in_progress").length;

  return (
    <div className="flex flex-col h-full">
      <Header title="Agent Dashboard" subtitle="Manage customer queries and tickets" />
      <div className="flex-1 flex overflow-hidden">
        {/* Tickets list */}
        <div className="w-[360px] border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-900">Tickets</span>
              <span className="ml-2 text-xs text-yellow-600 bg-yellow-50 rounded-full px-2 py-0.5">{openCount} open</span>
              <span className="ml-1 text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">{progressCount} active</span>
            </div>
            <button onClick={loadTickets} className="p-1.5 rounded-lg hover:bg-slate-100"><RefreshCw className="h-4 w-4 text-slate-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400"><Ticket className="h-10 w-10 mb-3" /><p className="text-sm">No tickets yet</p></div>
            ) : (
              tickets.map((t) => (
                <button key={String(t.id)} onClick={() => setSelectedId(String(t.id))} className={cn("w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors", selectedId === String(t.id) && "bg-brand-50 border-l-2 border-l-brand-600")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">#{String(t.id).slice(0, 8)}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColors[String(t.status)] || "bg-slate-100 text-slate-500")}>{String(t.status)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">{String(t.subject || "Untitled")}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{t.created_at ? new Date(String(t.created_at)).toLocaleString() : ""}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-sm">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {detail.ticket && (
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{String(detail.ticket.subject || "Untitled")}</h3>
                    <p className="text-xs text-slate-500">Customer: {String(detail.ticket.customer_id || "").slice(0, 8)} | Priority: {String(detail.ticket.priority || "medium")}</p>
                  </div>
                  <div className="flex gap-2">
                    {String(detail.ticket.status) !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatus("resolved")} className="text-green-600 border-green-200 hover:bg-green-50"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Resolve</Button>
                    )}
                    {String(detail.ticket.status) === "open" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatus("in_progress")} className="text-blue-600 border-blue-200 hover:bg-blue-50"><Clock className="h-3.5 w-3.5 mr-1" />Take Over</Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detail.messages.map((m) => (
                  <div key={m.id} className={cn("flex gap-2", m.sender_type === "customer" ? "justify-end" : "justify-start")}>
                    {m.sender_type !== "customer" && (
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback className={cn("text-[10px] font-bold", m.sender_type === "ai" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")}>{m.sender_type === "ai" ? "AI" : "AG"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[70%] rounded-xl px-3 py-2 text-sm",
                      m.sender_type === "customer" ? "bg-brand-600 text-white" : m.sender_type === "ai" ? "bg-purple-50 text-purple-900 border border-purple-200" : "bg-green-50 text-green-900 border border-green-200")}>
                      <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.sender_type === "customer" ? "Customer" : m.sender_type === "ai" ? "AI Response" : "You"}</p>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      <p className="text-[10px] opacity-50 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {m.sender_type === "customer" && (
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5"><AvatarFallback className="text-[10px] bg-slate-200 text-slate-700 font-bold">CU</AvatarFallback></Avatar>
                    )}
                  </div>
                ))}
                {detail.messages.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No messages in this conversation yet.</p>}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <div className="flex items-end gap-3">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply..." rows={2}
                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  />
                  <Button onClick={handleReply} disabled={!reply.trim() || sending} className="h-12 w-12 rounded-xl shrink-0" size="icon">
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
