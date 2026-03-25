"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Bot,
  ExternalLink,
  Tag,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { cn, formatTime, formatDate, getInitials } from "@/lib/utils";
import type { SenderType, Channel } from "@/types";

interface DetailMessage {
  id: string;
  senderType: SenderType;
  senderName: string;
  content: string;
  time: string;
  channel?: Channel;
}

const conversation = {
  id: "conv-001",
  customerName: "Sarah Chen",
  customerEmail: "s.chen@email.com",
  customerPhone: "+1 (555) 012-3456",
  channel: "chat" as Channel,
  status: "open" as const,
  assignedAgent: "Akriti Singh",
  startedAt: "2026-03-22T10:00:00Z",
  sentiment: "neutral" as const,
};

const messages: DetailMessage[] = [
  {
    id: "dm1",
    senderType: "customer",
    senderName: "Sarah Chen",
    content: "Hi, I need help with my password reset.",
    time: "2026-03-22T10:00:00Z",
    channel: "chat",
  },
  {
    id: "dm2",
    senderType: "ai",
    senderName: "AI Assistant",
    content:
      "Hello Sarah! I'd be happy to help you with your password reset. Could you tell me what issue you're experiencing? For example, are you not receiving the reset email, or is the link not working?",
    time: "2026-03-22T10:01:00Z",
  },
  {
    id: "dm3",
    senderType: "customer",
    senderName: "Sarah Chen",
    content:
      "I click the link in the email but it says the token is expired. I've tried 3 times now and it's always the same error.",
    time: "2026-03-22T10:03:00Z",
    channel: "chat",
  },
  {
    id: "dm4",
    senderType: "ai",
    senderName: "AI Assistant",
    content:
      "I understand how frustrating that must be. Password reset tokens expire after 30 minutes for security reasons. It seems there might have been a delay between requesting the reset and clicking the link. I've generated a fresh reset link and sent it to s.chen@email.com. Please try it within the next 30 minutes.",
    time: "2026-03-22T10:04:00Z",
  },
  {
    id: "dm5",
    senderType: "system",
    senderName: "System",
    content: "Conversation transferred to Agent: Akriti Singh",
    time: "2026-03-22T10:05:00Z",
  },
  {
    id: "dm6",
    senderType: "agent",
    senderName: "Akriti Singh",
    content:
      "Hi Sarah, I'm Akriti and I'll be following up on this. I can see the AI already sent you a new reset link. Please let me know if it works — and if not, I can reset your password manually from our admin panel.",
    time: "2026-03-22T10:06:00Z",
  },
  {
    id: "dm7",
    senderType: "customer",
    senderName: "Sarah Chen",
    content:
      "Thank you Akriti. I just clicked the new link and it's working now! I'm on the password change screen.",
    time: "2026-03-22T10:10:00Z",
    channel: "chat",
  },
  {
    id: "dm8",
    senderType: "customer",
    senderName: "Sarah Chen",
    content:
      "Actually, quick question — can I also update my email on this account? I'd like to switch to my work email.",
    time: "2026-03-22T10:12:00Z",
    channel: "email",
  },
  {
    id: "dm9",
    senderType: "agent",
    senderName: "Akriti Singh",
    content:
      "Of course! You can change your email from Settings > Account > Email. You'll need to verify the new email address. Let me know if you need any help with that.",
    time: "2026-03-22T10:14:00Z",
  },
];

const previousTickets = [
  {
    id: "TKT-0892",
    subject: "Login failing on Safari",
    status: "resolved",
    date: "2026-03-10",
  },
  {
    id: "TKT-0756",
    subject: "Two-factor setup issues",
    status: "closed",
    date: "2026-02-18",
  },
];

