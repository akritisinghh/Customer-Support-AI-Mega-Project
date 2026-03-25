"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Filter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { cn, formatRelativeTime, getInitials, truncate } from "@/lib/utils";
import type { Channel } from "@/types";

interface MockConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  channel: Channel;
  status: "open" | "pending" | "closed";
  lastMessage: string;
  lastMessageTime: string;
  assignedAgent: string;
  messageCount: number;
  avatarColor: string;
}

const mockConversations: MockConversation[] = [
  {
    id: "conv-001",
    customerName: "Sarah Chen",
    customerEmail: "s.chen@email.com",
    channel: "chat",
    status: "open",
    lastMessage: "I'm still waiting for the password reset link to work.",
    lastMessageTime: "2026-03-22T14:30:00Z",
    assignedAgent: "Akriti Singh",
    messageCount: 12,
    avatarColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "conv-002",
    customerName: "Marcus Johnson",
    customerEmail: "m.johnson@corp.io",
    channel: "email",
    status: "pending",
    lastMessage:
      "Please find attached the invoice screenshot showing the discrepancy.",
    lastMessageTime: "2026-03-22T13:15:00Z",
    assignedAgent: "Ravi Kumar",
    messageCount: 6,
    avatarColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "conv-003",
    customerName: "Priya Patel",
    customerEmail: "priya.p@gmail.com",
    channel: "whatsapp",
    status: "open",
    lastMessage: "My order still says processing. It's been 5 days now.",
    lastMessageTime: "2026-03-22T12:45:00Z",
    assignedAgent: "Akriti Singh",
    messageCount: 8,
    avatarColor: "bg-green-100 text-green-700",
  },
  {
    id: "conv-004",
    customerName: "Alex Thompson",
    customerEmail: "a.thompson@startup.co",
    channel: "sms",
    status: "closed",
    lastMessage: "Thanks for resolving that! Great support as always.",
    lastMessageTime: "2026-03-22T11:30:00Z",
    assignedAgent: "Deepak Mehta",
    messageCount: 4,
    avatarColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "conv-005",
    customerName: "Emma Wilson",
    customerEmail: "emma.w@enterprise.com",
    channel: "slack",
    status: "open",
    lastMessage:
      "We need to upgrade before our renewal date. Can you send the pricing?",
    lastMessageTime: "2026-03-22T10:00:00Z",
    assignedAgent: "Akriti Singh",
    messageCount: 15,
    avatarColor: "bg-pink-100 text-pink-700",
  },
  {
    id: "conv-006",
    customerName: "David Kim",
    customerEmail: "d.kim@techcorp.dev",
    channel: "teams",
    status: "open",
    lastMessage:
      "The 403 error still happens on the /v2/users endpoint even with the new API key.",
    lastMessageTime: "2026-03-22T09:20:00Z",
    assignedAgent: "Ravi Kumar",
    messageCount: 9,
    avatarColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "conv-007",
    customerName: "Lina Rossi",
    customerEmail: "lina@design.studio",
    channel: "voice",
    status: "pending",
    lastMessage: "Voicemail left — requesting callback for pricing discussion.",
    lastMessageTime: "2026-03-21T16:45:00Z",
    assignedAgent: "Deepak Mehta",
    messageCount: 3,
    avatarColor: "bg-teal-100 text-teal-700",
  },
  {
    id: "conv-008",
    customerName: "James Wright",
    customerEmail: "james.w@megacorp.net",
    channel: "chat",
    status: "open",
    lastMessage: "The SAML metadata endpoint returns a 500. Here are the logs.",
    lastMessageTime: "2026-03-21T15:10:00Z",
    assignedAgent: "Ravi Kumar",
    messageCount: 18,
    avatarColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "conv-009",
    customerName: "Sophie Mueller",
    customerEmail: "sophie.m@eurocorp.de",
    channel: "email",
    status: "pending",
    lastMessage:
      "We need a full data export for all users under our tenant for GDPR.",
    lastMessageTime: "2026-03-21T09:45:00Z",
    assignedAgent: "Akriti Singh",
    messageCount: 5,
    avatarColor: "bg-rose-100 text-rose-700",
  },
  {
    id: "conv-010",
    customerName: "Carlos Rivera",
    customerEmail: "carlos@platform.io",
    channel: "teams",
    status: "open",
    lastMessage: "Webhook deliveries for order.completed events are all failing.",
    lastMessageTime: "2026-03-22T09:00:00Z",
    assignedAgent: "Deepak Mehta",
    messageCount: 7,
    avatarColor: "bg-cyan-100 text-cyan-700",
  },
];

const statusOptions = ["all", "open", "pending", "closed"] as const;
const channelOptions: (Channel | "all")[] = [
  "all",
  "chat",
  "email",
  "whatsapp",
  "sms",
  "slack",
  "teams",
  "voice",
];

const statusColorMap: Record<string, string> = {
  open: "bg-green-500",
  pending: "bg-amber-500",
  closed: "bg-slate-400",
};

export default function ConversationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const filtered = mockConversations.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (channelFilter !== "all" && c.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Conversations"
        subtitle={`${mockConversations.length} total conversations`}
      />

      <PageContainer>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Status:</span>
          </div>
          <div className="flex gap-1.5">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === s
                    ? "bg-brand-50 border-brand-200 text-brand-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <span className="text-sm font-medium text-slate-600">Channel:</span>
          <div className="flex gap-1.5 flex-wrap">
            {channelOptions.map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                  channelFilter === ch
                    ? "bg-brand-50 border-brand-200 text-brand-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {ch}
              </button>
            ))}
          </div>

          <Input
            placeholder="Search conversations..."
            className="ml-auto w-56 h-9 bg-white"
          />
        </div>

        {/* Conversation cards */}
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link
              key={conv.id}
              href={`/conversations/${conv.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className="relative shrink-0">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className={conv.avatarColor}>
                    {getInitials(conv.customerName)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                    statusColorMap[conv.status]
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {conv.customerName}
                  </span>
                  <Badge
                    variant={
                      conv.status === "open"
                        ? "success"
                        : conv.status === "pending"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {conv.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {truncate(conv.lastMessage, 90)}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <ChannelIcon channel={conv.channel} size="sm" />

                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">{conv.messageCount}</span>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-slate-400">
                    {formatRelativeTime(conv.lastMessageTime)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {conv.assignedAgent}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              No conversations match your filters
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try changing the status or channel filters
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
