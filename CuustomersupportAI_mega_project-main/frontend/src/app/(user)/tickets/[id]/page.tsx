"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Brain,
  MoreHorizontal,
  ArrowUpRight,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatDate, formatTime, getInitials } from "@/lib/utils";
import type { SenderType } from "@/types";

const ticket = {
  id: "TKT-1001",
  subject: "Cannot reset password — expired token error",
  status: "open" as const,
  priority: "high" as const,
  channel: "chat" as const,
  customerName: "Sarah Chen",
  customerEmail: "s.chen@email.com",
  assignedAgent: "Akriti Singh",
  createdAt: "2026-03-22T10:00:00Z",
  updatedAt: "2026-03-22T14:30:00Z",
  slaDue: "2026-03-22T18:00:00Z",
  tags: ["auth", "password"],
  summary:
    "Customer is unable to reset their password because the reset token expired after 30 minutes. A new reset link was sent. The customer confirmed receipt and is currently testing the new link. Agent offered manual reset as a fallback.",
};

interface ThreadMessage {
  id: string;
  senderType: SenderType;
  senderName: string;
  content: string;
  time: string;
  isInternal?: boolean;
}

const threadMessages: ThreadMessage[] = [
  {
    id: "t1",
    senderType: "customer",
    senderName: "Sarah Chen",
    content:
      "Hi, I'm trying to reset my password but keep getting 'Token expired'. I've tried it three times now and it's always the same error. Can someone help?",
    time: "2026-03-22T10:00:00Z",
  },
  {
    id: "t2",
    senderType: "ai",
    senderName: "AI Assistant",
    content:
      "Hello Sarah! I apologize for the inconvenience. Password reset tokens are valid for 30 minutes for security. I've generated a fresh reset link and sent it to s.chen@email.com. Please check your inbox (and spam folder).",
    time: "2026-03-22T10:02:00Z",
  },
  {
    id: "t3",
    senderType: "system",
    senderName: "System",
    content: "Ticket assigned to Akriti Singh",
    time: "2026-03-22T10:02:30Z",
  },
  {
    id: "t4",
    senderType: "customer",
    senderName: "Sarah Chen",
    content:
      "Got the email! Let me try this new link now. It's been less than a minute so should be fresh.",
    time: "2026-03-22T10:05:00Z",
  },
  {
    id: "t5",
    senderType: "agent",
    senderName: "Akriti Singh",
    content:
      "Great, Sarah. I'm monitoring from my end. If this link doesn't work either, I can do a manual password reset from the admin console. Just let me know.",
    time: "2026-03-22T10:07:00Z",
  },
  {
    id: "t6",
    senderType: "agent",
    senderName: "Akriti Singh",
    content:
      "Internal note: Checked the auth logs. The customer's first three reset attempts all expired because they were requested over 3 hours before being clicked. Likely the customer was checking email late. No system issue detected.",
    time: "2026-03-22T10:15:00Z",
    isInternal: true,
  },
];

function ThreadItem({ message }: { message: ThreadMessage }) {
  if (message.senderType === "system") {
    return (
      <div className="flex items-center gap-2 py-2 justify-center">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-400 font-medium px-2">
          {message.content} · {formatTime(message.time)}
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    );
  }

  const isCustomer = message.senderType === "customer";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        message.isInternal
          ? "bg-amber-50 border border-amber-200"
          : "bg-white border border-slate-100"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            isCustomer
              ? "bg-violet-100 text-violet-700"
              : message.senderType === "ai"
              ? "bg-brand-100 text-brand-700"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          {message.senderType === "ai"
            ? "AI"
            : getInitials(message.senderName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800">
            {message.senderName}
          </span>
          {message.senderType === "ai" && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              AI
            </Badge>
          )}
          {message.isInternal && (
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">
              Internal
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(message.time)} at {formatTime(message.time)}
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title={ticket.id}
        subtitle={ticket.subject}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Assign
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Escalate
            </Button>
            <Button size="sm" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </Button>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <PageContainer>
        <div className="mb-4">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <Card className="border-brand-100 bg-gradient-to-br from-brand-50/50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-brand-100">
                    <Brain className="h-4 w-4 text-brand-600" />
                  </div>
                  <CardTitle className="text-base">AI Summary</CardTitle>
                  <Badge variant="default" className="text-[10px]">
                    Auto-generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {ticket.summary}
                </p>
              </CardContent>
            </Card>

            {/* Thread */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Conversation Thread
              </h3>
              {threadMessages.map((msg) => (
                <ThreadItem key={msg.id} message={msg} />
              ))}
            </div>

            {/* Reply area */}
            <Card>
              <CardContent className="pt-4">
                <textarea
                  placeholder="Write a reply..."
                  className="w-full h-24 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    <span className="text-xs text-slate-500">Internal note</span>
                  </label>
                  <Button size="sm">Send Reply</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Priority</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Channel</span>
                  <div className="flex items-center gap-1.5">
                    <ChannelIcon
                      channel={ticket.channel}
                      size="sm"
                      showBackground={false}
                    />
                    <span className="text-xs font-medium capitalize text-slate-700">
                      {ticket.channel}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Assigned to</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                        {getInitials(ticket.assignedAgent)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-slate-700">
                      {ticket.assignedAgent}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Created</span>
                  <span className="text-xs text-slate-700">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <CardTitle className="text-sm">SLA</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Response SLA</span>
                  <Badge variant="success" className="text-[10px]">
                    Met
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Resolution SLA</span>
                  <span className="text-xs font-medium text-amber-600">
                    3h 30m remaining
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                  <div className="bg-amber-500 h-1.5 rounded-full w-[56%]" />
                </div>
              </CardContent>
            </Card>

            {/* Customer card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {getInitials(ticket.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {ticket.customerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ticket.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Total tickets</p>
                    <p className="text-sm font-semibold text-slate-800">7</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg CSAT</p>
                    <p className="text-sm font-semibold text-slate-800">4.6/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Related Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="#"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      TKT-0892 — Login failing on Safari
                    </p>
                    <p className="text-[10px] text-slate-400">Resolved · 12 days ago</p>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      TKT-0756 — Two-factor setup issues
                    </p>
                    <p className="text-[10px] text-slate-400">Closed · 1 month ago</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
