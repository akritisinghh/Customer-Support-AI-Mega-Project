"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Ticket, BarChart3, Bot, UserCheck, Activity, RefreshCw, Loader2, UserCog, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

const roleBadge: Record<string, string> = {
  admin: "bg-red-100 text-red-700", agent: "bg-blue-100 text-blue-700", user: "bg-slate-100 text-slate-700", viewer: "bg-slate-100 text-slate-500",
};
const statusBadge: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700", in_progress: "bg-blue-100 text-blue-700", resolved: "bg-green-100 text-green-700", closed: "bg-slate-100 text-slate-500",
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "tickets">("overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, u, t] = await Promise.all([api.adminAnalytics(), api.adminUsers(), api.adminTickets()]);
      setAnalytics(a);
      setUsers(u.data);
      setTickets(t.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const stats = [
    { label: "Total Users", value: analytics.total_users || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Open Tickets", value: analytics.open_tickets || 0, icon: Ticket, color: "text-yellow-600 bg-yellow-50" },
    { label: "Resolved", value: analytics.resolved_tickets || 0, icon: UserCheck, color: "text-green-600 bg-green-50" },
    { label: "AI Resolution", value: `${analytics.ai_resolution_rate || 0}%`, icon: Bot, color: "text-purple-600 bg-purple-50" },
    { label: "Conversations", value: analytics.total_conversations || 0, icon: Activity, color: "text-brand-600 bg-brand-50" },
    { label: "AI Responses", value: analytics.ai_responses || 0, icon: BarChart3, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Admin Dashboard" subtitle="System overview and management" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="border-slate-200/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", s.color)}><s.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(["overview", "users", "tickets"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", tab === t ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
          <div className="flex-1" />
          <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100"><RefreshCw className="h-4 w-4 text-slate-500" /></button>
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Users className="h-4 w-4" />Recent Users</CardTitle></CardHeader>
              <CardContent className="pt-0">
                {users.slice(0, 8).map((u) => (
                  <div key={String(u.id)} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-brand-100 text-brand-700">{String(u.display_name || u.email || "?").charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{String(u.display_name || u.email)}</p>
                        <p className="text-[11px] text-slate-400">{String(u.email)}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", roleBadge[String(u.role)] || "bg-slate-100 text-slate-500")}>{String(u.role)}</span>
                  </div>
                ))}
                {users.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No users yet</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Ticket className="h-4 w-4" />Recent Tickets</CardTitle></CardHeader>
              <CardContent className="pt-0">
                {tickets.slice(0, 8).map((t) => (
                  <div key={String(t.id)} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{String(t.subject || "Untitled")}</p>
                      <p className="text-[11px] text-slate-400">{t.created_at ? new Date(String(t.created_at)).toLocaleString() : ""}</p>
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full ml-3 shrink-0", statusBadge[String(t.status)] || "bg-slate-100 text-slate-500")}>{String(t.status)}</span>
                  </div>
                ))}
                {tickets.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No tickets yet</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "users" && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Email</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={String(u.id)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-brand-100 text-brand-700">{String(u.display_name || u.email || "?").charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium text-slate-800">{String(u.display_name || "—")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{String(u.email)}</td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", roleBadge[String(u.role)] || "bg-slate-100")}>{String(u.role)}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-400">{u.created_at ? new Date(String(u.created_at)).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No users found</p>}
            </CardContent>
          </Card>
        )}

        {tab === "tickets" && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">ID</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Subject</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Priority</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Created</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={String(t.id)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">#{String(t.id).slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-slate-800 max-w-[250px] truncate">{String(t.subject || "Untitled")}</td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusBadge[String(t.status)] || "bg-slate-100")}>{String(t.status)}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{String(t.priority || "—")}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{t.created_at ? new Date(String(t.created_at)).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{t.assigned_agent_id ? String(t.assigned_agent_id).slice(0, 8) : <span className="text-yellow-600">Unassigned</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tickets.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No tickets found</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
