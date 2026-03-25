"use client";

import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface MockApiKey {
  id: string;
  name: string;
  key_preview: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
}

const mockKeys: MockApiKey[] = [
  {
    id: "key-1",
    name: "Production - Main Backend",
    key_preview: "sk-prod-...a8f3",
    scopes: ["conversations:read", "conversations:write", "tickets:read"],
    created_at: "2026-01-15T10:00:00Z",
    last_used_at: "2026-03-22T13:42:00Z",
  },
  {
    id: "key-2",
    name: "Mobile App - iOS",
    key_preview: "sk-mob-...c7d1",
    scopes: ["conversations:read", "tickets:read", "tickets:write"],
    created_at: "2026-02-03T09:30:00Z",
    last_used_at: "2026-03-22T12:15:00Z",
  },
  {
    id: "key-3",
    name: "Analytics Dashboard",
    key_preview: "sk-ana-...e2b5",
    scopes: ["analytics:read"],
    created_at: "2026-02-20T14:00:00Z",
    last_used_at: "2026-03-21T18:30:00Z",
  },
  {
    id: "key-4",
    name: "CRM Integration - Salesforce",
    key_preview: "sk-crm-...f9a2",
    scopes: ["conversations:read", "tickets:read", "customers:read", "webhooks:write"],
    created_at: "2026-03-01T11:00:00Z",
    last_used_at: "2026-03-22T10:05:00Z",
  },
  {
    id: "key-5",
    name: "Staging Environment",
    key_preview: "sk-stg-...d4e8",
    scopes: ["conversations:read", "conversations:write", "tickets:read", "tickets:write"],
    created_at: "2026-03-10T16:00:00Z",
    last_used_at: null,
  },
];

export default function ApiKeysPage() {
  return (
    <>
      <Header
        title="API Keys"
        subtitle="Manage API keys for integrations and services"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        }
      />
      <PageContainer>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="text-left font-medium text-slate-500 px-6 py-3">
                      Name
                    </th>
                    <th className="text-left font-medium text-slate-500 px-6 py-3">
                      Key
                    </th>
                    <th className="text-left font-medium text-slate-500 px-6 py-3">
                      Scopes
                    </th>
                    <th className="text-left font-medium text-slate-500 px-6 py-3">
                      Created
                    </th>
                    <th className="text-left font-medium text-slate-500 px-6 py-3">
                      Last Used
                    </th>
                    <th className="text-right font-medium text-slate-500 px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                            <KeyRound className="h-4 w-4 text-brand-600" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {key.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600">
                          {key.key_preview}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {key.scopes.map((scope) => (
                            <Badge
                              key={scope}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {key.last_used_at
                          ? formatDate(key.last_used_at)
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </>
  );
}
