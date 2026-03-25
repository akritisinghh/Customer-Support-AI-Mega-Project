"use client";

import { useState } from "react";
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Globe,
  Code2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { DocumentStatus } from "@/types";

interface MockDocument {
  id: string;
  title: string;
  source_type: "upload" | "url" | "api";
  status: DocumentStatus;
  version: number;
  chunk_count: number;
  updated_at: string;
}

const mockDocuments: MockDocument[] = [
  {
    id: "doc-1",
    title: "Product User Guide v3.2",
    source_type: "upload",
    status: "ready",
    version: 3,
    chunk_count: 142,
    updated_at: "2026-03-20T10:30:00Z",
  },
  {
    id: "doc-2",
    title: "API Reference Documentation",
    source_type: "url",
    status: "ready",
    version: 5,
    chunk_count: 218,
    updated_at: "2026-03-19T15:00:00Z",
  },
  {
    id: "doc-3",
    title: "Troubleshooting FAQ",
    source_type: "upload",
    status: "ready",
    version: 2,
    chunk_count: 87,
    updated_at: "2026-03-18T09:20:00Z",
  },
  {
    id: "doc-4",
    title: "Billing & Payments Guide",
    source_type: "upload",
    status: "processing",
    version: 1,
    chunk_count: 0,
    updated_at: "2026-03-22T14:00:00Z",
  },
  {
    id: "doc-5",
    title: "Knowledge Base - Returns Policy",
    source_type: "url",
    status: "ready",
    version: 4,
    chunk_count: 63,
    updated_at: "2026-03-17T12:45:00Z",
  },
  {
    id: "doc-6",
    title: "Internal Escalation Procedures",
    source_type: "upload",
    status: "failed",
    version: 1,
    chunk_count: 0,
    updated_at: "2026-03-21T08:30:00Z",
  },
  {
    id: "doc-7",
    title: "CRM Integration Specs",
    source_type: "api",
    status: "ready",
    version: 2,
    chunk_count: 54,
    updated_at: "2026-03-16T17:15:00Z",
  },
  {
    id: "doc-8",
    title: "Onboarding Welcome Sequence",
    source_type: "upload",
    status: "pending",
    version: 1,
    chunk_count: 0,
    updated_at: "2026-03-22T13:50:00Z",
  },
];

const sourceTypeIcons: Record<string, React.ElementType> = {
  upload: FileText,
  url: Globe,
  api: Code2,
};

const statusConfig: Record<
  DocumentStatus,
  { icon: React.ElementType; label: string; variant: "success" | "default" | "warning" | "destructive" }
> = {
  ready: { icon: CheckCircle2, label: "Ready", variant: "success" },
  processing: { icon: Loader2, label: "Processing", variant: "default" },
  pending: { icon: Clock, label: "Pending", variant: "warning" },
  failed: { icon: AlertCircle, label: "Failed", variant: "destructive" },
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");

  const filtered = mockDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: mockDocuments.length,
    ready: mockDocuments.filter((d) => d.status === "ready").length,
    processing: mockDocuments.filter((d) => d.status === "processing").length,
    failed: mockDocuments.filter((d) => d.status === "failed").length,
  };

  return (
    <>
      <Header
        title="Knowledge Base"
        subtitle="Manage documents for AI retrieval"
        actions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Documents" value={counts.total} icon={BookOpen} />
            <StatCard
              title="Ready"
              value={counts.ready}
              icon={CheckCircle2}
              changeType="positive"
              change="Indexed & searchable"
            />
            <StatCard
              title="Processing"
              value={counts.processing}
              icon={Loader2}
              changeType="neutral"
              change="Chunking in progress"
            />
            <StatCard
              title="Failed"
              value={counts.failed}
              icon={AlertCircle}
              changeType="negative"
              change="Requires attention"
            />
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left font-medium text-slate-500 px-6 py-3">
                        Title
                      </th>
                      <th className="text-left font-medium text-slate-500 px-6 py-3">
                        Source
                      </th>
                      <th className="text-left font-medium text-slate-500 px-6 py-3">
                        Status
                      </th>
                      <th className="text-center font-medium text-slate-500 px-6 py-3">
                        Version
                      </th>
                      <th className="text-center font-medium text-slate-500 px-6 py-3">
                        Chunks
                      </th>
                      <th className="text-right font-medium text-slate-500 px-6 py-3">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((doc) => {
                      const SourceIcon = sourceTypeIcons[doc.source_type];
                      const sc = statusConfig[doc.status];
                      const StatusIcon = sc.icon;
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                <SourceIcon className="h-4 w-4 text-slate-500" />
                              </div>
                              <span className="font-medium text-slate-900">
                                {doc.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">
                              {doc.source_type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={sc.variant} className="gap-1">
                              <StatusIcon
                                className={`h-3 w-3 ${
                                  doc.status === "processing" ? "animate-spin" : ""
                                }`}
                              />
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            v{doc.version}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            {doc.chunk_count || "—"}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500">
                            {formatDate(doc.updated_at)}
                          </td>
                        </tr>
                      );
                    })}
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
