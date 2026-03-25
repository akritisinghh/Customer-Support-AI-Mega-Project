"use client";

import React from "react";
import Link from "next/link";
import { Plus, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { Channel, Priority, TicketStatus } from "@/types";

interface MockTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  channel: Channel;
  customerName: string;
  assignedAgent: string;
  createdAt: string;
  slaDue: string;
  tags: string[];
}

const mockTickets: MockTicket[] = [
  {
    id: "TKT-1001",
    subject: "Cannot reset password — expired token error",
    status: "open",
    priority: "high",
    channel: "chat",
    customerName: "Sarah Chen",
    assignedAgent: "Akriti Singh",
    createdAt: "2026-03-22T10:00:00Z",
    slaDue: "2026-03-22T18:00:00Z",
    tags: ["auth", "password"],
  },
  {
    id: "TKT-1002",
    subject: "Billing discrepancy on March invoice",
    status: "pending",
    priority: "medium",
    channel: "email",
    customerName: "Marcus Johnson",
    assignedAgent: "Ravi Kumar",
    createdAt: "2026-03-21T15:30:00Z",
    slaDue: "2026-03-23T15:30:00Z",
    tags: ["billing"],
  },
  {
    id: "TKT-1003",
    subject: "Order #4829 shipment tracking not updating",
    status: "open",
    priority: "high",
    channel: "whatsapp",
    customerName: "Priya Patel",
    assignedAgent: "Akriti Singh",
    createdAt: "2026-03-22T08:00:00Z",
    slaDue: "2026-03-22T16:00:00Z",
    tags: ["shipping", "orders"],
  },
  {
    id: "TKT-1004",
    subject: "Feature request: dark mode for dashboard",
    status: "closed",
    priority: "low",
    channel: "slack",
    customerName: "Emma Wilson",
    assignedAgent: "Deepak Mehta",
    createdAt: "2026-03-18T09:00:00Z",
    slaDue: "2026-03-25T09:00:00Z",
    tags: ["feature-request"],
  },
  {
    id: "TKT-1005",
    subject: "API returns 403 on /v2/users endpoint",
    status: "open",
    priority: "urgent",
    channel: "teams",
    customerName: "David Kim",
    assignedAgent: "Ravi Kumar",
    createdAt: "2026-03-22T07:15:00Z",
    slaDue: "2026-03-22T11:15:00Z",
    tags: ["api", "auth"],
  },
  {
    id: "TKT-1006",
    subject: "Subscription upgrade from Pro to Enterprise",
    status: "pending",
    priority: "medium",
    channel: "chat",
    customerName: "Lina Rossi",
    assignedAgent: "Akriti Singh",
    createdAt: "2026-03-21T14:00:00Z",
    slaDue: "2026-03-23T14:00:00Z",
    tags: ["billing", "upgrade"],
  },
  {
    id: "TKT-1007",
    subject: "SSO configuration failing with SAML provider",
    status: "open",
    priority: "high",
    channel: "email",
    customerName: "James Wright",
    assignedAgent: "Deepak Mehta",
    createdAt: "2026-03-22T06:30:00Z",
    slaDue: "2026-03-22T14:30:00Z",
    tags: ["sso", "enterprise"],
  },
  {
    id: "TKT-1008",
    subject: "Mobile app crashes on Android 14 after login",
    status: "resolved",
    priority: "urgent",
    channel: "sms",
    customerName: "Alex Thompson",
    assignedAgent: "Ravi Kumar",
    createdAt: "2026-03-20T11:00:00Z",
    slaDue: "2026-03-20T15:00:00Z",
    tags: ["mobile", "bug"],
  },
  {
    id: "TKT-1009",
    subject: "Data export request for GDPR compliance",
    status: "pending",
    priority: "medium",
    channel: "email",
    customerName: "Sophie Mueller",
    assignedAgent: "Akriti Singh",
    createdAt: "2026-03-21T09:45:00Z",
    slaDue: "2026-03-28T09:45:00Z",
    tags: ["gdpr", "compliance"],
  },
  {
    id: "TKT-1010",
    subject: "Webhook delivery failures for event notifications",
    status: "open",
    priority: "high",
    channel: "teams",
    customerName: "Carlos Rivera",
    assignedAgent: "Deepak Mehta",
    createdAt: "2026-03-22T09:20:00Z",
    slaDue: "2026-03-22T17:20:00Z",
    tags: ["webhooks", "integrations"],
  },
];

const statusFilters: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const priorityFilters: Priority[] = ["urgent", "high", "medium", "low"];

export default function TicketsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tickets"
        subtitle={`${mockTickets.length} total tickets`}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        }
      />

      <PageContainer>
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <button
                key={status}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  status === "open"
                    ? "bg-brand-50 border-brand-200 text-brand-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex flex-wrap gap-2">
            {priorityFilters.map((priority) => (
              <button
                key={priority}
                className="px-3 py-1.5 rounded-full text-xs font-medium border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Input
              placeholder="Search tickets..."
              className="w-56 h-9 bg-white"
            />
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More
            </Button>
          </div>
        </div>

        {/* Tickets table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_90px_56px_130px_110px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ticket
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ch.
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Created
            </span>
          </div>

          {/* Table rows */}
          {mockTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="grid grid-cols-[1fr_100px_90px_56px_130px_110px] gap-4 px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-slate-400">
                    {ticket.id}
                  </span>
                  {ticket.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                  {ticket.subject}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ticket.customerName}
                </p>
              </div>

              <div className="flex items-center">
                <StatusBadge status={ticket.status} />
              </div>

              <div className="flex items-center">
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="flex items-center">
                <ChannelIcon channel={ticket.channel} size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
                    {getInitials(ticket.assignedAgent)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-600 truncate">
                  {ticket.assignedAgent}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-xs text-slate-500">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>Showing 1–{mockTickets.length} of {mockTickets.length} tickets</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
