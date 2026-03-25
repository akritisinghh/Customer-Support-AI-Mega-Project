"use client";

import {
  Star,
  Clock,
  Zap,
  MessageSquare,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

const topAgents = [
  {
    name: "Sarah Chen",
    resolved: 187,
    avgResponse: "1.2m",
    csat: 4.9,
  },
  {
    name: "David Kim",
    resolved: 164,
    avgResponse: "1.5m",
    csat: 4.8,
  },
  {
    name: "Maria Garcia",
    resolved: 152,
    avgResponse: "1.8m",
    csat: 4.7,
  },
  {
    name: "James Wilson",
    resolved: 141,
    avgResponse: "2.1m",
    csat: 4.6,
  },
  {
    name: "Emily Tanaka",
    resolved: 128,
    avgResponse: "1.9m",
    csat: 4.5,
  },
];

const chartPlaceholders = [
  {
    title: "Sentiment Over Time",
    icon: TrendingUp,
    description: "Tracking positive, neutral, and negative sentiment trends",
    height: "h-52",
  },
  {
    title: "Conversations by Channel",
    icon: PieChart,
    description: "Distribution of conversations across all channels",
    height: "h-52",
  },
  {
    title: "Resolution Rate",
    icon: BarChart3,
    description: "AI vs human resolution rates over the past 30 days",
    height: "h-52",
  },
  {
    title: "Agent Performance",
    icon: Users,
    description: "Response time and resolution metrics per agent",
    height: "h-52",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <Header
        title="Analytics"
        subtitle="Insights and performance metrics"
        actions={
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Mar 1 – Mar 22, 2026
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Top stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="CSAT Score"
              value="4.6 / 5"
              change="+0.3 vs last period"
              changeType="positive"
              icon={Star}
            />
            <StatCard
              title="Avg Resolution Time"
              value="18.4m"
              change="-12% improvement"
              changeType="positive"
              icon={Clock}
            />
            <StatCard
              title="First Response Time"
              value="1.2m"
              change="-28% improvement"
              changeType="positive"
              icon={Zap}
            />
            <StatCard
              title="Total Conversations"
              value="5,114"
              change="+12.3% vs last period"
              changeType="positive"
              icon={MessageSquare}
            />
          </div>

          {/* Chart placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chartPlaceholders.map((chart) => {
              const ChartIcon = chart.icon;
              return (
                <Card key={chart.title}>
                  <CardHeader>
                    <CardTitle className="text-base">{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`${chart.height} rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-3`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                        <ChartIcon className="h-6 w-6 text-brand-600" />
                      </div>
                      <p className="text-sm text-slate-400 text-center max-w-xs">
                        {chart.description}
                      </p>
                      <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                        Chart coming soon
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Top Performing Agents */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left font-medium text-slate-500 pb-3 pr-4">
                        Rank
                      </th>
                      <th className="text-left font-medium text-slate-500 pb-3 pr-4">
                        Agent
                      </th>
                      <th className="text-center font-medium text-slate-500 pb-3 pr-4">
                        Resolved Tickets
                      </th>
                      <th className="text-center font-medium text-slate-500 pb-3 pr-4">
                        Avg Response Time
                      </th>
                      <th className="text-center font-medium text-slate-500 pb-3">
                        CSAT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topAgents.map((agent, i) => (
                      <tr
                        key={agent.name}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(agent.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">
                              {agent.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center font-semibold text-slate-900">
                          {agent.resolved}
                        </td>
                        <td className="py-3 pr-4 text-center text-slate-600">
                          {agent.avgResponse}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {agent.csat}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
