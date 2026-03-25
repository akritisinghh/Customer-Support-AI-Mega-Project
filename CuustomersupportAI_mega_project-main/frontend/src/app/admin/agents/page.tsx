"use client";

import { UserPlus, Users, UserCheck, UserX } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import type { AgentStatus } from "@/types";

interface MockAgent {
  id: string;
  display_name: string;
  email: string;
  status: AgentStatus;
  skills: string[];
  active_tickets: number;
}

const mockAgents: MockAgent[] = [
  {
    id: "ag-1",
    display_name: "Sarah Chen",
    email: "sarah.chen@company.com",
    status: "available",
    skills: ["Billing", "Technical", "Returns"],
    active_tickets: 4,
  },
  {
    id: "ag-2",
    display_name: "James Wilson",
    email: "james.wilson@company.com",
    status: "busy",
    skills: ["Technical", "API Support"],
    active_tickets: 7,
  },
  {
    id: "ag-3",
    display_name: "Maria Garcia",
    email: "maria.garcia@company.com",
    status: "available",
    skills: ["Onboarding", "Billing"],
    active_tickets: 2,
  },
  {
    id: "ag-4",
    display_name: "Alex Patel",
    email: "alex.patel@company.com",
    status: "offline",
    skills: ["Technical", "Escalations", "Security"],
    active_tickets: 0,
  },
  {
    id: "ag-5",
    display_name: "Emily Tanaka",
    email: "emily.tanaka@company.com",
    status: "busy",
    skills: ["Returns", "General"],
    active_tickets: 5,
  },
  {
    id: "ag-6",
    display_name: "David Kim",
    email: "david.kim@company.com",
    status: "available",
    skills: ["Technical", "Billing", "API Support"],
    active_tickets: 3,
  },
  {
    id: "ag-7",
    display_name: "Priya Sharma",
    email: "priya.sharma@company.com",
    status: "offline",
    skills: ["Onboarding", "General"],
    active_tickets: 0,
  },
  {
    id: "ag-8",
    display_name: "Tom Anderson",
    email: "tom.anderson@company.com",
    status: "busy",
    skills: ["Escalations", "Security", "Technical"],
    active_tickets: 6,
  },
];

const statusDot: Record<AgentStatus, string> = {
  available: "bg-green-500",
  busy: "bg-amber-500",
  offline: "bg-slate-300",
};

const statusLabel: Record<AgentStatus, string> = {
  available: "Available",
  busy: "Busy",
  offline: "Offline",
};

export default function AgentsPage() {
  const counts = {
    available: mockAgents.filter((a) => a.status === "available").length,
    busy: mockAgents.filter((a) => a.status === "busy").length,
    offline: mockAgents.filter((a) => a.status === "offline").length,
  };

  return (
    <>
      <Header
        title="Agents"
        subtitle="Manage your support team"
        actions={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Agent
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Status pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {counts.available} Available
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {counts.busy} Busy
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-4 py-2">
              <UserX className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                {counts.offline} Offline
              </span>
            </div>
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {mockAgents.map((agent) => (
              <Card
                key={agent.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="text-sm">
                          {getInitials(agent.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                          statusDot[agent.status]
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {agent.display_name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {agent.email}
                      </p>
                      <p className="text-xs mt-0.5 text-slate-400">
                        {statusLabel[agent.status]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {agent.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-[11px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Active Tickets</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {agent.active_tickets}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
