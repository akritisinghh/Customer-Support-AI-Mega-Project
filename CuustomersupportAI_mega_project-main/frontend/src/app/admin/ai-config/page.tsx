"use client";

import { Brain, Save, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const models = [
  { id: "gpt-4", label: "GPT-4", selected: true },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", selected: false },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", selected: false },
];

const ragSettings = [
  { label: "Top K Results", value: "5", description: "Number of chunks retrieved per query" },
  { label: "Score Threshold", value: "0.78", description: "Minimum similarity score for relevance" },
  { label: "Chunk Size", value: "512 tokens", description: "Token size per document chunk" },
  { label: "Chunk Overlap", value: "64 tokens", description: "Overlap between adjacent chunks" },
];

const copilotFeatures = [
  { label: "Suggested Replies", description: "AI generates reply options for agents", enabled: true },
  { label: "Auto-Summarization", description: "Conversations are summarized automatically", enabled: true },
  { label: "Troubleshooting Steps", description: "AI suggests diagnostic steps for issues", enabled: false },
  { label: "Sentiment Detection", description: "Real-time sentiment analysis on messages", enabled: true },
  { label: "Smart Routing", description: "AI routes tickets to best-fit agents", enabled: true },
];

export default function AIConfigPage() {
  return (
    <>
      <Header title="AI Configuration" subtitle="Manage AI model and RAG settings" />
      <PageContainer>
        <div className="space-y-6 max-w-4xl">
          {/* Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-600" />
                Model Settings
              </CardTitle>
              <CardDescription>
                Select the primary LLM and tune generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Primary Model
                </label>
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      className={cn(
                        "px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                        m.selected
                          ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Temperature
                  </label>
                  <span className="text-sm font-semibold text-brand-600">
                    0.3
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: "30%" }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                  <span>Precise (0)</span>
                  <span>Creative (1)</span>
                </div>
              </div>

              {/* Max tokens */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Max Tokens
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: "50%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-16 text-right">
                    2,048
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RAG Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                RAG Settings
              </CardTitle>
              <CardDescription>
                Configure retrieval-augmented generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ragSettings.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold text-brand-600">
                        {s.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{s.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Copilot Features */}
          <Card>
            <CardHeader>
              <CardTitle>Copilot Features</CardTitle>
              <CardDescription>
                Enable or disable AI-assisted agent capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {copilotFeatures.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {f.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {f.description}
                      </p>
                    </div>
                    <Badge variant={f.enabled ? "success" : "secondary"}>
                      {f.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end pb-4">
            <Button size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
