"use client";

import {
  Activity,
  Server,
  Radio,
  Brain,
  Database,
  MessageSquare,
  BarChart3,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  Bot,
  Shield,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ServiceStatus = "healthy" | "degraded" | "down";

interface ServiceHealth {
  name: string;
  icon: React.ElementType;
  status: ServiceStatus;
  responseTime: string;
  uptime: string;
}

const services: ServiceHealth[] = [
  {
    name: "Backend API",
    icon: Server,
    status: "healthy",
    responseTime: "42ms",
    uptime: "99.98%",
  },
  {
    name: "WebSocket",
    icon: Radio,
    status: "healthy",
    responseTime: "8ms",
    uptime: "99.95%",
  },
  {
    name: "AI Service",
    icon: Brain,
    status: "degraded",
    responseTime: "320ms",
    uptime: "99.82%",
  },
  {
    name: "Database",
    icon: Database,
    status: "healthy",
    responseTime: "12ms",
    uptime: "99.99%",
  },
];

const statusStyle: Record<ServiceStatus, { dot: string; bg: string; text: string; label: string }> = {
  healthy: { dot: "bg-green-500", bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Healthy" },
  degraded: { dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Degraded" },
  down: { dot: "bg-red-500", bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Down" },
};

interface LogEvent {
  id: string;
  icon: React.ElementType;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
}

const recentEvents: LogEvent[] = [
  { id: "e1", icon: Ticket, message: 'Ticket #1042 created — "Unable to process refund"', time: "14:32", type: "info" },
  { id: "e2", icon: UserCheck, message: "Agent Sarah Chen went online", time: "14:28", type: "success" },
  { id: "e3", icon: Bot, message: "AI response generated for conversation #3891", time: "14:25", type: "info" },
  { id: "e4", icon: AlertTriangle, message: "AI service latency spike — 450ms avg", time: "14:20", type: "warning" },
  { id: "e5", icon: CheckCircle2, message: "Ticket #1038 resolved by James Wilson", time: "14:15", type: "success" },
  { id: "e6", icon: Shield, message: "API key sk-crm-...f9a2 authenticated from 203.0.113.42", time: "14:10", type: "info" },
  { id: "e7", icon: Bot, message: "Knowledge base re-indexed — 564 chunks updated", time: "14:05", type: "success" },
  { id: "e8", icon: UserCheck, message: "Agent David Kim went online", time: "14:00", type: "success" },
  { id: "e9", icon: Ticket, message: 'Ticket #1040 escalated to priority "High"', time: "13:55", type: "warning" },
  { id: "e10", icon: Bot, message: "Auto-summary generated for conversation #3887", time: "13:50", type: "info" },
];

const eventTypeStyle: Record<string, string> = {
  info: "text-blue-500 bg-blue-50",
  success: "text-green-500 bg-green-50",
  warning: "text-amber-500 bg-amber-50",
};

export default function MonitoringPage() {
  return (
    <>
      <Header title="System Monitoring" subtitle="Real-time service health and events" />
      <PageContainer>
        <div className="space-y-6">
          {/* Service health cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc) => {
              const style = statusStyle[svc.status];
              const SvcIcon = svc.icon;
              return (
                <Card
                  key={svc.name}
                  className={cn(
                    "border hover:shadow-md transition-shadow",
                    style.bg
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <SvcIcon className="h-5 w-5 text-slate-600" />
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("h-2.5 w-2.5 rounded-full animate-pulse", style.dot)}
                        />
                        <span className={cn("text-xs font-semibold", style.text)}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      {svc.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Latency: <strong className="text-slate-700">{svc.responseTime}</strong>
                      </span>
                      <span>
                        Uptime: <strong className="text-slate-700">{svc.uptime}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active conversations */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                  <MessageSquare className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Conversations
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    127
                    <span className="ml-2 text-sm font-normal text-green-600">
                      Live
                    </span>
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <span className="text-xs text-green-600 font-medium">Real-time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events + Chart placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent events */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand-600" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentEvents.map((evt) => {
                    const EvtIcon = evt.icon;
                    return (
                      <div
                        key={evt.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                            eventTypeStyle[evt.type]
                          )}
                        >
                          <EvtIcon className="h-4 w-4" />
                        </div>
                        <p className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                          {evt.message}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {evt.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Chart placeholders */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-36 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-slate-300" />
                    <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                      Chart coming soon
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Current</span>
                    <span className="font-semibold text-green-600">0.12%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">API Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-36 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                    <BarChart3 className="h-6 w-6 text-slate-300" />
                    <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                      Chart coming soon
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">P95 Latency</span>
                    <span className="font-semibold text-slate-900">142ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