function MessageItem({ message }: { message: DetailMessage }) {
  if (message.senderType === "system") {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {message.content} · {formatTime(message.time)}
        </span>
        <div className="flex-1 border-t border-slate-200" />
      </div>
    );
  }

  const isCustomer = message.senderType === "customer";
  const isAi = message.senderType === "ai";
  const channelSwitched = isCustomer && message.channel && message.channel !== "chat";

  return (
    <div
      className={cn("flex gap-2.5", isCustomer ? "self-start" : "self-end")}
      style={{ maxWidth: "75%" }}
    >
      {isCustomer && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isAi && <Bot className="h-3.5 w-3.5 text-brand-500" />}
          <span className="text-xs text-slate-500">{message.senderName}</span>
          {channelSwitched && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
              <Mail className="h-2.5 w-2.5" />
              via {message.channel}
            </Badge>
          )}
          <span className="text-[10px] text-slate-400">
            {formatTime(message.time)}
          </span>
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isCustomer
              ? "bg-slate-100 text-slate-800 rounded-tl-md"
              : isAi
              ? "bg-brand-600 text-white rounded-tr-md"
              : "bg-brand-500 text-white rounded-tr-md"
          )}
        >
          {message.content}
        </div>
      </div>
      {!isCustomer && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarFallback
            className={cn(
              "text-xs",
              isAi
                ? "bg-brand-100 text-brand-700"
                : "bg-emerald-100 text-emerald-700"
            )}
          >
            {isAi ? "AI" : getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function ConversationDetailPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title={conversation.customerName}
        subtitle={`Conversation ${conversation.id}`}
        actions={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm">
              <Phone className="h-4 w-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Video className="h-4 w-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main conversation area */}
        <div className="flex-1 flex flex-col">
          {/* Back link + channel indicator */}
          <div className="flex items-center gap-3 px-5 py-2 border-b border-slate-100 bg-white">
            <Link
              href="/conversations"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All conversations
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <ChannelIcon
                channel={conversation.channel}
                size="sm"
                showBackground={false}
              />
              <span className="text-xs text-slate-500 capitalize">
                Started via {conversation.channel}
              </span>
            </div>
            <Badge
              variant={conversation.status === "open" ? "success" : "secondary"}
              className="text-[10px]"
            >
              {conversation.status}
            </Badge>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400 font-medium">
                  {formatDate(conversation.startedAt)}
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-5 py-3 bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm">
                <Paperclip className="h-4 w-4 text-slate-400" />
              </Button>
              <Input
                placeholder="Type a message..."
                className="flex-1 h-10 bg-slate-50"
              />
              <Button size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar — customer context */}
        <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto scrollbar-thin shrink-0">
          <div className="p-5 space-y-5">
            {/* Customer info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-sm">
                  {getInitials(conversation.customerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {conversation.customerName}
                </h3>
                <p className="text-xs text-slate-500">
                  {conversation.customerEmail}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Email</span>
                  <span className="text-xs text-slate-700">
                    {conversation.customerEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Phone</span>
                  <span className="text-xs text-slate-700">
                    {conversation.customerPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Timezone</span>
                  <span className="text-xs text-slate-700">PST (UTC-8)</span>
                </div>
              </CardContent>
            </Card>

            {/* Conversation context */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                  Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Assigned to</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                        AS
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-700">
                      {conversation.assignedAgent}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Sentiment</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {conversation.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Channel</span>
                  <div className="flex items-center gap-1">
                    <ChannelIcon
                      channel={conversation.channel}
                      size="sm"
                      showBackground={false}
                    />
                    <span className="text-xs text-slate-700 capitalize">
                      {conversation.channel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Duration</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-700">14 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                    Tags
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {["auth", "password-reset", "account"].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Previous tickets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                  Previous Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {previousTickets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate group-hover:text-brand-600">
                        {t.id} — {t.subject}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {t.status} · {t.date}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-300 shrink-0" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Customer stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                  Customer Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Lifetime tickets</p>
                    <p className="text-lg font-bold text-slate-800">7</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg. CSAT</p>
                    <p className="text-lg font-bold text-slate-800">4.6</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">First contact</p>
                    <p className="text-xs font-medium text-slate-700">
                      Jan 2025
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Plan</p>
                    <p className="text-xs font-medium text-slate-700">Pro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
